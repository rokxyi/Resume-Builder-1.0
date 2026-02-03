import aiosqlite
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from models import JobApplication, ResumeFile, JobApplicationCreate, JobApplicationUpdate
from config import settings

logger = logging.getLogger(__name__)

class ApplicationRepository:
    """Repository for accessing application data in SQLite."""
    
    @staticmethod
    async def create(application: JobApplication) -> JobApplication:
        async with aiosqlite.connect(str(settings.DB_PATH)) as db:
            db.row_factory = aiosqlite.Row
            await db.execute(
                """
                INSERT INTO applications (id, job_title, company, job_description, ai_model, 
                                         status, formatting_preference, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    application.id,
                    application.job_title,
                    application.company,
                    application.job_description,
                    application.ai_model,
                    application.status,
                    application.formatting_preference,
                    application.created_at.isoformat(),
                    application.updated_at.isoformat()
                )
            )
            await db.commit()
        return application

    @staticmethod
    async def get_all() -> List[Dict[str, Any]]:
        async with aiosqlite.connect(str(settings.DB_PATH)) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM applications ORDER BY created_at DESC")
            rows = await cursor.fetchall()
            
            applications = []
            for row in rows:
                app_dict = dict(row)
                # Parse fields
                app_dict['created_at'] = datetime.fromisoformat(app_dict['created_at'])
                app_dict['updated_at'] = datetime.fromisoformat(app_dict['updated_at'])
                if app_dict.get('analysis'):
                    app_dict['analysis'] = json.loads(app_dict['analysis'])
                
                # Fetch resumes
                resume_cursor = await db.execute(
                    "SELECT * FROM base_resumes WHERE application_id = ?", 
                    (app_dict['id'],)
                )
                resume_rows = await resume_cursor.fetchall()
                app_dict['base_resumes'] = [
                    {
                        'file_path': r['file_path'],
                        'file_name': r['file_name'],
                        'file_type': r['file_type'],
                        'file_size': r['file_size'],
                        'uploaded_at': datetime.fromisoformat(r['uploaded_at'])
                    } for r in resume_rows
                ]
                applications.append(app_dict)
            return applications

    @staticmethod
    async def get_by_id(application_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(str(settings.DB_PATH)) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM applications WHERE id = ?", (application_id,))
            row = await cursor.fetchone()
            
            if not row:
                return None
            
            app_dict = dict(row)
            app_dict['created_at'] = datetime.fromisoformat(app_dict['created_at'])
            app_dict['updated_at'] = datetime.fromisoformat(app_dict['updated_at'])
            if app_dict.get('analysis'):
                app_dict['analysis'] = json.loads(app_dict['analysis'])
            
            resume_cursor = await db.execute(
                "SELECT * FROM base_resumes WHERE application_id = ?", 
                (application_id,)
            )
            resume_rows = await resume_cursor.fetchall()
            app_dict['base_resumes'] = [
                {
                    'file_path': r['file_path'],
                    'file_name': r['file_name'],
                    'file_type': r['file_type'],
                    'file_size': r['file_size'],
                    'uploaded_at': datetime.fromisoformat(r['uploaded_at'])
                } for r in resume_rows
            ]
            return app_dict

    @staticmethod
    async def update(application_id: str, update_data: Dict[str, Any]) -> bool:
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        set_clauses = []
        values = []
        for key, value in update_data.items():
            set_clauses.append(f"{key} = ?")
            values.append(value)
        values.append(application_id)
        
        async with aiosqlite.connect(str(settings.DB_PATH)) as db:
            await db.execute(
                f"UPDATE applications SET {', '.join(set_clauses)} WHERE id = ?",
                tuple(values)
            )
            await db.commit()
        return True

    @staticmethod
    async def delete(application_id: str) -> bool:
        async with aiosqlite.connect(str(settings.DB_PATH)) as db:
            cursor = await db.execute("DELETE FROM applications WHERE id = ?", (application_id,))
            await db.commit()
            return cursor.rowcount > 0

    @staticmethod
    async def add_resume(application_id: str, resume_file: ResumeFile) -> None:
        async with aiosqlite.connect(str(settings.DB_PATH)) as db:
            await db.execute(
                """
                INSERT INTO base_resumes (application_id, file_path, file_name, file_type, file_size, uploaded_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    application_id,
                    resume_file.file_path,
                    resume_file.file_name,
                    resume_file.file_type,
                    resume_file.file_size,
                    resume_file.uploaded_at.isoformat()
                )
            )
            await db.commit()
