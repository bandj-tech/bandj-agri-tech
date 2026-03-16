from typing import Dict, Optional

class AIAgronomist:
    """Demo agronomist with static responses (no external AI calls)."""

    async def get_crop_recommendations(
        self,
        soil_data: Dict,
        weather_data: Dict
    ) -> str:
        """Get top 3 crop recommendations with brief reasoning (demo)."""
        return (
            "1. MAIZE (90/100): good N, warm\n"
            "2. BEANS (86/100): soil ok, low cost\n"
            "3. CASSAVA (83/100): drought-tolerant"
        )

    async def check_specific_crop(
        self,
        crop_name: str,
        soil_data: Dict,
        weather_data: Dict
    ) -> str:
        """Check if specific crop is suitable and give advice (demo)."""
        crop = crop_name.upper()
        return (
            f"✓ {crop} is SUITABLE (82/100)\n"
            "ADVICE:\n"
            "- Add compost before planting\n"
            "- Use NPK 17:17:17 sparingly\n"
            "- Keep soil moist, avoid waterlogging"
        )

    async def get_fertilizer_advice(
        self,
        soil_data: Dict,
        target_crop: Optional[str] = None
    ) -> str:
        """Get fertilizer/soil treatment recommendations (demo)."""
        return (
            "FERTILIZER NEEDED:\n"
            "- NPK 17:17:17\n"
            "- 50 kg per acre\n"
            "- Mix with soil at planting"
        )

ai_agronomist = AIAgronomist()
