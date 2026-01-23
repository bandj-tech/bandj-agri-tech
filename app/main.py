from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import soil, sms, admin
from app.core.database import engine, Base
from app.models.database_models import (
    Farmer, Device, SoilTest, Recommendation, SMSLog, SMSSession
)

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Soil Platform API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(soil.router, prefix="/api/soil", tags=["soil"])
app.include_router(sms.router, prefix="/api/sms", tags=["sms"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "Smart Soil Platform API", "status": "running", "database": "SQLite"}

@app.get("/health")
async def health():
    return {"status": "healthy", "database": "connected"}

