from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.schemas import FarmerCreate, DeviceCreate
from app.models.database_models import Farmer, Device
from app.core.database import get_db
import secrets

router = APIRouter()

@router.post("/farmers")
async def create_farmer(farmer_data: FarmerCreate, db: Session = Depends(get_db)):
    """Create new farmer account"""

    # Generate random PIN
    pin = str(secrets.randbelow(900000) + 100000)  # 6 digits

    # Check if phone number already exists
    existing_farmer = db.query(Farmer).filter(Farmer.phone_number == farmer_data.phone_number).first()
    if existing_farmer:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    farmer = Farmer(
        name=farmer_data.name,
        phone_number=farmer_data.phone_number,
        region=farmer_data.region,
        district=farmer_data.district,
        pin=pin
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    return {"status": "success", "farmer": {
        "id": farmer.id,
        "name": farmer.name,
        "phone_number": farmer.phone_number,
        "region": farmer.region,
        "district": farmer.district,
        "pin": farmer.pin
    }}

@router.get("/farmers")
async def list_farmers(db: Session = Depends(get_db)):
    """List all farmers"""
    farmers = db.query(Farmer).all()
    return {"farmers": [{
        "id": f.id,
        "name": f.name,
        "phone_number": f.phone_number,
        "region": f.region,
        "district": f.district,
        "pin": f.pin,
        "created_at": f.created_at
    } for f in farmers]}

@router.post("/devices")
async def register_device(device_data: DeviceCreate, db: Session = Depends(get_db)):
    """Register new device"""

    # Verify farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == device_data.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Generate API token
    api_token = secrets.token_urlsafe(32)

    device = Device(
        device_id=device_data.device_id,
        sim_number=device_data.sim_number,
        farmer_id=device_data.farmer_id,
        api_token=api_token
    )
    db.add(device)
    db.commit()
    db.refresh(device)

    return {"status": "success", "device": {
        "id": device.id,
        "device_id": device.device_id,
        "sim_number": device.sim_number,
        "farmer_id": device.farmer_id,
        "is_active": device.is_active,
        "created_at": device.created_at
    }, "api_token": api_token}

@router.get("/soil-tests/{farmer_id}")
async def get_farmer_tests(farmer_id: str, db: Session = Depends(get_db)):
    """Get all soil tests for a farmer"""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    tests = farmer.soil_tests
    return {"tests": [{
        "id": t.id,
        "timestamp": t.timestamp,
        "location": t.location_name,
        "ph": t.ph,
        "moisture": t.moisture,
        "temperature": t.temperature,
        "nitrogen": t.nitrogen,
        "phosphorus": t.phosphorus,
        "potassium": t.potassium,
        "latitude": t.latitude,
        "longitude": t.longitude,
        "created_at": t.created_at,
        "recommendations": [{
            "id": r.id,
            "recommendation_type": r.recommendation_type,
            "content": r.content,
            "crops_suggested": r.crops_suggested
        } for r in t.recommendations]
    } for t in sorted(tests, key=lambda x: x.created_at, reverse=True)]}

@router.get("/sms-logs/{farmer_id}")
async def get_sms_logs(farmer_id: str, db: Session = Depends(get_db)):
    """Get SMS conversation history"""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    logs = farmer.sms_logs
    return {"logs": [{
        "id": l.id,
        "direction": l.direction,
        "phone_number": l.phone_number,
        "message": l.message,
        "status": l.status,
        "created_at": l.created_at
    } for l in sorted(logs, key=lambda x: x.created_at, reverse=True)]}

