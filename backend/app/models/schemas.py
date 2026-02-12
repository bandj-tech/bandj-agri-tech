from pydantic import BaseModel, EmailStr, field_validator
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

class AdminRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    registration_code: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")
        return value

    @field_validator("registration_code")
    @classmethod
    def validate_registration_code(cls, value: str) -> str:
        if len(value) != 6 or not value.isdigit():
            raise ValueError("Registration code must be a 6-digit number")
        return value

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminUserResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    created_at: datetime

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AdminUserResponse
