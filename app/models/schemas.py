from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class SoilDataUpload(BaseModel):
    device_id: str
    farmer_id: str
    phone_number: str
    timestamp: datetime
    gps_latitude: float
    gps_longitude: float
    sample_number: int
    sample_depth_cm: int
    soil_temperature_c: float
    soil_moisture_percent: float
    soil_nitrogen_mgkg: float
    soil_phosphorus_mgkg: float
    soil_potassium_mgkg: float
    soil_ph: float

class DeviceAuth(BaseModel):
    api_token: str

class FarmerCreate(BaseModel):
    name: str
    phone_number: str
    region: str
    district: str

class DeviceCreate(BaseModel):
    device_id: str
    sim_number: str
    farmer_id: str

class SMSWebhook(BaseModel):
    id: str
    from_number: str
    content: str
    time_created: int

class CropRecommendation(BaseModel):
    crop_name: str
    suitability_score: float
    reason: str

class RecommendationResponse(BaseModel):
    recommendations: List[CropRecommendation]
    summary: str
