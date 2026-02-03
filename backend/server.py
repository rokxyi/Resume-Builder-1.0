from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
import logging
from pathlib import Path
from typing import List
import aiofiles
import uuid
import json
from tenacity import RetryError
from google.api_core.exceptions import ResourceExhausted

from models import (
    JobApplication,
    JobApplicationCreate,
    JobApplicationUpdate,
    ResumeFile,
    AIModel,
    UploadResponse
)
from services.document_parser import DocumentParser
from services.llm_service import LLMService
from services.resume_generator import ResumeGenerator

# New imports
from config import settings, AIModelConfig
from database import init_database
from repositories.application_repo import ApplicationRepository

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan handler to initialize database and clean shutdown resources."""
    settings.ensure_directories()
    await init_database()
    try:
        yield
    finally:
        pass

app = FastAPI(lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize services
llm_service = LLMService()
document_parser = DocumentParser()
resume_generator = ResumeGenerator()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# --- Routes ---

@api_router.get("/")
async def root():
    return {"message": "Resume Tailoring API"}


@api_router.get("/models", response_model=List[AIModel])
async def get_models():
    """Get list of available AI models"""
    # Convert internal config to API model
    models = []
    for m in settings.AVAILABLE_MODELS:
        models.append(AIModel(
            provider=m.provider,
            model_id=m.model_id,
            display_name=m.display_name,
            description=m.description
        ))
    return models


@api_router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a file (resume or job description)"""
    try:
        # Validate file size (10MB limit)
        MAX_SIZE = 10 * 1024 * 1024
        content = await file.read()
        
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        
        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}")
        
        # Generate unique file name
        file_id = str(uuid.uuid4())
        file_path = settings.UPLOAD_DIR / f"{file_id}{file_ext}"
        
        # Save file
        try:
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
        except IOError as e:
            logger.error(f"IO Error saving file {file_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to save file to disk")
        
        return UploadResponse(
            file_id=file_id,
            file_name=file.filename,
            file_path=str(file_path),
            file_type=file.content_type or "application/octet-stream",
            file_size=len(content)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during upload")


@api_router.post("/applications", response_model=JobApplication)
async def create_application(app_data: JobApplicationCreate):
    """Create a new job application"""
    try:
        application = JobApplication(**app_data.model_dump())
        await ApplicationRepository.create(application)
        return application
    except Exception as e:
        logger.error(f"Error creating application: {e}")
        raise HTTPException(status_code=500, detail="Failed to create application")


@api_router.get("/applications", response_model=List[JobApplication])
async def get_applications():
    """Get all job applications"""
    try:
        apps = await ApplicationRepository.get_all()
        return apps  # FastAPI validates against List[JobApplication]
    except Exception as e:
        logger.error(f"Error getting applications: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve applications")


@api_router.get("/applications/{application_id}", response_model=JobApplication)
async def get_application(application_id: str):
    """Get a specific job application"""
    try:
        app = await ApplicationRepository.get_by_id(application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        return app
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting application: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve application")


@api_router.put("/applications/{application_id}", response_model=JobApplication)
async def update_application(application_id: str, update_data: JobApplicationUpdate):
    """Update a job application"""
    try:
        existing = await ApplicationRepository.get_by_id(application_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Filter None values
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if update_dict:
            await ApplicationRepository.update(application_id, update_dict)
        
        # Return updated
        updated = await ApplicationRepository.get_by_id(application_id)
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating application: {e}")
        raise HTTPException(status_code=500, detail="Failed to update application")


@api_router.post("/applications/{application_id}/add-resume")
async def add_resume_to_application(application_id: str, file: UploadFile = File(...)):
    """Add a resume file to an application"""
    try:
        # Check app exists
        existing = await ApplicationRepository.get_by_id(application_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Application not found")

        # Upload file (reuse upload logic)
        upload_response = await upload_file(file)
        
        resume_file = ResumeFile(
            file_path=upload_response.file_path,
            file_name=upload_response.file_name,
            file_type=upload_response.file_type,
            file_size=upload_response.file_size
        )
        
        await ApplicationRepository.add_resume(application_id, resume_file)
        
        return {"success": True, "resume": resume_file}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to add resume")


@api_router.post("/applications/{application_id}/generate")
async def generate_resume(application_id: str):
    """Generate a tailored resume for an application"""
    try:
        app = await ApplicationRepository.get_by_id(application_id)
        if not app:
             raise HTTPException(status_code=404, detail="Application not found")
        
        if not app.get('base_resumes'):
            raise HTTPException(status_code=400, detail="No base resumes uploaded")
        
        # Update status -> processing
        await ApplicationRepository.update(application_id, {"status": "processing"})
        
        try:
            # CMS Logic
            parsed_resumes = []
            for resume in app['base_resumes']:
                try:
                    text = await document_parser.parse_file(resume['file_path'], resume['file_type'])
                    parsed_resumes.append(text)
                except ValueError as ve:
                    logger.warning(f"Skipping unparseable resume {resume['file_name']}: {ve}")
                    continue # Skip bad files but try others
                except Exception as e:
                    logger.error(f"Error parsing resume {resume['file_name']}: {e}")
                    # Continue attempting others?
                    continue
            
            if not parsed_resumes:
                raise HTTPException(status_code=400, detail="Could not parse any provided resumes")
            
            # Generate
            try:
                llm_response = await llm_service.analyze_and_generate_resume(
                    job_description=app['job_description'],
                    base_resumes=parsed_resumes,
                    model_id=app['ai_model'],
                    session_id=application_id,
                    formatting_preference=app.get('formatting_preference')
                )
            except ValueError as ve:
                # Configuration error or invalid model
                raise HTTPException(status_code=400, detail=str(ve))
            
            # Parse & Create Docx
            parsed_response = resume_generator._parse_llm_response(llm_response['raw_response'])
            
            if "error" in parsed_response:
                # LLM failed to produce valid JSON
                logger.error(f"LLM JSON Parse Error: {parsed_response['error']}. Raw: {parsed_response.get('raw')}")
                raise HTTPException(status_code=500, detail="AI failed to generate structured data. Please try again.")

            output_filename = f"{application_id}.docx"
            output_path = settings.GENERATED_DIR / output_filename
            
            try:
                resume_generator.generate_docx(parsed_response, str(output_path))
            except Exception as e:
                logger.error(f"DOCX Generation Error: {e}")
                raise HTTPException(status_code=500, detail="Failed to generate DOCX file")
            
            # Update Success
            await ApplicationRepository.update(application_id, {
                "status": "completed",
                "generated_resume_path": str(output_path),
                "analysis": json.dumps(parsed_response.get('analysis', {}))
            })
            
            return {
                "success": True,
                "message": "Resume generated successfully",
                "download_url": f"/api/applications/{application_id}/download",
                "analysis": parsed_response.get('analysis', {})
            }
            
        except (RetryError, ResourceExhausted):
            await ApplicationRepository.update(application_id, {"status": "failed"})
            logger.warning(f"Rate limit exceeded for application {application_id}")
            raise HTTPException(
                status_code=429, 
                detail="AI Rate Limit Exceeded. You have likely hit the daily quota for the free tier. Please try again tomorrow or upgrade your API key."
            )
        except HTTPException:
            await ApplicationRepository.update(application_id, {"status": "failed"})
            raise
        except Exception as e:
            await ApplicationRepository.update(application_id, {"status": "failed"})
            logger.exception(f"Unexpected error in generation flow: {e}")
            raise HTTPException(status_code=500, detail=f"Error generating resume: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating resume: {str(e)}")


@api_router.get("/applications/{application_id}/download")
async def download_resume(application_id: str):
    """Download the generated resume"""
    try:
        app = await ApplicationRepository.get_by_id(application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        path_str = app.get('generated_resume_path')
        if not path_str:
            raise HTTPException(status_code=404, detail="No resume generated yet")
            
        file_path = Path(path_str)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Resume file not found")
            
        return FileResponse(
            path=file_path,
            filename=f"{app['job_title']}_{app['company']}_Resume.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to download resume")


@api_router.delete("/applications/{application_id}")
async def delete_application(application_id: str):
    """Delete a job application"""
    try:
        success = await ApplicationRepository.delete(application_id)
        if not success:
            raise HTTPException(status_code=404, detail="Application not found")
        return {"success": True, "message": "Application deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting application: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete application")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
