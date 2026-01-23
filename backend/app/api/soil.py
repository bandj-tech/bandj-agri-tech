from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from app.models.schemas import SoilDataUpload
from app.models.database_models import Device, SoilTest, Recommendation, SMSSession
from app.core.database import get_db
from app.services.weather_service import weather_service
from app.services.ai_agronomist import ai_agronomist
from app.services.sms_service import sms_service

router = APIRouter()

@router.post("/upload")
async def upload_soil_data(
    data: SoilDataUpload,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Receive soil data from IoT device"""

    # Verify device token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]

    # Verify device exists
    device = db.query(Device).filter(
        Device.api_token == token,
        Device.is_active == True
    ).first()

    if not device:
        raise HTTPException(status_code=401, detail="Invalid device token")

    farmer = device.farmer

    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found for this device")

    # Get weather data for location
    weather_data = await weather_service.get_weather_data(
        data.gps_latitude,
        data.gps_longitude
    )

    # Create soil test data
    soil_test = SoilTest(
        device_id=device.id,
        farmer_id=farmer.id,
        timestamp=data.timestamp,
        latitude=data.gps_latitude,
        longitude=data.gps_longitude,
        ph=data.soil_ph,
        moisture=data.soil_moisture_percent,
        temperature=data.soil_temperature_c,
        ec=0,  # Not in new data structure
        nitrogen=data.soil_nitrogen_mgkg,
        phosphorus=data.soil_phosphorus_mgkg,
        potassium=data.soil_potassium_mgkg,
        location_name=weather_data["location"],
        sample_number=data.sample_number,
        sample_depth_cm=data.sample_depth_cm
    )
    db.add(soil_test)
    db.flush()  # Flush to get the ID without committing

    soil_test_id = soil_test.id

    # Prepare data for AI
    soil_data_dict = {
        "ph": data.soil_ph,
        "moisture": data.soil_moisture_percent,
        "temperature": data.soil_temperature_c,
        "nitrogen": data.soil_nitrogen_mgkg,
        "phosphorus": data.soil_phosphorus_mgkg,
        "potassium": data.soil_potassium_mgkg
    }

    # Generate AI recommendations
    recommendations_text = "AI recommendations temporarily unavailable"
    try:
        print(f"\n[DEBUG] Starting AI analysis...")
        print(f"[DEBUG] Soil data: {soil_data_dict}")
        print(f"[DEBUG] Weather data keys: {weather_data.keys()}")
        
        recommendations_text = await ai_agronomist.get_crop_recommendations(
            soil_data_dict,
            weather_data
        )
        
        print(f"[DEBUG] AI response received: {recommendations_text[:100]}...")

        # Store recommendations
        recommendation = Recommendation(
            soil_test_id=soil_test_id,
            recommendation_type="crop_suggestion",
            content=recommendations_text,
            crops_suggested={"ai_response": recommendations_text}
        )
        db.add(recommendation)
        print(f"[DEBUG] Recommendation saved to DB")
    except Exception as e:
        import traceback
        print(f"\n[ERROR] AI recommendation error: {e}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")

    # Create SMS session
    sms_session = SMSSession(
        farmer_id=farmer.id,
        soil_test_id=soil_test_id,
        state="awaiting_choice"
    )
    db.add(sms_session)

    # Commit all changes
    db.commit()

    # Send initial SMS
    sms_message = sms_service.generate_initial_sms(
        farmer.name,
        farmer.pin,
        weather_data["location"]
    )

    await sms_service.send_sms(
        data.phone_number,  # Use phone from device data
        sms_message,
        farmer.id,
        db
    )

    return {
        "status": "success",
        "soil_test_id": soil_test_id,
        "location": weather_data["location"],
        "weather_summary": weather_data["forecast"]["summary"],
        "message": "Data received, weather fetched, AI analyzed, SMS sent to farmer"
    }

