#!/bin/bash

# Test AI Integration - Check what's happening

echo "🔍 Testing AI Integration..."
echo ""

# Test 1: Check if .env has API key
echo "Step 1: Checking .env configuration..."
if grep -q "GOOGLE_GEMINI_API_KEY" .env; then
    KEY=$(grep "GOOGLE_GEMINI_API_KEY" .env | cut -d'=' -f2)
    if [ -z "$KEY" ] || [ "$KEY" == "your_gemini_api_key" ]; then
        echo "❌ GOOGLE_GEMINI_API_KEY is not set properly!"
        echo "   Current value: $KEY"
        echo "   Get a free key from: https://makersuite.google.com/app/apikey"
    else
        echo "✅ GOOGLE_GEMINI_API_KEY is set"
    fi
else
    echo "❌ GOOGLE_GEMINI_API_KEY not found in .env"
fi

echo ""
echo "Step 2: Check OPENWEATHER_API_KEY..."
if grep -q "OPENWEATHER_API_KEY" .env; then
    echo "✅ OPENWEATHER_API_KEY is set"
else
    echo "❌ OPENWEATHER_API_KEY not found in .env"
fi

echo ""
echo "Step 3: Current .env values:"
cat .env | grep -E "DATABASE|GEMINI|OPENAI|WEATHER"

echo ""
echo "Step 4: Testing direct Python import..."
python3 << 'EOF'
import sys
try:
    import google.generativeai as genai
    print("✅ google.generativeai is installed")
except ImportError as e:
    print(f"❌ google.generativeai not installed: {e}")

try:
    import openai
    print("✅ openai is installed")
except ImportError as e:
    print(f"❌ openai not installed: {e}")

try:
    import httpx
    print("✅ httpx is installed")
except ImportError as e:
    print(f"❌ httpx not installed: {e}")
EOF

echo ""
echo "Step 5: Suggested fixes:"
echo "1. Update .env with valid API keys"
echo "2. Test with: uvicorn app.main:app --reload"
echo "3. Then run: curl -X POST http://localhost:8000/api/soil/upload ..."
echo "4. Check server logs for AI errors"
