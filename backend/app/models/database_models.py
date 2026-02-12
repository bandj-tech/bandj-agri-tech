from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Farmer(Base):
    __tablename__ = "farmers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    phone_number = Column(String(20), unique=True, nullable=False)
    region = Column(String(100))
    district = Column(String(100))
    pin = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    devices = relationship("Device", back_populates="farmer", cascade="all, delete-orphan")
    soil_tests = relationship("SoilTest", back_populates="farmer", cascade="all, delete-orphan")
    sms_logs = relationship("SMSLog", back_populates="farmer", cascade="all, delete-orphan")
    sms_sessions = relationship("SMSSession", back_populates="farmer", cascade="all, delete-orphan")

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    device_id = Column(String(100), unique=True, nullable=False)
    sim_number = Column(String(20))
    farmer_id = Column(String, ForeignKey("farmers.id", ondelete="CASCADE"))
    api_token = Column(String(255), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    farmer = relationship("Farmer", back_populates="devices")
    soil_tests = relationship("SoilTest", back_populates="device", cascade="all, delete-orphan")

class SoilTest(Base):
    __tablename__ = "soil_tests"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    device_id = Column(String, ForeignKey("devices.id", ondelete="CASCADE"))
    farmer_id = Column(String, ForeignKey("farmers.id", ondelete="CASCADE"))
    timestamp = Column(DateTime, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    sample_number = Column(Integer)
    sample_depth_cm = Column(Integer)
    temperature = Column(Float)  # soil temperature
    moisture = Column(Float)  # soil moisture percentage
    ph = Column(Float)
    ec = Column(Float, default=0)  # Electrical conductivity
    nitrogen = Column(Float)  # mg/kg
    phosphorus = Column(Float)  # mg/kg
    potassium = Column(Float)  # mg/kg
    location_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    device = relationship("Device", back_populates="soil_tests")
    farmer = relationship("Farmer", back_populates="soil_tests")
    recommendations = relationship("Recommendation", back_populates="soil_test", cascade="all, delete-orphan")
    sms_sessions = relationship("SMSSession", back_populates="soil_test", cascade="all, delete-orphan")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    soil_test_id = Column(String, ForeignKey("soil_tests.id", ondelete="CASCADE"))
    recommendation_type = Column(String(50))  # crop_suggestion, fertilizer_advice, etc.
    content = Column(Text)
    crops_suggested = Column(JSON)  # Store as JSON for flexibility
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    soil_test = relationship("SoilTest", back_populates="recommendations")

class SMSLog(Base):
    __tablename__ = "sms_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("farmers.id", ondelete="CASCADE"))
    direction = Column(String(20))  # inbound or outbound
    phone_number = Column(String(20))
    message = Column(Text)
    status = Column(String(50))  # sent, delivered, failed, received, etc.
    telerivet_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    farmer = relationship("Farmer", back_populates="sms_logs")

class SMSSession(Base):
    __tablename__ = "sms_sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("farmers.id", ondelete="CASCADE"))
    soil_test_id = Column(String, ForeignKey("soil_tests.id", ondelete="CASCADE"))
    state = Column(String(50))  # awaiting_choice, awaiting_crop, completed
    user_response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    farmer = relationship("Farmer", back_populates="sms_sessions")
    soil_test = relationship("SoilTest", back_populates="sms_sessions")

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
