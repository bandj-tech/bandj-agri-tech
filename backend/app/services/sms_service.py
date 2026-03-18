import httpx
from app.core.config import settings
from sqlalchemy.orm import Session
from typing import Optional
from app.models.database_models import SMSLog

class TelerivetSMSService:
    def __init__(self):
        self.api_key = settings.telerivet_api_key
        self.project_id = settings.telerivet_project_id
        self.base_url = "https://api.telerivet.com/v1"

    async def send_sms(self, phone_number: str, message: str, farmer_id: Optional[str] = None, db: Optional[Session] = None) -> dict:
        """Send SMS via Telerivet"""
        if not self.api_key or not self.project_id:
            err = {"status": "error", "message": "TELERIVET_API_KEY or TELERIVET_PROJECT_ID not set"}
            if db and farmer_id:
                sms_log = SMSLog(
                    farmer_id=farmer_id,
                    direction="outbound",
                    phone_number=phone_number,
                    message=message,
                    status="failed"
                )
                db.add(sms_log)
                db.commit()
            return err

        url = f"{self.base_url}/projects/{self.project_id}/messages/send"

        # Ensure phone number is E.164 with Uganda code
        if phone_number.startswith("+"):
            normalized = phone_number
        elif phone_number.startswith("256"):
            normalized = f"+{phone_number}"
        elif phone_number.startswith("0"):
            normalized = f"+256{phone_number.lstrip('0')}"
        else:
            normalized = f"+{phone_number}"
        phone_number = normalized

        # Split long messages (SMS is 160 chars)
        messages = self._split_message(message)
        results = []

        for msg in messages:
            payload = {
                "content": msg,
                "to_number": phone_number
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=payload,
                    auth=(self.api_key, "")
                )

            try:
                result = response.json()
            except Exception:
                result = {}

            if response.status_code >= 400:
                result = {
                    "status": "failed",
                    "http_status": response.status_code,
                    "error": result or response.text
                }
            results.append(result)

            # Log to database if db session provided
            if db and farmer_id:
                sms_log = SMSLog(
                    farmer_id=farmer_id,
                    direction="outbound",
                    phone_number=phone_number,
                    message=msg,
                    status=result.get("status") or "unknown",
                    telerivet_id=result.get("id")
                )
                db.add(sms_log)
        
        # Commit logs if db session provided
        if db:
            db.commit()

        return results[0] if results else {}

    def _split_message(self, message: str, max_length: int = 160) -> list:
        """Split long messages into SMS-sized chunks"""
        if len(message) <= max_length:
            return [message]

        # Split by paragraphs first
        parts = message.split('\n\n')
        messages = []
        current = ""

        for part in parts:
            if len(current) + len(part) + 2 <= max_length:
                current += part + "\n\n"
            else:
                if current:
                    messages.append(current.strip())
                current = part + "\n\n"

        if current:
            messages.append(current.strip())

        return messages

    def generate_initial_sms(self, farmer_name: str, pin: str, location: str) -> str:
        """Generate initial SMS after soil test"""
        return f"""Hello {farmer_name}! Soil test for {location} is ready.

Reply:
1 - AI crop suggestions
2 - Check your crop
3 - Fertilizer advice

PIN: {pin}"""

sms_service = TelerivetSMSService()

