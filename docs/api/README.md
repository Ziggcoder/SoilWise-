# API Documentation - SoilWise Platform

## 📋 Overview

The SoilWise API provides RESTful endpoints for managing sensor data, farms, alerts, and AI advisory services. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:8081/api/v1`

## 🔐 Authentication

Currently using development mode without authentication. Production will implement:
- JWT tokens for API access
- API keys for IoT device authentication
- OAuth2 for third-party integrations

## 📊 Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid sensor data format",
    "details": {
      "field": "value",
      "expected": "number",
      "received": "string"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

## 🌡️ Sensor Endpoints

### Get All Sensors
```http
GET /api/v1/sensors
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "soil_001",
      "name": "Soil Moisture Sensor #1",
      "type": "soil_moisture",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "status": "active",
      "lastReading": "2024-01-15T10:25:00Z",
      "batteryLevel": 85
    }
  ]
}
```

### Get Sensor Details
```http
GET /api/v1/sensors/{sensorId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "soil_001",
    "name": "Soil Moisture Sensor #1",
    "type": "soil_moisture",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "status": "active",
    "lastReading": "2024-01-15T10:25:00Z",
    "batteryLevel": 85,
    "calibrationDate": "2024-01-01T00:00:00Z",
    "firmware": "1.2.3"
  }
}
```

### Create New Sensor
```http
POST /api/v1/sensors
```

**Request Body:**
```json
{
  "name": "Temperature Sensor #2",
  "type": "temperature",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "farmId": "farm_001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "temp_002",
    "name": "Temperature Sensor #2",
    "type": "temperature",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update Sensor
```http
PUT /api/v1/sensors/{sensorId}
```

**Request Body:**
```json
{
  "name": "Updated Sensor Name",
  "location": {
    "lat": 40.7200,
    "lng": -74.0100
  }
}
```

### Delete Sensor
```http
DELETE /api/v1/sensors/{sensorId}
```

## 📈 Sensor Data Endpoints

### Get Sensor Data
```http
GET /api/v1/data?sensorId={sensorId}&startDate={startDate}&endDate={endDate}&limit={limit}
```

**Query Parameters:**
- `sensorId` (optional): Filter by sensor ID
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)
- `limit` (optional): Maximum results (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sensorId": "soil_001",
      "type": "soil_moisture",
      "value": 65.5,
      "unit": "%",
      "timestamp": "2024-01-15T10:30:00Z",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 100
  }
}
```

### Store Sensor Data
```http
POST /api/v1/data
```

**Request Body:**
```json
{
  "sensorId": "soil_001",
  "type": "soil_moisture",
  "value": 67.2,
  "unit": "%",
  "timestamp": "2024-01-15T10:35:00Z",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

### Bulk Store Sensor Data
```http
POST /api/v1/data/bulk
```

**Request Body:**
```json
{
  "readings": [
    {
      "sensorId": "soil_001",
      "type": "soil_moisture",
      "value": 65.5,
      "unit": "%",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "sensorId": "temp_001",
      "type": "temperature",
      "value": 24.2,
      "unit": "°C",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 🏡 Farm Endpoints

### Get All Farms
```http
GET /api/v1/farms
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "farm_001",
      "name": "Green Valley Farm",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "size": 50.5,
      "cropType": "wheat",
      "ownerId": "user_001",
      "sensorCount": 5,
      "lastActivity": "2024-01-15T10:25:00Z"
    }
  ]
}
```

### Get Farm Details
```http
GET /api/v1/farms/{farmId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "farm_001",
    "name": "Green Valley Farm",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "size": 50.5,
    "cropType": "wheat",
    "ownerId": "user_001",
    "created": "2024-01-01T00:00:00Z",
    "sensors": [
      {
        "id": "soil_001",
        "type": "soil_moisture",
        "status": "active"
      }
    ]
  }
}
```

### Create New Farm
```http
POST /api/v1/farms
```

**Request Body:**
```json
{
  "name": "Sunset Acres",
  "location": {
    "lat": 40.7200,
    "lng": -74.0100
  },
  "size": 75.0,
  "cropType": "corn",
  "ownerId": "user_002"
}
```

## 🚨 Alert Endpoints

### Get All Alerts
```http
GET /api/v1/alerts?severity={severity}&resolved={resolved}
```

**Query Parameters:**
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `resolved` (optional): Filter by resolved status (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "low_moisture",
      "message": "Soil moisture below threshold in Zone A",
      "severity": "medium",
      "timestamp": "2024-01-15T10:30:00Z",
      "sensorId": "soil_001",
      "farmId": "farm_001",
      "resolved": false
    }
  ]
}
```

### Create Alert
```http
POST /api/v1/alerts
```

**Request Body:**
```json
{
  "type": "high_temperature",
  "message": "Temperature exceeds safe limit",
  "severity": "high",
  "sensorId": "temp_001",
  "farmId": "farm_001"
}
```

### Resolve Alert
```http
PUT /api/v1/alerts/{alertId}/resolve
```

**Request Body:**
```json
{
  "resolvedBy": "user_001",
  "notes": "Irrigation system activated"
}
```

## 🤖 AI Advisory Endpoints

### Get AI Recommendations
```http
POST /api/v1/advisory
```

**Request Body:**
```json
{
  "farmId": "farm_001",
  "sensorData": [
    {
      "type": "soil_moisture",
      "value": 35.0,
      "unit": "%"
    },
    {
      "type": "temperature",
      "value": 28.5,
      "unit": "°C"
    }
  ],
  "weatherData": {
    "temperature": 25.0,
    "humidity": 60,
    "forecast": "sunny"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "irrigation",
        "priority": "high",
        "message": "Soil moisture is low. Recommend irrigation within 24 hours.",
        "confidence": 0.92
      },
      {
        "type": "fertilization",
        "priority": "medium",
        "message": "Consider nitrogen application next week.",
        "confidence": 0.78
      }
    ],
    "analysis": {
      "soilCondition": "dry",
      "cropStress": "moderate",
      "recommendedActions": 3
    }
  }
}
```

### Analyze Sensor Data
```http
POST /api/v1/analyze
```

**Request Body:**
```json
{
  "sensorData": [
    {
      "sensorId": "soil_001",
      "type": "soil_moisture",
      "value": 45.0,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "analysisType": "trend"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trend": "declining",
    "prediction": {
      "nextValue": 42.5,
      "confidence": 0.85,
      "timeframe": "1 hour"
    },
    "anomalies": [],
    "insights": [
      "Soil moisture decreasing at normal rate",
      "No immediate action required"
    ]
  }
}
```

## 🎙️ Voice Assistant Endpoints

### Process Voice Query
```http
POST /api/v1/voice/query
```

**Request Body:**
```json
{
  "audioData": "base64-encoded-audio-data",
  "sessionId": "session_001",
  "farmId": "farm_001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "What is the soil moisture level?",
    "response": "The current soil moisture level is 65.5%. This is within the optimal range for your wheat crop.",
    "audioResponse": "base64-encoded-audio-response",
    "intent": "sensor_query",
    "confidence": 0.95
  }
}
```

### Get Voice Session History
```http
GET /api/v1/voice/sessions/{sessionId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_001",
    "farmId": "farm_001",
    "startTime": "2024-01-15T10:00:00Z",
    "queries": [
      {
        "timestamp": "2024-01-15T10:05:00Z",
        "query": "What is the soil moisture level?",
        "response": "The current soil moisture level is 65.5%.",
        "confidence": 0.95
      }
    ]
  }
}
```

## 🔄 Sync Endpoints

### Get Sync Status
```http
GET /api/v1/sync/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lastSync": "2024-01-15T10:00:00Z",
    "pendingItems": 5,
    "failedItems": 0,
    "totalSynced": 1234,
    "isOnline": true
  }
}
```

### Trigger Manual Sync
```http
POST /api/v1/sync/trigger
```

**Request Body:**
```json
{
  "types": ["sensor_data", "alerts"],
  "force": false
}
```

## 🏥 Health Check Endpoints

### System Health
```http
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "database": "connected",
      "mqtt": "connected",
      "ai": "ready",
      "voice": "ready",
      "sync": "online"
    },
    "version": "1.0.0",
    "uptime": 3600
  }
}
```

### Database Health
```http
GET /api/v1/health/database
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "responseTime": 15,
    "recordCount": 10000,
    "lastBackup": "2024-01-15T06:00:00Z"
  }
}
```

## 📡 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:8081')

socket.on('connect', () => {
  console.log('Connected to SoilWise API')
})
```

### Real-time Sensor Data
```javascript
socket.on('sensor_data', (data) => {
  console.log('New sensor reading:', data)
  // {
  //   sensorId: 'soil_001',
  //   type: 'soil_moisture',
  //   value: 65.5,
  //   unit: '%',
  //   timestamp: '2024-01-15T10:30:00Z'
  // }
})
```

### Alert Notifications
```javascript
socket.on('alert', (alert) => {
  console.log('New alert:', alert)
  // {
  //   type: 'low_moisture',
  //   message: 'Soil moisture below threshold',
  //   severity: 'medium',
  //   farmId: 'farm_001'
  // }
})
```

### System Status Updates
```javascript
socket.on('system_status', (status) => {
  console.log('System status:', status)
  // {
  //   services: {
  //     database: 'connected',
  //     mqtt: 'connected',
  //     ai: 'ready'
  //   }
  // }
})
```

## 📊 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request format |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

## 🔒 Rate Limiting

Development mode has no rate limiting. Production will implement:
- 100 requests per minute for general API
- 10 requests per minute for AI advisory
- 5 requests per minute for voice processing

## 📝 Request/Response Examples

### cURL Examples

```bash
# Get all sensors
curl -X GET http://localhost:8081/api/v1/sensors

# Create sensor data
curl -X POST http://localhost:8081/api/v1/data \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "soil_001",
    "type": "soil_moisture",
    "value": 65.5,
    "unit": "%"
  }'

# Get AI recommendations
curl -X POST http://localhost:8081/api/v1/advisory \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "farm_001",
    "sensorData": [
      {
        "type": "soil_moisture",
        "value": 35.0,
        "unit": "%"
      }
    ]
  }'
```

### JavaScript Examples

```javascript
// Fetch sensor data
const response = await fetch('http://localhost:8081/api/v1/sensors')
const data = await response.json()

// Create new sensor
const newSensor = await fetch('http://localhost:8081/api/v1/sensors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Sensor',
    type: 'temperature',
    location: { lat: 40.7128, lng: -74.0060 }
  })
})
```

## 🐛 Error Handling

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| VALIDATION_ERROR | Invalid request data | Request body validation failed |
| SENSOR_NOT_FOUND | Sensor not found | Sensor ID doesn't exist |
| FARM_NOT_FOUND | Farm not found | Farm ID doesn't exist |
| DATABASE_ERROR | Database operation failed | Internal database error |
| AI_SERVICE_UNAVAILABLE | AI service unavailable | AI service is offline |
| MQTT_CONNECTION_ERROR | MQTT connection failed | MQTT broker unreachable |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid sensor data format",
    "details": {
      "field": "value",
      "expected": "number",
      "received": "string"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

## 📚 SDK and Libraries

### JavaScript/Node.js
```javascript
// Coming soon: Official SoilWise SDK
const SoilWise = require('@soilwise/sdk')

const client = new SoilWise({
  apiUrl: 'http://localhost:8081',
  apiKey: 'your-api-key'
})

const sensors = await client.sensors.list()
```

### Python
```python
# Coming soon: Python SDK
import soilwise

client = soilwise.Client(
    api_url='http://localhost:8081',
    api_key='your-api-key'
)

sensors = client.sensors.list()
```

## 🔮 Future Enhancements

- GraphQL endpoint for flexible queries
- Webhook support for real-time notifications
- Batch operations for bulk data processing
- Advanced filtering and search capabilities
- API versioning for backward compatibility
- OpenAPI/Swagger documentation generation
