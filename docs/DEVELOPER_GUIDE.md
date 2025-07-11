# Developer Guide - SoilWise Platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git
- Docker (optional, for containerized development)

### Development Environment Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd soilwise
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

4. **Start development servers:**
```bash
npm run dev
```

## 🏗️ Architecture Overview

### Monorepo Structure
The project uses a monorepo structure with workspaces for better code organization and dependency management.

```
soilwise/
├── apps/                      # Main applications
│   ├── web-dashboard/        # React dashboard
│   ├── pwa-farmer/          # Offline-first PWA
│   ├── api-server/          # Node.js API server
│   └── edge-hub/            # Raspberry Pi edge computing
├── packages/                 # Shared packages
│   ├── ai-services/         # AI/ML services
│   └── voice-assistant/     # Voice processing
└── shared/                  # Common utilities (planned)
```

### Services Architecture

#### 1. Web Dashboard (`apps/web-dashboard`)
- **Technology**: React 18, TypeScript, Tailwind CSS, Vite
- **Purpose**: Cloud-based dashboard for farm management
- **Features**: Real-time monitoring, analytics, multi-farm management
- **Port**: 3005

#### 2. PWA Farmer App (`apps/pwa-farmer`)
- **Technology**: React 18, PWA, SQLite, TypeScript
- **Purpose**: Offline-first mobile application for farmers
- **Features**: Field data collection, offline sync, photo capture
- **Port**: 5179

#### 3. API Server (`apps/api-server`)
- **Technology**: Node.js, Express, Socket.io, MQTT
- **Purpose**: Central API and real-time communication hub
- **Features**: RESTful API, WebSocket connections, MQTT integration
- **Port**: 8081

#### 4. Edge Hub (`apps/edge-hub`)
- **Technology**: Node.js, SQLite, MQTT
- **Purpose**: Raspberry Pi edge computing node
- **Features**: Local data processing, sensor management, offline capability
- **Port**: 3002

#### 5. AI Services (`packages/ai-services`)
- **Technology**: LangChain, ChromaDB, Ollama
- **Purpose**: AI-powered advisory engine
- **Features**: Crop recommendations, predictive analytics
- **Port**: 8082

#### 6. Voice Assistant (`packages/voice-assistant`)
- **Technology**: Whisper, Coqui TTS, Node.js
- **Purpose**: Voice-enabled interaction
- **Features**: Speech recognition, text-to-speech, offline processing
- **Port**: 8083

## 🔧 Development Commands

### Global Commands (from root)
```bash
# Start all services
npm run dev

# Start individual services
npm run dev:api          # API server only
npm run dev:dashboard    # Web dashboard only
npm run dev:pwa         # PWA farmer app only
npm run dev:edge        # Edge hub only

# Build and test
npm run build           # Build all applications
npm run test           # Run all tests
npm run lint           # Lint all packages
npm run clean          # Clean build artifacts

# Turbo commands (faster)
npm run turbo:dev       # Start all services with Turbo
npm run turbo:build     # Build all with Turbo
npm run turbo:test      # Test all with Turbo
```

### Individual Service Commands
```bash
# Web Dashboard
cd apps/web-dashboard
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# PWA Farmer App
cd apps/pwa-farmer
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# API Server
cd apps/api-server
npm run dev             # Start with nodemon
npm run build           # Build TypeScript
npm run start           # Start production server

# Edge Hub
cd apps/edge-hub
npm run dev             # Start with nodemon
npm run build           # Build TypeScript
npm run start           # Start production server
```

## 🐳 Docker Development

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Raspberry Pi Deployment
```bash
# Build for ARM architecture
docker-compose -f docker-compose.pi.yml build

# Deploy to Raspberry Pi
docker-compose -f docker-compose.pi.yml up -d
```

## 📊 Database Schema

### SQLite (Local/Edge)
```sql
-- Sensor data table
CREATE TABLE sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id TEXT NOT NULL,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    location_lat REAL,
    location_lng REAL,
    synced BOOLEAN DEFAULT 0
);

-- Farms table
CREATE TABLE farms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location_lat REAL NOT NULL,
    location_lng REAL NOT NULL,
    size REAL NOT NULL,
    crop_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    created DATETIME NOT NULL,
    synced BOOLEAN DEFAULT 0
);

-- Alerts table
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    sensor_id TEXT,
    farm_id TEXT,
    resolved BOOLEAN DEFAULT 0,
    synced BOOLEAN DEFAULT 0
);
```

## 🔌 API Endpoints

### Core API (`/api/v1`)
```bash
# Sensor data
GET    /api/v1/sensors              # List all sensors
GET    /api/v1/sensors/:id          # Get sensor details
POST   /api/v1/sensors              # Create new sensor
PUT    /api/v1/sensors/:id          # Update sensor
DELETE /api/v1/sensors/:id          # Delete sensor

# Sensor data
GET    /api/v1/data                 # Get sensor data
POST   /api/v1/data                 # Store sensor data
GET    /api/v1/data/:sensorId       # Get data for specific sensor

# Farms
GET    /api/v1/farms                # List farms
POST   /api/v1/farms                # Create farm
GET    /api/v1/farms/:id            # Get farm details
PUT    /api/v1/farms/:id            # Update farm
DELETE /api/v1/farms/:id            # Delete farm

# Alerts
GET    /api/v1/alerts               # List alerts
POST   /api/v1/alerts               # Create alert
PUT    /api/v1/alerts/:id           # Update alert
DELETE /api/v1/alerts/:id           # Delete alert

# AI Advisory
POST   /api/v1/advisory             # Get AI recommendations
POST   /api/v1/analyze              # Analyze sensor data
```

### WebSocket Events
```javascript
// Real-time sensor data
socket.on('sensor_data', (data) => {
    console.log('New sensor data:', data)
})

// Alerts
socket.on('alert', (alert) => {
    console.log('New alert:', alert)
})

// System status
socket.on('system_status', (status) => {
    console.log('System status:', status)
})
```

## 🎯 MQTT Topics

### Sensor Data
```bash
# Publishing sensor data
sensors/{sensorId}/data

# Example payload
{
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
```

### Commands
```bash
# Sending commands to sensors
commands/{sensorId}

# Example payload
{
    "command": "calibrate",
    "parameters": {
        "mode": "automatic"
    }
}
```

### Alerts
```bash
# Publishing alerts
alerts/{farmId}

# Example payload
{
    "type": "low_moisture",
    "message": "Soil moisture below threshold",
    "severity": "medium",
    "sensorId": "soil_001"
}
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm run test

# Run tests for specific package
cd apps/api-server
npm run test

# Run tests with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Manual Testing
```bash
# Start test environment
npm run dev:test

# Access test endpoints
curl http://localhost:8081/api/v1/health
```

## 🔍 Debugging

### VS Code Configuration
Create `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug API Server",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/apps/api-server/src/server.ts",
            "outFiles": ["${workspaceFolder}/**/*.js"],
            "env": {
                "NODE_ENV": "development"
            },
            "runtimeArgs": ["-r", "ts-node/register"]
        },
        {
            "name": "Debug Edge Hub",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/apps/edge-hub/src/server.ts",
            "outFiles": ["${workspaceFolder}/**/*.js"],
            "env": {
                "NODE_ENV": "development"
            },
            "runtimeArgs": ["-r", "ts-node/register"]
        }
    ]
}
```

### Logging
All services use structured logging:
```javascript
import { logger } from './utils/logger'

logger.info('Service started', { port: 8081 })
logger.error('Database connection failed', { error: err.message })
logger.debug('Processing sensor data', { sensorId: 'soil_001' })
```

## 🔐 Environment Variables

### Development (.env)
```bash
# Database
DB_PATH=./data/soilwise.db

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=development
MQTT_PASSWORD=development

# AI Services
AI_SERVICE_URL=http://localhost:8082
OLLAMA_API_URL=http://localhost:11434

# Voice Assistant
WHISPER_MODEL_PATH=./models/whisper
COQUI_MODEL_PATH=./models/coqui

# Cloud Services
CLOUD_SYNC_ENDPOINT=https://api.soilwise.com
CLOUD_API_KEY=dev_key_placeholder

# Logging
LOG_LEVEL=debug
```

### Production (.env.production)
```bash
# Database
DB_PATH=/data/soilwise.db

# MQTT
MQTT_BROKER_URL=mqtt://mqtt.soilwise.com:1883
MQTT_USERNAME=${MQTT_USERNAME}
MQTT_PASSWORD=${MQTT_PASSWORD}

# AI Services
AI_SERVICE_URL=http://ai-services:8082
OLLAMA_API_URL=http://ollama:11434

# Voice Assistant
WHISPER_MODEL_PATH=/models/whisper
COQUI_MODEL_PATH=/models/coqui

# Cloud Services
CLOUD_SYNC_ENDPOINT=https://api.soilwise.com
CLOUD_API_KEY=${CLOUD_API_KEY}

# Logging
LOG_LEVEL=info
```

## 📦 Package Management

### Adding Dependencies
```bash
# Add dependency to specific package
npm install --workspace=apps/api-server express

# Add dev dependency
npm install --workspace=apps/web-dashboard -D @types/react

# Add dependency to all packages
npm install --workspaces lodash
```

### Workspace Commands
```bash
# Run command in all workspaces
npm run build --workspaces

# Run command in specific workspace
npm run dev --workspace=apps/api-server
```

## 🔄 Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches

### Commit Convention
```bash
# Format: type(scope): description
feat(api): add sensor data endpoint
fix(dashboard): resolve chart rendering issue
docs(readme): update installation instructions
test(edge): add unit tests for sensor manager
```

## 📝 Code Style

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error'
  }
}
```

### Prettier Configuration
```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5'
}
```

## 🚀 Deployment

### Development Deployment
```bash
# Build all applications
npm run build

# Start production servers
npm run start
```

### Production Deployment
```bash
# Build Docker images
docker-compose build

# Deploy to production
docker-compose up -d

# Scale services
docker-compose up -d --scale api-server=3
```

### Raspberry Pi Deployment
```bash
# Build for ARM architecture
docker buildx build --platform linux/arm64 -t soilwise/edge-hub .

# Deploy to Raspberry Pi
docker-compose -f docker-compose.pi.yml up -d
```

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :8081

# Kill process on port
kill -9 $(lsof -t -i:8081)
```

#### Database Issues
```bash
# Reset database
rm -f data/soilwise.db
npm run db:migrate
```

#### MQTT Connection Issues
```bash
# Test MQTT connection
mosquitto_pub -h localhost -t test -m "hello"
mosquitto_sub -h localhost -t test
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 📚 Additional Resources

- [System Architecture](../architecture/system-architecture.md)
- [API Documentation](../api/README.md)
- [Deployment Guide](../deployment/README.md)
- [Hardware Setup](../hardware/README.md)
- [Contributing Guide](../CONTRIBUTING.md)
