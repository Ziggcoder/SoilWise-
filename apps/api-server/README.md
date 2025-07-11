# API Server - SoilWise Platform

## 🚀 Overview

The API Server is the central backend service that provides RESTful endpoints, WebSocket connections, and MQTT integration for the SoilWise platform. It handles sensor data ingestion, user management, and real-time communication.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Server (Node.js)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   REST API      │  │   WebSocket     │  │   MQTT      │ │
│  │   (Express)     │  │   (Socket.io)   │  │   Client    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Auth Layer    │  │   Validation    │  │   Logging   │ │
│  │   (JWT)         │  │   (Joi)         │  │   (Winston) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Database      │  │   Cache         │  │   Queue     │ │
│  │   (PostgreSQL)  │  │   (Redis)       │  │   (Bull)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Socket.io** - Real-time communication
- **MQTT** - IoT messaging protocol
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **Redis** - Caching and sessions
- **Bull** - Job queue management
- **JWT** - Authentication
- **Joi** - Request validation
- **Winston** - Logging

## 📁 Project Structure

```
src/
├── server.ts              # Main server entry point
├── database.ts            # Database connection setup
├── routes/                # API route definitions
│   ├── index.ts          # Route registration
│   ├── sensors.ts        # Sensor data endpoints
│   ├── farms.ts          # Farm management endpoints
│   ├── alerts.ts         # Alert system endpoints
│   ├── users.ts          # User management endpoints
│   └── health.ts         # Health check endpoints
├── middleware/           # Express middleware
│   ├── auth.ts          # Authentication middleware
│   ├── validation.ts    # Request validation
│   ├── error.ts         # Error handling
│   ├── cors.ts          # CORS configuration
│   └── logging.ts       # Request logging
├── services/            # Business logic services
│   ├── sensorService.ts # Sensor data processing
│   ├── farmService.ts   # Farm management
│   ├── alertService.ts  # Alert processing
│   ├── mqttService.ts   # MQTT client handling
│   └── socketService.ts # WebSocket management
└── utils/               # Utility functions
    ├── logger.ts        # Winston logger setup
    ├── config.ts        # Configuration management
    └── helpers.ts       # Common utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL (for production) or SQLite (for development)
- Redis (optional, for caching)

### Development Setup

1. **Navigate to the API server directory:**
```bash
cd apps/api-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run database migrations:**
```bash
npm run migrate
```

5. **Start development server:**
```bash
npm run dev
```

The server will start on `http://localhost:8081`

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

## 📊 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/sensors` | Get all sensors |
| GET | `/api/v1/sensors/:id` | Get specific sensor |
| POST | `/api/v1/sensors/:id/data` | Submit sensor data |
| GET | `/api/v1/farms` | Get all farms |
| GET | `/api/v1/farms/:id` | Get specific farm |
| GET | `/api/v1/alerts` | Get alerts |
| POST | `/api/v1/alerts` | Create alert |

### WebSocket Events

| Event | Description |
|-------|-------------|
| `sensor_data` | Real-time sensor data |
| `alert_created` | New alert notifications |
| `farm_status` | Farm status updates |
| `connection_status` | Connection state changes |

### MQTT Topics

| Topic | Description |
|-------|-------------|
| `sensors/+/data` | Sensor data ingestion |
| `alerts/+` | Alert notifications |
| `farms/+/status` | Farm status updates |

## 🔐 Authentication

### JWT Authentication
```javascript
// Example JWT token usage
const token = jwt.sign(
  { userId: user.id, farmId: user.farmId },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### API Key Authentication
```javascript
// Example API key validation
const apiKey = req.headers['x-api-key'];
const isValid = await validateApiKey(apiKey);
```

## 🗄️ Database Schema

### Key Tables

#### Sensors
```sql
CREATE TABLE sensors (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  farm_id VARCHAR REFERENCES farms(id),
  location_lat DECIMAL,
  location_lng DECIMAL,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Sensor Data
```sql
CREATE TABLE sensor_data (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR REFERENCES sensors(id),
  value DECIMAL NOT NULL,
  unit VARCHAR NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Farms
```sql
CREATE TABLE farms (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  location_lat DECIMAL NOT NULL,
  location_lng DECIMAL NOT NULL,
  size DECIMAL,
  crop_type VARCHAR,
  owner_id VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📈 Performance Considerations

### Caching Strategy
- **Redis** for session storage and frequently accessed data
- **In-memory caching** for configuration and metadata
- **Database query optimization** with proper indexing

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### Connection Pooling
```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // max number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🛠️ Development Guidelines

### Code Structure
- Follow **RESTful API** design principles
- Use **TypeScript** for type safety
- Implement **proper error handling**
- Add **comprehensive logging**
- Write **unit and integration tests**

### Error Handling
```javascript
// Standard error response format
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      details: err.details || null
    }
  });
});
```

### Logging
```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'api-server' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
PORT=8081
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=soilwise
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=mqtt_user
MQTT_PASSWORD=mqtt_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h

# API Keys
API_KEY_SECRET=your-api-key-secret
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8081

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  api-server:
    build: .
    ports:
      - "8081:8081"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis
```

## 📋 Testing

### Unit Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- --testNamePattern="sensor"

# Run tests with coverage
npm run test -- --coverage
```

### Integration Tests
```javascript
// Example integration test
describe('Sensor API', () => {
  test('should create sensor data', async () => {
    const response = await request(app)
      .post('/api/v1/sensors/soil_001/data')
      .send({
        value: 45.5,
        unit: '%',
        timestamp: '2024-01-15T10:30:00Z'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🔍 Monitoring and Debugging

### Health Check
```bash
curl http://localhost:8081/api/v1/health
```

### Logs
```bash
# View logs
tail -f combined.log

# View error logs
tail -f error.log

# Search logs
grep "ERROR" combined.log
```

### Performance Monitoring
```javascript
// Example performance middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

## 🤝 Contributing

1. Follow the main project's [Contributing Guidelines](../../CONTRIBUTING.md)
2. Ensure all tests pass before submitting PRs
3. Add tests for new functionality
4. Update documentation for API changes
5. Follow TypeScript best practices

## 📚 Additional Resources

- [Main Project Documentation](../../docs/README.md)
- [API Documentation](../../docs/api/README.md)
- [Deployment Guide](../../docs/deployment/README.md)
- [Troubleshooting Guide](../../docs/troubleshooting/README.md)
