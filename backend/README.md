# 🌾 Smart Soil Platform Backend

A FastAPI-based backend for agricultural soil analysis and farmer advisory system using AI-powered recommendations and SMS integration.

**Live Status:** Running on `http://localhost:8000`  
**Database:** SQLite (file-based, auto-initialized)  
**AI Engine:** Google Gemini API + OpenWeather Integration  

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Structure](#-project-structure)
3. [API Endpoints](#-api-endpoints)
4. [Environment Setup](#-environment-setup)
5. [Database Schema](#-database-schema)
6. [Authentication](#-authentication)
7. [Error Handling](#-error-handling)
8. [Frontend Integration Guide](#-frontend-integration-guide)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Conda or virtualenv
- API Keys: Google Gemini, OpenWeather

### Installation & Running

```bash
# 1. Clone and navigate to backend
cd backend

# 2. Create conda environment
conda create -n smart-soil-env python=3.9
conda activate smart-soil-env

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 5. Run server
uvicorn app.main:app --reload

# Server runs at: http://localhost:8000
```

### Verify Server is Running

```bash
# Health check
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "database": "connected"}
```

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app setup, CORS, routers
│   ├── api/
│   │   ├── auth.py             # Admin register/login/me endpoints
│   │   ├── admin.py            # Farmer & device management endpoints
│   │   ├── soil.py             # Soil data upload & AI analysis
│   │   └── sms.py              # SMS webhook & farmer interactions
│   ├── core/
│   │   ├── config.py           # Environment variables & settings
│   │   ├── security.py         # Password hashing + JWT auth helpers
│   │   └── database.py         # SQLAlchemy setup, SessionLocal
│   ├── models/
│   │   ├── database_models.py  # SQLAlchemy ORM models (Farmer, Device, SoilTest, etc.)
│   │   └── schemas.py          # Pydantic request/response schemas
│   └── services/
│       ├── ai_agronomist.py    # AI crop recommendations via Google Gemini
│       ├── weather_service.py  # OpenWeather API integration
│       └── sms_service.py      # SMS sending via Telerivet
├── requirements.txt            # Python dependencies
├── .env                        # Configuration (API keys, database URL)
├── smart_soil.db               # SQLite database (auto-created)
└── README.md                   # This file
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:8000`

All endpoints use **JSON** for request/response bodies.

---

### 🔐 **Auth Endpoints** - `/api/auth`

#### 1️⃣ Register Admin

**Endpoint:** `POST /api/auth/register`

**Purpose:** Create admin account with email/password + protected 6-digit registration code

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "StrongPass123",
  "registration_code": "123456"
}
```

**Response (200):**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "is_active": true,
    "created_at": "2026-02-12T10:00:00"
  }
}
```

#### 2️⃣ Login Admin

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "StrongPass123"
}
```

**Response:** Same format as register (`access_token`, `token_type`, `user`)

#### 3️⃣ Current Admin

**Endpoint:** `GET /api/auth/me`

**Headers Required:**
```http
Authorization: Bearer <access_token>
```

---

### 🌾 **Admin Endpoints** - `/api/admin`

All `/api/admin/*` endpoints require an admin JWT token:

```http
Authorization: Bearer <admin_access_token>
```

#### 1️⃣ Create Farmer

**Endpoint:** `POST /api/admin/farmers`

**Purpose:** Register a new farmer account

**Request Body:**
```json
{
  "name": "Julius Mwangi",
  "phone_number": "256701234567",
  "region": "Eastern",
  "district": "Mbale"
}
```

**Response (201):**
```json
{
  "status": "success",
  "farmer": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Julius Mwangi",
    "phone_number": "256701234567",
    "region": "Eastern",
    "district": "Mbale",
    "pin": "456789"
  }
}
```

**Error Responses:**
- `400`: Phone number already registered
- `422`: Validation error (missing/invalid fields)

**Frontend Use:** Register new farmer before device setup

---

#### 2️⃣ List All Farmers

**Endpoint:** `GET /api/admin/farmers`

**Purpose:** Retrieve all registered farmers (admin view)

**Response:**
```json
{
  "farmers": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Julius Mwangi",
      "phone_number": "256701234567",
      "region": "Eastern",
      "district": "Mbale",
      "pin": "456789",
      "created_at": "2024-01-23T10:30:00"
    },
    {...}
  ]
}
```

**Frontend Use:** Admin dashboard to view all farmers

---

#### 3️⃣ Register Device

**Endpoint:** `POST /api/admin/devices`

**Purpose:** Register an IoT soil sensor device to a farmer account

**Request Body:**
```json
{
  "farmer_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "device_id": "SOIL-SENSOR-001",
  "sim_number": "256701234567"
}
```

**Response (201):**
```json
{
  "status": "success",
  "device": {
    "id": "dev-123abc",
    "device_id": "SOIL-SENSOR-001",
    "sim_number": "256701234567",
    "farmer_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "is_active": true,
    "created_at": "2024-01-23T10:35:00"
  },
  "api_token": "rAj3KpL9MnO2QrStUvWxYzAbCdEfGhIjKlMnOpQrStUv"
}
```

**⚠️ Important:** Save the `api_token` - it's used to authenticate soil data uploads

**Frontend Use:** Show generated token to device/installer, store securely

---

#### 4️⃣ Get Farmer Soil Tests

**Endpoint:** `GET /api/admin/soil-tests/{farmer_id}`

**Purpose:** Retrieve all soil tests and AI recommendations for a farmer

**Path Parameters:**
- `farmer_id`: UUID of the farmer

**Response:**
```json
{
  "tests": [
    {
      "id": "test-456def",
      "timestamp": "2024-01-23T10:45:00",
      "location": "Mbale, Uganda",
      "ph": 7.2,
      "moisture": 45.2,
      "temperature": 24.5,
      "nitrogen": 12.3,
      "phosphorus": 8.5,
      "potassium": 150.0,
      "latitude": 1.3521,
      "longitude": 34.2755,
      "created_at": "2024-01-23T10:45:00",
      "recommendations": [
        {
          "id": "rec-789ghi",
          "recommendation_type": "crop_suggestion",
          "content": "1. MAIZE (95/100): Excellent soil conditions...\n2. BEANS (87/100): Good nitrogen...",
          "crops_suggested": {
            "ai_response": "1. MAIZE (95/100): Excellent soil conditions...\n2. BEANS (87/100): Good nitrogen..."
          }
        }
      ]
    }
  ]
}
```

**Frontend Use:** Dashboard to display farmer's soil history and AI recommendations

---

#### 5️⃣ Get SMS Logs

**Endpoint:** `GET /api/admin/sms-logs/{farmer_id}`

**Purpose:** Retrieve SMS conversation history with farmer

**Response:**
```json
{
  "logs": [
    {
      "id": "log-101112",
      "direction": "outbound",
      "phone_number": "256701234567",
      "message": "Hello Julius! Your soil test is ready. Reply: 1=Crops, 2=Check crop, 3=Fertilizer",
      "status": "sent",
      "created_at": "2024-01-23T10:46:00"
    },
    {
      "id": "log-131415",
      "direction": "inbound",
      "phone_number": "256701234567",
      "message": "1",
      "status": "received",
      "created_at": "2024-01-23T10:47:00"
    }
  ]
}
```

**Frontend Use:** Show SMS conversation history, support troubleshooting

---

### 🌱 **Soil Endpoints** - `/api/soil`

#### Upload Soil Data (Triggers AI Analysis)

**Endpoint:** `POST /api/soil/upload`

**Purpose:** Receive soil data from IoT device → Fetch weather → Get AI recommendations → Send SMS to farmer

**Authentication:** Required - Bearer token in `Authorization` header

**Request Body:**
```json
{
  "device_id": "SOIL-SENSOR-001",
  "farmer_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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

**Headers Required:**
```
Authorization: Bearer rAj3KpL9MnO2QrStUvWxYzAbCdEfGhIjKlMnOpQrStUv
Content-Type: application/json
```

**Response (200):**
```json
{
  "status": "success",
  "soil_test_id": "test-456def",
  "location": "Mbale, Uganda",
  "weather_summary": "Clear sky, 24°C, 45% humidity. Light rain expected in 2 days.",
  "message": "Data received, weather fetched, AI analyzed, SMS sent to farmer"
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `404`: Farmer or device not found
- `422`: Invalid soil data format

**What Happens Behind the Scenes:**
1. ✅ Verifies device token
2. ✅ Fetches real-time weather from OpenWeather API
3. ✅ Calls Google Gemini AI to analyze soil conditions
4. ✅ Stores AI recommendations in database
5. ✅ Creates SMS session for farmer interaction
6. ✅ Sends initial SMS to farmer with options

**Frontend Use:** 
- Call when device uploads soil data
- Display response to user
- Show "Sending to AI..." loading state
- Parse recommendations for display

---

### 💬 **SMS Endpoints** - `/api/sms`

#### Receive SMS from Farmer

**Endpoint:** `POST /api/sms/receive`

**Purpose:** Webhook endpoint that receives farmer SMS responses (sent by Telerivet)

**Request Body:**
```json
{
  "from_number": "256701234567",
  "content": "1"
}
```

**Possible Farmer Responses:**
- `1` or `ONE`: Get crop suggestions
- `2` or `TWO`: Ask about specific crop
- `3` or `THREE`: Get fertilizer advice

**Response (200):**
```json
{
  "status": "success",
  "message": "1. MAIZE (95/100): Excellent soil conditions...\n2. BEANS (87/100): Good nitrogen...",
  "session_updated": true
}
```

**Frontend Use:** 
- Called by Telerivet webhook (not called from frontend directly)
- Backend automatically sends SMS response to farmer
- For testing: Use curl or Postman to simulate SMS

---

## 🔐 Authentication

### 1) Admin JWT Authentication

Used for all `/api/admin/*` endpoints.

**How to get token:**
1. Register: `POST /api/auth/register` (requires `registration_code`)
2. Login: `POST /api/auth/login`
3. Use returned `access_token` in header:

```http
Authorization: Bearer <admin_access_token>
```

### 2) Device Token Authentication

Used for IoT upload endpoint `/api/soil/upload`.

**How to use:**
```bash
curl -X POST http://localhost:8000/api/soil/upload \
  -H "Authorization: Bearer YOUR_DEVICE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...soil data...}'
```

**Token Source:** Generated when registering device via `/api/admin/devices` endpoint.

---

## 🗄️ Database Schema

### Admin Users Table
```sql
id (UUID, Primary Key)
email (String, Unique)
password_hash (String)
is_active (Boolean)
created_at (DateTime)
updated_at (DateTime)
```

### Farmers Table
```sql
id (UUID, Primary Key)
name (String)
phone_number (String, Unique)
region (String)
district (String)
pin (String)
created_at (DateTime)
updated_at (DateTime)
```

### Devices Table
```sql
id (UUID, Primary Key)
device_id (String)
sim_number (String)
farmer_id (Foreign Key → Farmers)
api_token (String, Unique)
is_active (Boolean)
created_at (DateTime)
updated_at (DateTime)
```

### Soil Tests Table
```sql
id (UUID, Primary Key)
device_id (Foreign Key → Devices)
farmer_id (Foreign Key → Farmers)
timestamp (DateTime)
latitude (Float)
longitude (Float)
ph (Float)
moisture (Float) - soil_moisture_percent
temperature (Float) - soil_temperature_c
nitrogen (Float) - soil_nitrogen_mgkg
phosphorus (Float) - soil_phosphorus_mgkg
potassium (Float) - soil_potassium_mgkg
location_name (String)
sample_number (Integer)
sample_depth_cm (Integer)
created_at (DateTime)
```

### Recommendations Table
```sql
id (UUID, Primary Key)
soil_test_id (Foreign Key → Soil Tests)
recommendation_type (String) - e.g., "crop_suggestion"
content (Text) - Full AI recommendation text
crops_suggested (JSON) - Structured crop data
created_at (DateTime)
```

### SMS Logs Table
```sql
id (UUID, Primary Key)
farmer_id (Foreign Key → Farmers)
direction (String) - "inbound" or "outbound"
phone_number (String)
message (Text)
status (String) - "sent", "received", "failed"
created_at (DateTime)
```

---

## ⚙️ Environment Configuration

Create `.env` file in backend directory:

```env
# Database (SQLite - auto-created)
DATABASE_URL=sqlite:///./smart_soil.db

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# OpenWeather API (free tier: 1000 calls/day)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Telerivet SMS Gateway (optional, for production SMS)
TELERIVET_API_KEY=your_telerivet_api_key
TELERIVET_PROJECT_ID=your_project_id

# App Configuration
API_SECRET_KEY=dev-secret-key-12345
ADMIN_REGISTRATION_CODE=123456
ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

**Get API Keys:**
- 🔗 Google Gemini: https://makersuite.google.com/app/apikey
- 🔗 OpenWeather: https://openweathermap.org/api
- 🔗 Telerivet: https://telerivet.com/

---

## 🚨 Error Handling

### Standard Error Responses

**400 - Bad Request:**
```json
{
  "detail": "Phone number already registered"
}
```

**401 - Unauthorized:**
```json
{
  "detail": "Invalid device token"
}
```

**404 - Not Found:**
```json
{
  "detail": "Farmer not found"
}
```

**422 - Validation Error:**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "phone_number"],
      "msg": "Field required"
    }
  ]
}
```

### Frontend Error Handling

```javascript
// Example React error handling
const uploadSoilData = async (soilData) => {
  try {
    const response = await fetch('http://localhost:8000/api/soil/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deviceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(soilData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error:', error.detail);
      // Show user-friendly error
      return;
    }

    const data = await response.json();
    console.log('Success:', data.message);
  } catch (err) {
    console.error('Network error:', err);
  }
};
```

---

## 🎯 Frontend Integration Guide

### Step 0: Admin Login

```javascript
const adminLogin = async () => {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'StrongPass123'
    })
  });

  const data = await response.json();
  localStorage.setItem('adminToken', data.access_token);
  return data;
};
```

### Step 1: Create a Farmer Account

```javascript
const createFarmer = async (farmerData) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await fetch('http://localhost:8000/api/admin/farmers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Julius Mwangi',
      phone_number: '256701234567',
      region: 'Eastern',
      district: 'Mbale'
    })
  });
  
  return response.json();
  // Returns: { farmer: { id, name, phone_number, pin } }
};
```

### Step 2: Register a Device

```javascript
const registerDevice = async (farmerId) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await fetch('http://localhost:8000/api/admin/devices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      farmer_id: farmerId,
      device_id: 'SOIL-SENSOR-001',
      sim_number: '256701234567'
    })
  });
  
  const data = await response.json();
  // IMPORTANT: Store api_token securely!
  localStorage.setItem('deviceToken', data.api_token);
  return data;
};
```

### Step 3: Upload Soil Data

```javascript
const uploadSoilData = async (soilData) => {
  const deviceToken = localStorage.getItem('deviceToken');
  
  const response = await fetch('http://localhost:8000/api/soil/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${deviceToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      device_id: 'SOIL-SENSOR-001',
      farmer_id: farmerId,
      phone_number: '256701234567',
      timestamp: new Date().toISOString(),
      gps_latitude: 1.3521,
      gps_longitude: 34.2755,
      sample_number: 1,
      sample_depth_cm: 20,
      soil_temperature_c: 24.5,
      soil_moisture_percent: 45.2,
      soil_nitrogen_mgkg: 12.3,
      soil_phosphorus_mgkg: 8.5,
      soil_potassium_mgkg: 150.0,
      soil_ph: 7.2
    })
  });
  
  return response.json();
  // Returns: { status, soil_test_id, location, weather_summary, message }
};
```

### Step 4: Fetch Recommendations

```javascript
const getRecommendations = async (farmerId) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await fetch(`http://localhost:8000/api/admin/soil-tests/${farmerId}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  const data = await response.json();
  
  // Access recommendations
  const tests = data.tests;
  const latestTest = tests[0];
  const recommendations = latestTest.recommendations;
  
  return recommendations;
  // Returns array of { id, recommendation_type, content, crops_suggested }
};
```

### Step 5: Display Recommendations

```jsx
// React component example
function RecommendationDisplay({ farmerId }) {
  const [recs, setRecs] = useState([]);
  
  useEffect(() => {
    getRecommendations(farmerId).then(setRecs);
  }, [farmerId]);
  
  return (
    <div>
      {recs.map(rec => (
        <div key={rec.id}>
          <p>{rec.content}</p>
          <small>{rec.recommendation_type}</small>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing Endpoints

Use the provided test script or Postman:

```bash
# Run complete AI integration test
chmod +x test_ai_complete.sh
./test_ai_complete.sh

# Or use curl for individual endpoints
curl -X POST http://localhost:8000/api/admin/farmers \
  -H "Authorization: Bearer YOUR_ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone_number":"256701234567","region":"Central","district":"Kampala"}'
```

---

## 📞 Support & Troubleshooting

### Server Won't Start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Or run on different port
uvicorn app.main:app --reload --port 8001
```

### Database Issues
```bash
# SQLite database auto-creates
# To reset: delete smart_soil.db and restart server

# Or use init_db.py
python init_db.py
```

### AI Recommendations Not Working
- Check `GOOGLE_GEMINI_API_KEY` is set
- Check OpenWeather API key is valid
- Check server logs: `tail -50 /tmp/server.log`

---

## 📚 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | 0.104.1 |
| Server | Uvicorn | 0.24.0 |
| Database | SQLAlchemy + SQLite | 2.0.23 |
| Validation | Pydantic | 2.5.0 |
| HTTP Client | HTTPX | 0.25.1 |
| AI | Google Generative AI | 0.8.6 |
| Weather | OpenWeather API | v2.5 |
| SMS | Telerivet API | REST |

---

## 📄 License

MIT License - See LICENSE file

---

**Ready to integrate with frontend? Follow the [Frontend Integration Guide](#-frontend-integration-guide) above!** 🚀
