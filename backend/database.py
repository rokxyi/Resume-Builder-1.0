import aiosqlite
import logging
from config import settings

logger = logging.getLogger(__name__)

async def get_db():
    """Get database connection context manager."""
    try:
        async with aiosqlite.connect(str(settings.DB_PATH)) as db:
            db.row_factory = aiosqlite.Row
            yield db
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

async def init_database():
    """Initialize SQLite database with required tables."""
    try:
        async with aiosqlite.connect(str(settings.DB_PATH)) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS applications (
                    id TEXT PRIMARY KEY,
                    job_title TEXT NOT NULL,
                    company TEXT NOT NULL,
                    job_description TEXT NOT NULL,
                    ai_model TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    generated_resume_path TEXT,
                    analysis TEXT,
                    formatting_preference TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS base_resumes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    application_id TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_name TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    uploaded_at TEXT NOT NULL,
                    FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
                )
            """)
            
            await db.commit()
            logger.info(f"Database initialized at {settings.DB_PATH}")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
