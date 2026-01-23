#!/bin/bash

# Complete AI Integration Test
# This script tests the full flow: farmer creation -> device registration -> soil upload -> AI recommendations

set -e

BASE_URL="http://localhost:8000"

echo "=========================================="
echo "Smart Soil AI Integration Test"
echo "=========================================="

# 1. Create Farmer
echo -e "\n[1/4] Creating farmer..."
PHONE="256701$(date +%s | tail -c 7)"
FARMER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/farmers" \
  -H "Content-Type: application/json" \
  -d "{
    \"phone_number\": \"$PHONE\",
    \"name\": \"Test Farmer\",
    \"region\": \"Central\",
    \"district\": \"Kampala\"
  }")

FARMER_ID=$(echo $FARMER_RESPONSE | jq -r '.farmer.id')
if [ -z "$FARMER_ID" ] || [ "$FARMER_ID" = "null" ]; then
  echo "❌ Failed to create farmer"
  echo "Response: $FARMER_RESPONSE"
  exit 1
fi
echo "✓ Farmer created: $FARMER_ID"

# 2. Register Device
echo -e "\n[2/4] Registering device..."
DEVICE_ID="device-$(date +%s)"
DEVICE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/devices" \
  -H "Content-Type: application/json" \
  -d "{
    \"farmer_id\": \"$FARMER_ID\",
    \"device_id\": \"$DEVICE_ID\",
    \"sim_number\": \"256701234\"
  }")

TOKEN=$(echo $DEVICE_RESPONSE | jq -r '.api_token')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to register device"
  echo "Response: $DEVICE_RESPONSE"
  exit 1
fi
echo "✓ Device registered"
echo "  Token: $TOKEN"

# 3. Upload Soil Data
echo -e "\n[3/4] Uploading soil data..."
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%S)
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/soil/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"device_id\": \"$DEVICE_ID\",
    \"farmer_id\": \"$FARMER_ID\",
    \"phone_number\": \"$PHONE\",
    \"timestamp\": \"$TIMESTAMP\",
    \"gps_latitude\": 0.3476,
    \"gps_longitude\": 32.5825,
    \"sample_number\": 1,
    \"sample_depth_cm\": 20,
    \"soil_temperature_c\": 24.5,
    \"soil_moisture_percent\": 45.2,
    \"soil_nitrogen_mgkg\": 12.3,
    \"soil_phosphorus_mgkg\": 8.5,
    \"soil_potassium_mgkg\": 150.0,
    \"soil_ph\": 7.2
  }")

STATUS=$(echo $UPLOAD_RESPONSE | jq -r '.status')
if [ "$STATUS" != "success" ]; then
  echo "❌ Failed to upload soil data"
  echo "Response: $UPLOAD_RESPONSE"
  exit 1
fi
echo "✓ Soil data uploaded successfully"
echo "  Message: $(echo $UPLOAD_RESPONSE | jq -r '.message')"
echo "  Location: $(echo $UPLOAD_RESPONSE | jq -r '.location')"
echo "  Weather: $(echo $UPLOAD_RESPONSE | jq -r '.weather_summary')"

# 4. Check Recommendations (wait for AI to process)
echo -e "\n[4/4] Waiting for AI analysis (5 seconds)..."
sleep 5

echo "Fetching recommendations..."
RECS_RESPONSE=$(curl -s "$BASE_URL/api/admin/soil-tests/$FARMER_ID")

RECOMMENDATIONS=$(echo $RECS_RESPONSE | jq '.tests[0].recommendations')
REC_COUNT=$(echo $RECOMMENDATIONS | jq 'length')

echo -e "\n=========================================="
if [ "$REC_COUNT" -gt 0 ]; then
  REC_CONTENT=$(echo $RECOMMENDATIONS | jq -r '.[0].content')
  
  if [[ "$REC_CONTENT" == "AI service temporarily unavailable"* ]]; then
    echo "❌ AI FAILED - Fallback error message returned"
    echo "=========================================="
    echo ""
    echo "Check server logs for error details:"
    echo "  tail -100 /tmp/server.log | grep -A 20 ERROR"
    exit 1
  else
    echo "✅ SUCCESS - AI RECOMMENDATIONS RECEIVED"
    echo "=========================================="
    echo ""
    echo "Recommendations:"
    echo $RECOMMENDATIONS | jq '.' 
    exit 0
  fi
else
  echo "❌ NO RECOMMENDATIONS - Empty array returned"
  echo "=========================================="
  echo ""
  echo "Full response:"
  echo $RECS_RESPONSE | jq '.tests[0]'
  exit 1
fi
