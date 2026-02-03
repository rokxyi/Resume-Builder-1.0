from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid


class ResumeFile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    file_path: str
    file_name: str
    file_type: str
    file_size: int
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class JobApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_title: str
    company: str
    job_description: str
    job_description_file: Optional[str] = None
    base_resumes: List[ResumeFile] = []
    ai_model: str
    formatting_preference: Optional[str] = None
    status: str = "draft"
    generated_resume_path: Optional[str] = None
    analysis: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class JobApplicationCreate(BaseModel):
    job_title: str
    company: str
    job_description: str
    job_description_file: Optional[str] = None
    ai_model: str
    formatting_preference: Optional[str] = None


class JobApplicationUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    job_description: Optional[str] = None
    ai_model: Optional[str] = None
    formatting_preference: Optional[str] = None
    status: Optional[str] = None


class GenerateResumeRequest(BaseModel):
    application_id: str


class AIModel(BaseModel):
    provider: str
    model_id: str
    display_name: str
    description: str


class UploadResponse(BaseModel):
    file_id: str
    file_name: str
    file_path: str
    file_type: str
    file_size: int
