from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from app.models.database_models import Farmer, SMSLog, SMSSession
from app.core.database import get_db
from app.services.weather_service import weather_service
from app.services.ai_agronomist import ai_agronomist
from app.services.sms_service import sms_service

router = APIRouter()

@router.post("/receive")
async def receive_sms(request: Request, db: Session = Depends(get_db)):
    """Webhook to receive SMS from Telerivet"""

    payload = await request.json()

    from_number = payload.get("from_number", "")
    content = payload.get("content", "").strip()

    # Find farmer by phone
    farmer = db.query(Farmer).filter(Farmer.phone_number == from_number).first()

    if not farmer:
        # Unknown number
        await sms_service.send_sms(
            from_number,
            "Phone number not registered. Contact B&J Agrotech support."
        )
        return {"status": "error", "message": "Unknown number"}

    # Log incoming SMS
    sms_log = SMSLog(
        farmer_id=farmer.id,
        direction="inbound",
        phone_number=from_number,
        message=content,
        status="received"
    )
    db.add(sms_log)

    # Get active session
    session = db.query(SMSSession)\
        .filter(SMSSession.farmer_id == farmer.id)\
        .order_by(SMSSession.created_at.desc())\
        .first()

    if not session:
        db.commit()
        await sms_service.send_sms(
            from_number,
            "No active session. Please run a soil test first."
        )
        return {"status": "no_session"}

    soil_test = session.soil_test

    # Prepare soil data
    soil_data = {
        "ph": soil_test.ph,
        "moisture": soil_test.moisture,
        "temperature": soil_test.temperature,
        "nitrogen": soil_test.nitrogen,
        "phosphorus": soil_test.phosphorus,
        "potassium": soil_test.potassium
    }

    # Get weather data
    weather_data = await weather_service.get_weather_data(
        soil_test.latitude,
        soil_test.longitude
    )

    # Handle user response
    response_message = ""
    content_upper = content.upper()

    if content_upper in ["1", "ONE"]:
        # AI crop suggestions
        response_message = await ai_agronomist.get_crop_recommendations(
            soil_data,
            weather_data
        )

        # Update session
        session.state = "completed"

    elif content_upper in ["2", "TWO"]:
        # Ask for crop name
        response_message = "Which crop? Reply: MAIZE, BEANS, COFFEE, CASSAVA, BANANAS, TOMATOES, etc."
        session.state = "awaiting_crop"

    elif content_upper in ["3", "THREE"]:
        # Fertilizer advice
        response_message = await ai_agronomist.get_fertilizer_advice(soil_data)
        session.state = "completed"

    elif session.state == "awaiting_crop":
        # User sent crop name - check it
        response_message = await ai_agronomist.check_specific_crop(
            content_upper,
            soil_data,
            weather_data
        )
        session.state = "completed"

    else:
        response_message = "Invalid option. Reply:\n1-Crop suggestions\n2-Check your crop\n3-Fertilizer advice"

    # Commit session changes
    db.commit()

    # Send response
    if response_message:
        await sms_service.send_sms(from_number, response_message, farmer.id, db)

    return {"status": "success", "action": "processed"}
