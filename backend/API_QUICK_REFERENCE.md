# 🚀 API Quick Reference for Frontend Developers

This is a quick reference for all API endpoints. For detailed docs, see [README.md](README.md)

---

## 📊 API Overview

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **Farmers** | `/api/admin/farmers` | POST | Create new farmer |
| | `/api/admin/farmers` | GET | List all farmers |
| **Devices** | `/api/admin/devices` | POST | Register device & get API token |
| **Soil Data** | `/api/soil/upload` | POST | Upload soil data + trigger AI |
| **Recommendations** | `/api/admin/soil-tests/{id}` | GET | Get AI recommendations |
| **SMS** | `/api/sms/receive` | POST | Receive farmer SMS (webhook) |
| **Logs** | `/api/admin/sms-logs/{id}` | GET | Get SMS history |
| **Health** | `/health` | GET | Check server status |

---

## 1️⃣ Create Farmer

```bash
POST /api/admin/farmers
Content-Type: application/json

{
  "name": "Julius Mwangi",
  "phone_number": "256701234567",
  "region": "Eastern",
  "district": "Mbale"
}
```

**Response:**
```json
{
  "status": "success",
  "farmer": {
    "id": "UUID",
    "name": "Julius Mwangi",
    "phone_number": "256701234567",
    "region": "Eastern",
    "district": "Mbale",
    "pin": "456789"
  }
}
```

---

## 2️⃣ Register Device

```bash
POST /api/admin/devices
Content-Type: application/json

{
  "farmer_id": "UUID_FROM_STEP_1",
  "device_id": "SOIL-SENSOR-001",
  "sim_number": "256701234567"
}
```

**Response:**
```json
{
  "status": "success",
  "device": {...},
  "api_token": "rAj3KpL9MnO2QrStUvWxYz..."  // ⚠️ SAVE THIS TOKEN!
}
```

**⚠️ Store `api_token` securely** - needed for soil data uploads

---

## 3️⃣ Upload Soil Data

```bash
POST /api/soil/upload
Authorization: Bearer YOUR_API_TOKEN_HERE
Content-Type: application/json

{
  "device_id": "SOIL-SENSOR-001",
  "farmer_id": "UUID",
  "phone_number": "256701234567",
  "timestamp": "2024-01-23T10:50:00",
  "gps_latitude": 1.3521,
  "gps_longitude": 34.2755,
  "sample_number": 1,
  "sample_depth_cm": 20,
  "soil_temperature_c": 24.5,
  "soil_moisture_percent": 45.2,
  "soil_nitrogen_mgkg": 12.3,
  "soil_phosphorus_mgkg": 8.5,
  "soil_potassium_mgkg": 150.0,
  "soil_ph": 7.2
}
```

**Response:**
```json
{
  "status": "success",
  "soil_test_id": "UUID",
  "location": "Mbale, Uganda",
  "weather_summary": "Clear, 24°C, 45% humidity",
  "message": "Data received, weather fetched, AI analyzed, SMS sent to farmer"
}
```

---

## 4️⃣ Get AI Recommendations

```bash
GET /api/admin/soil-tests/FARMER_UUID
```

**Response:**
```json
{
  "tests": [
    {
      "id": "UUID",
      "timestamp": "2024-01-23T10:50:00",
      "location": "Mbale, Uganda",
      "ph": 7.2,
      "moisture": 45.2,
      "temperature": 24.5,
      "nitrogen": 12.3,
      "phosphorus": 8.5,
      "potassium": 150.0,
      "recommendations": [
        {
          "id": "UUID",
          "recommendation_type": "crop_suggestion",
          "content": "1. MAIZE (95/100): Excellent...\n2. BEANS (87/100): Good...",
          "crops_suggested": {"ai_response": "..."}
        }
      ]
    }
  ]
}
```

---

## 5️⃣ Get SMS Logs

```bash
GET /api/admin/sms-logs/FARMER_UUID
```

**Response:**
```json
{
  "logs": [
    {
      "id": "UUID",
      "direction": "outbound",
      "phone_number": "256701234567",
      "message": "Hello! Your soil test is ready...",
      "status": "sent",
      "created_at": "2024-01-23T10:46:00"
    },
    {
      "id": "UUID",
      "direction": "inbound",
      "phone_number": "256701234567",
      "message": "1",
      "status": "received",
      "created_at": "2024-01-23T10:47:00"
    }
  ]
}
```

---

## 6️⃣ List All Farmers

```bash
GET /api/admin/farmers
```

**Response:**
```json
{
  "farmers": [
    {
      "id": "UUID",
      "name": "Julius Mwangi",
      "phone_number": "256701234567",
      "region": "Eastern",
      "district": "Mbale",
      "pin": "456789",
      "created_at": "2024-01-23T10:30:00"
    }
  ]
}
```

---

## 7️⃣ Receive SMS (Webhook)

```bash
POST /api/sms/receive
Content-Type: application/json

{
  "from_number": "256701234567",
  "content": "1"
}
```

**Supported Farmer Inputs:**
- `1` or `ONE`: Get crop suggestions
- `2` or `TWO`: Ask about specific crop
- `3` or `THREE`: Get fertilizer advice

**Response:** Backend automatically sends SMS response to farmer

---

## 8️⃣ Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 📝 Field Descriptions

### Soil Data Fields

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `soil_ph` | Float | 4-9 | Soil acidity/alkalinity (7 = neutral) |
| `soil_moisture_percent` | Float | 0-100 | Percentage of water in soil |
| `soil_temperature_c` | Float | -10 to 60 | Temperature in Celsius |
| `soil_nitrogen_mgkg` | Float | 0-100+ | Nitrogen content (mg/kg) |
| `soil_phosphorus_mgkg` | Float | 0-100+ | Phosphorus content (mg/kg) |
| `soil_potassium_mgkg` | Float | 0-300+ | Potassium content (mg/kg) |

### Example Soil Values

**Poor Soil:**
```json
{
  "soil_ph": 5.0,
  "soil_moisture_percent": 25.0,
  "soil_nitrogen_mgkg": 2.0,
  "soil_phosphorus_mgkg": 1.0,
  "soil_potassium_mgkg": 40.0
}
```

**Good Soil:**
```json
{
  "soil_ph": 7.0,
  "soil_moisture_percent": 45.0,
  "soil_nitrogen_mgkg": 15.0,
  "soil_phosphorus_mgkg": 10.0,
  "soil_potassium_mgkg": 180.0
}
```

---

## 🔑 Authentication

Only needed for soil data upload:

```javascript
// JavaScript example
const response = await fetch('http://localhost:8000/api/soil/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(soilData)
});
```

---

## ❌ Common Errors

### 401 Unauthorized
```json
{"detail": "Invalid device token"}
```
**Fix:** Use correct API token from device registration

### 404 Not Found
```json
{"detail": "Farmer not found"}
```
**Fix:** Use correct farmer UUID

### 422 Validation Error
```json
{
  "detail": [
    {"type": "missing", "loc": ["body", "phone_number"]}
  ]
}
```
**Fix:** Check all required fields are present with correct types

### 400 Bad Request
```json
{"detail": "Phone number already registered"}
```
**Fix:** Use different phone number

---

## 🧪 Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Create farmer
curl -X POST http://localhost:8000/api/admin/farmers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone_number":"256701234567","region":"Central","district":"Kampala"}'

# Register device
curl -X POST http://localhost:8000/api/admin/devices \
  -H "Content-Type: application/json" \
  -d '{"farmer_id":"FARMER_UUID","device_id":"DEV-001","sim_number":"256701234567"}'

# Upload soil data
curl -X POST http://localhost:8000/api/soil/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...soil data...}'
```

---

## 📚 Data Types

- `String`: Text (e.g., "Julius Mwangi")
- `Float`: Decimal number (e.g., 7.2, 45.5)
- `Integer`: Whole number (e.g., 20, 1)
- `DateTime`: ISO format (e.g., "2024-01-23T10:50:00")
- `UUID`: Unique identifier (e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
- `JSON`: Object (e.g., `{"key": "value"}`)

---

## 🔗 Base URL

**Development:** `http://localhost:8000`  
**Production:** `https://your-domain.com` (to be configured)

---

## 📞 Getting Help

1. Check [README.md](README.md) for detailed documentation
2. Look at server logs: `tail -50 /tmp/server.log`
3. Run test scripts: `./test_ai_complete.sh`
4. Check `.env` configuration

---

**Happy coding! 🚀**
