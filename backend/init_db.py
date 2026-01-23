"""
Database initialization script for Smart Soil Platform
Creates SQLite database and tables on first run
"""

from app.core.database import engine, Base
from app.models.database_models import (
    Farmer, Device, SoilTest, Recommendation, SMSLog, SMSSession
)

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully!")
    print("Database file: smart_soil.db")

if __name__ == "__main__":
    init_db()
