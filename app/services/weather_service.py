import httpx
from app.core.config import settings
from typing import Dict, Optional
from datetime import datetime, timedelta

class WeatherService:
    """OpenWeather API integration"""

    def __init__(self):
        self.api_key = settings.openweather_api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"

    async def get_weather_data(self, latitude: float, longitude: float) -> Dict:
        """Get current weather and forecast for location"""

        try:
            async with httpx.AsyncClient() as client:
                # Current weather
                current_url = f"{self.base_url}/weather"
                current_params = {
                    "lat": latitude,
                    "lon": longitude,
                    "appid": self.api_key,
                    "units": "metric"
                }
                current_response = await client.get(current_url, params=current_params)
                current_data = current_response.json()

                # 5-day forecast (free tier)
                forecast_url = f"{self.base_url}/forecast"
                forecast_params = {
                    "lat": latitude,
                    "lon": longitude,
                    "appid": self.api_key,
                    "units": "metric"
                }
                forecast_response = await client.get(forecast_url, params=forecast_params)
                forecast_data = forecast_response.json()

                # Process forecast data
                forecast_summary = self._process_forecast(forecast_data)

                return {
                    "location": current_data.get("name", "Unknown"),
                    "current": {
                        "temperature": current_data["main"]["temp"],
                        "humidity": current_data["main"]["humidity"],
                        "pressure": current_data["main"]["pressure"],
                        "description": current_data["weather"][0]["description"],
                        "rainfall_1h": current_data.get("rain", {}).get("1h", 0)
                    },
                    "forecast": forecast_summary
                }
        except Exception as e:
            print(f"Weather API error: {e}")
            # Return default/fallback data
            return {
                "location": "Unknown",
                "current": {
                    "temperature": 25,
                    "humidity": 60,
                    "description": "Data unavailable",
                    "rainfall_1h": 0
                },
                "forecast": {
                    "avg_temperature": 25,
                    "total_rainfall_mm": 0,
                    "rainy_days": 0,
                    "summary": "Weather data unavailable"
                }
            }

    def _process_forecast(self, forecast_data: Dict) -> Dict:
        """Process 5-day forecast into useful summary"""

        if "list" not in forecast_data:
            return {
                "avg_temperature": 0,
                "total_rainfall_mm": 0,
                "rainy_days": 0,
                "summary": "No forecast available"
            }

        temps = []
        total_rain = 0
        rainy_days = set()

        for item in forecast_data["list"]:
            temps.append(item["main"]["temp"])

            # Check for rainfall
            rain = item.get("rain", {}).get("3h", 0)
            if rain > 0:
                total_rain += rain
                # Get date for this forecast
                date = datetime.fromtimestamp(item["dt"]).date()
                rainy_days.add(date)

        avg_temp = sum(temps) / len(temps) if temps else 0

        # Generate summary
        if total_rain > 100:
            rain_summary = "Heavy rainfall expected"
        elif total_rain > 50:
            rain_summary = "Moderate rainfall expected"
        elif total_rain > 10:
            rain_summary = "Light rainfall expected"
        else:
            rain_summary = "Little to no rainfall expected"

        return {
            "avg_temperature": round(avg_temp, 1),
            "total_rainfall_mm": round(total_rain, 1),
            "rainy_days": len(rainy_days),
            "summary": f"{rain_summary} over next 5 days. Avg temp: {avg_temp:.1f}°C"
        }

weather_service = WeatherService()
