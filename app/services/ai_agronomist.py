from typing import Dict, List, Optional
from app.core.config import settings
import httpx
import json

class AIAgronomist:
    """AI-powered agronomist using Google Gemini REST API"""

    def __init__(self):
        self.api_key = settings.google_gemini_api_key
        
        if not self.api_key:
            raise ValueError("GOOGLE_GEMINI_API_KEY must be set")

    def _create_system_prompt(self) -> str:
        """Base system prompt for AI agronomist"""
        return """You are an expert agricultural advisor specializing in East African farming,
particularly Uganda. You provide practical, actionable advice to smallholder farmers based on
soil test data and weather conditions.

Your responses must be:
1. SHORT and SMS-friendly (max 160 characters per message)
2. Written in simple English that farmers understand
3. Practical and immediately actionable
4. Focused on crops suitable for Uganda
5. Consider local context (budget, resources, climate)

Common crops in Uganda: Maize, Beans, Coffee, Cassava, Bananas, Tomatoes, Sweet Potatoes,
Groundnuts, Sorghum, Millet.

When giving advice, consider:
- Soil pH, moisture, nutrients (N, P, K)
- Current weather and forecast
- Seasonal timing
- Local availability of inputs
- Budget constraints of smallholder farmers
"""

    async def get_crop_recommendations(
        self,
        soil_data: Dict,
        weather_data: Dict
    ) -> str:
        """Get top 3 crop recommendations with brief reasoning"""

        prompt = f"""Based on this data, recommend the TOP 3 crops for this farmer:

SOIL DATA:
- pH: {soil_data['ph']}
- Moisture: {soil_data['moisture']}%
- Temperature: {soil_data['temperature']}°C
- Nitrogen: {soil_data['nitrogen']} mg/kg
- Phosphorus: {soil_data['phosphorus']} mg/kg
- Potassium: {soil_data['potassium']} mg/kg

WEATHER (Next 5 days):
- {weather_data['forecast']['summary']}
- Average temp: {weather_data['forecast']['avg_temperature']}°C
- Total rainfall: {weather_data['forecast']['total_rainfall_mm']}mm
- Location: {weather_data['location']}

Respond in this EXACT format (max 160 chars total):
1. CROP1 (score/100): reason
2. CROP2 (score/100): reason
3. CROP3 (score/100): reason

Keep each line under 50 characters!"""

        return await self._generate(prompt)

    async def check_specific_crop(
        self,
        crop_name: str,
        soil_data: Dict,
        weather_data: Dict
    ) -> str:
        """Check if specific crop is suitable and give advice"""

        prompt = f"""A farmer wants to grow {crop_name.upper()}. Analyze if it's suitable:

SOIL DATA:
- pH: {soil_data['ph']}
- Moisture: {soil_data['moisture']}%
- Temperature: {soil_data['temperature']}°C
- Nitrogen: {soil_data['nitrogen']} mg/kg
- Phosphorus: {soil_data['phosphorus']} mg/kg
- Potassium: {soil_data['potassium']} mg/kg

WEATHER:
- {weather_data['forecast']['summary']}

Respond in this format (max 2 SMS = 320 chars total):
✓/✗ {crop_name} is SUITABLE/NOT SUITABLE (score/100)

ADVICE:
- Point 1
- Point 2
- Point 3

Be specific about fertilizers, lime, irrigation needs. Use simple language!"""

        return await self._generate(prompt)

    async def get_fertilizer_advice(
        self,
        soil_data: Dict,
        target_crop: Optional[str] = None
    ) -> str:
        """Get specific fertilizer/soil treatment recommendations"""

        crop_context = f"for growing {target_crop}" if target_crop else "generally"

        prompt = f"""Give fertilizer recommendations {crop_context}:

SOIL DATA:
- pH: {soil_data['ph']}
- Nitrogen: {soil_data['nitrogen']} mg/kg
- Phosphorus: {soil_data['phosphorus']} mg/kg
- Potassium: {soil_data['potassium']} mg/kg

Respond in max 160 characters:
FERTILIZER NEEDED:
- [specific product or NPK ratio]
- [quantity per acre]
- [application method]

Be specific! Use locally available products in Uganda!"""

        return await self._generate(prompt)

    async def _generate(self, prompt: str) -> str:
        """Generate response using Google Gemini REST API"""

        try:
            print(f"[DEBUG] Using Google Gemini REST API")
            full_prompt = self._create_system_prompt() + "\n\n" + prompt
            print(f"[DEBUG] Calling Gemini API...")
            
            async with httpx.AsyncClient() as client:
                # Use gemini-2.0-flash (latest and fastest)
                # Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
                model_name = "gemini-2.0-flash"
                url = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent"
                
                request_body = {
                    "contents": [{
                        "parts": [{
                            "text": full_prompt
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 200
                    }
                }
                
                # Retry logic for rate limiting
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        response = await client.post(
                            url,
                            json=request_body,
                            params={"key": self.api_key},
                            timeout=30.0
                        )
                        
                        response.raise_for_status()
                        result = response.json()
                        
                        # Extract text from response
                        if "candidates" in result and len(result["candidates"]) > 0:
                            candidate = result["candidates"][0]
                            if "content" in candidate and "parts" in candidate["content"]:
                                text = candidate["content"]["parts"][0]["text"]
                                print(f"[DEBUG] Gemini response: {text[:100]}...")
                                return text.strip()
                        
                        print(f"[DEBUG] No text in Gemini response: {result}")
                        return "Unable to generate recommendations at this time."
                    
                    except httpx.HTTPStatusError as http_err:
                        if response.status_code == 429:  # Rate limited
                            if attempt < max_retries - 1:
                                wait_time = (2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
                                print(f"[WARNING] Rate limited (429). Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                                import asyncio
                                await asyncio.sleep(wait_time)
                                continue
                            else:
                                raise http_err
                        else:
                            raise http_err
                
        except Exception as e:
            import traceback
            print(f"[ERROR] AI generation error: {e}")
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            return "AI service temporarily unavailable. Please try again later."

ai_agronomist = AIAgronomist()
