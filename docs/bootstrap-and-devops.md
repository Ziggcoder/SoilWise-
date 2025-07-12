# SoilWise Bootstrap & DevOps Guide

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Full-Stack Local Development Setup](#full-stack-local-development-setup)
3. [Infrastructure Services](#infrastructure-services)
4. [Application Services](#application-services)
5. [Testing & Data Emulation](#testing--data-emulation)
6. [Docker Compose Setup](#docker-compose-setup)
7. [Deployment Flows](#deployment-flows)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites Checklist

```bash
# System Requirements
node --version          # >= 18.0.0
npm --version           # >= 8.0.0
docker --version        # >= 20.0.0
docker-compose --version # >= 2.0.0
git --version

# Optional for full development
python3 --version       # >= 3.9 (for AI services)
ollama --version        # Latest (for local LLM)
```

### 30-Second Setup

```bash
# Clone and setup
git clone https://github.com/your-org/soilwise.git
cd soilwise

# Quick bootstrap script
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh

# Or manual setup
npm install
cp .env.example .env
npm run docker:dev
npm run dev
```

**Access URLs After Setup:**
- **Web Dashboard**: http://localhost:3005
- **PWA Farmer App**: http://localhost:5179  
- **API Server**: http://localhost:8081
- **Edge Hub**: http://localhost:3002

---

## 🛠️ Full-Stack Local Development Setup

### Step 1: Environment Configuration

**Create Main Environment File**

```bash
# Copy template
cp .env.example .env

# Edit with your preferences
nano .env
```

**Main .env Configuration:**

```bash
# =============================================================================
# SoilWise Development Environment
# =============================================================================

# Core Configuration
NODE_ENV=development
DEBUG=soilwise:*

# Database Configuration
DATABASE_URL=postgresql://soilwise:password@localhost:5432/soilwise
DB_PASSWORD=dev_password_123

# Redis Configuration  
REDIS_URL=redis://localhost:6379

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=soilwise
MQTT_PASSWORD=soilwise_dev
MQTT_CLIENT_ID=soilwise-main

# API & Services
API_SERVER_PORT=8081
EDGE_HUB_PORT=3002
DASHBOARD_PORT=3005
PWA_PORT=5179

# AI Service Configuration
OPENAI_API_KEY=sk-your-openai-key-here           # Optional
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
CHROMADB_URL=http://localhost:8000

# Voice Assistant
WHISPER_MODEL_PATH=./models/whisper
COQUI_MODEL_PATH=./models/coqui
VOICE_ENABLED=true

# Security (Development Keys)
JWT_SECRET=dev-jwt-secret-change-in-production
ENCRYPTION_KEY=dev-encryption-key-32-chars-long
SESSION_SECRET=dev-session-secret-change-prod

# External APIs (Optional)
WEATHER_API_KEY=your_weather_api_key
SATELLITE_API_KEY=your_satellite_api_key

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/soilwise.log

# CORS & Security
CORS_ORIGIN=http://localhost:3005,http://localhost:5179
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Step 2: Application-Specific Environment Files

**Web Dashboard (.env.local):**

```bash
# apps/web-dashboard/.env.local
VITE_API_URL=http://localhost:8081
VITE_MQTT_BROKER_URL=ws://localhost:9001
VITE_MQTT_USERNAME=soilwise
VITE_MQTT_PASSWORD=soilwise_dev
VITE_SOCKET_URL=http://localhost:8081
VITE_EDGE_HUB_URL=http://localhost:3002
VITE_AI_SERVICE_URL=http://localhost:8082
```

**PWA Farmer App (.env.local):**

```bash
# apps/pwa-farmer/.env.local
VITE_API_URL=http://localhost:8081
VITE_EDGE_HUB_URL=http://localhost:3002
VITE_MQTT_BROKER_URL=ws://localhost:9001
VITE_MQTT_USERNAME=soilwise
VITE_MQTT_PASSWORD=soilwise_dev
VITE_OFFLINE_STORAGE=indexeddb
VITE_SYNC_INTERVAL=30000
VITE_VOICE_ENABLED=true
```

**Edge Hub (.env.development):**

```bash
# apps/edge-hub/.env.development
NODE_ENV=development
PORT=3002
DB_PATH=./data/soilwise-edge.db
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=soilwise
MQTT_PASSWORD=soilwise_dev
API_SERVER_URL=http://localhost:8081
AI_SERVICE_URL=http://localhost:8082
VOICE_SERVICE_URL=ws://localhost:8083
SIMULATE_SENSORS=true
SIMULATION_INTERVAL=5000
```

---

## 🏗️ Infrastructure Services

### Option A: Docker Infrastructure (Recommended)

**Start Core Infrastructure:**

```bash
# Start databases, message broker, and AI services
npm run docker:dev

# Or manually
docker-compose -f docker-compose.dev.yml up -d postgres redis mosquitto chromadb ollama
```

**Docker Development Stack (`docker-compose.dev.yml`):**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: soilwise
      POSTGRES_USER: soilwise
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - soilwise-dev
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    networks:
      - soilwise-dev
    restart: unless-stopped

  # MQTT Broker (Mosquitto)
  mosquitto:
    image: eclipse-mosquitto:2.0
    volumes:
      - ./config/mosquitto-dev.conf:/mosquitto/config/mosquitto.conf
      - mosquitto_data:/mosquitto/data
      - mosquitto_logs:/mosquitto/log
    ports:
      - "1883:1883"     # MQTT
      - "9001:9001"     # WebSocket
    networks:
      - soilwise-dev
    restart: unless-stopped

  # ChromaDB Vector Database
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_dev_data:/chroma/chroma
    environment:
      CHROMA_SERVER_HOST: 0.0.0.0
      CHROMA_SERVER_HTTP_PORT: 8000
    networks:
      - soilwise-dev
    restart: unless-stopped

  # Ollama LLM Service
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_dev_data:/root/.ollama
    environment:
      OLLAMA_HOST: 0.0.0.0
    networks:
      - soilwise-dev
    restart: unless-stopped
    # Uncomment for GPU support
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

volumes:
  postgres_dev_data:
  redis_dev_data:
  mosquitto_data:
  mosquitto_logs:
  chroma_dev_data:
  ollama_dev_data:

networks:
  soilwise-dev:
    driver: bridge
```

### Option B: Native Local Services

**Install and Configure Services Locally:**

```bash
# PostgreSQL
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb soilwise
sudo -u postgres createuser soilwise
sudo -u postgres psql -c "ALTER USER soilwise PASSWORD 'password';"

# Redis
sudo apt-get install redis-server
sudo systemctl start redis-server

# MQTT Broker (Mosquitto)
sudo apt-get install mosquitto mosquitto-clients
sudo systemctl start mosquitto

# Ollama (Local LLM)
curl https://ollama.ai/install.sh | sh
ollama serve &
ollama pull llama3.1:8b

# ChromaDB (Python-based)
pip install chromadb
chroma run --host localhost --port 8000 &
```

---

## 🚀 Application Services

### Development Startup Sequence

**Terminal 1: Infrastructure**
```bash
# Start infrastructure services
npm run docker:dev
# Wait for services to be ready (30-60 seconds)
```

**Terminal 2: API Server & Backend**
```bash
# Start API server
cd apps/api-server
npm install
npm run migrate          # Setup database schema
npm run seed            # Add sample data
npm run dev             # Start server on :8081
```

**Terminal 3: Edge Hub**
```bash
# Start edge computing hub
cd apps/edge-hub
npm install
npm run setup-db        # Setup SQLite database
npm run dev             # Start server on :3002
```

**Terminal 4: Web Dashboard**
```bash
# Start React dashboard
cd apps/web-dashboard
npm install
npm run dev             # Start on :3005
```

**Terminal 5: PWA Farmer App**
```bash
# Start Progressive Web App
cd apps/pwa-farmer
npm install
npm run dev             # Start on :5179
```

**Terminal 6: AI Services (Optional)**
```bash
# Start AI advisory services
cd packages/ai-services
npm install
pip install -r requirements.txt
npm run dev             # Start on :8082
```

**Terminal 7: Voice Assistant (Optional)**
```bash
# Start voice processing
cd packages/voice-assistant
npm install
npm run install-models  # Download voice models
npm run dev             # Start WebSocket on :8083
```

### Single Command Startup

**All Services at Once:**
```bash
# Install all dependencies first
npm run install:all

# Start all services concurrently
npm run dev:all

# Or use Turbo for parallel builds
npm run turbo:dev
```

**Individual Service Control:**
```bash
npm run dev:api          # API server only
npm run dev:dashboard    # Web dashboard only
npm run dev:pwa         # PWA farmer app only
npm run dev:edge        # Edge hub only
npm run dev:ai          # AI services only
npm run dev:voice       # Voice assistant only
```

---

## 🧪 Testing & Data Emulation

### Edge Hub Data Simulation

**Enable Sensor Simulation:**

```bash
# In apps/edge-hub/.env.development
SIMULATE_SENSORS=true
SIMULATION_INTERVAL=5000  # 5 seconds
SENSOR_COUNT=10
FARM_COUNT=3
```

**Custom Data Simulator:**

```typescript
// apps/edge-hub/src/services/dataSimulator.ts
export class DataSimulator {
  private isRunning = false
  private interval: NodeJS.Timeout | null = null

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🔄 Starting sensor data simulation...')
    
    this.interval = setInterval(async () => {
      await this.generateSensorReadings()
    }, parseInt(process.env.SIMULATION_INTERVAL || '5000'))
  }

  private async generateSensorReadings(): Promise<void> {
    const sensors = [
      { id: 'soil-001', type: 'soil_moisture', farm: 'farm-alpha' },
      { id: 'temp-001', type: 'temperature', farm: 'farm-alpha' },
      { id: 'ph-001', type: 'ph', farm: 'farm-alpha' },
      { id: 'soil-002', type: 'soil_moisture', farm: 'farm-beta' },
      { id: 'light-001', type: 'light', farm: 'farm-beta' }
    ]

    for (const sensor of sensors) {
      const reading = this.generateReading(sensor.type)
      
      // Store locally
      await this.database.storeSensorReading({
        sensorId: sensor.id,
        type: sensor.type,
        value: reading.value,
        unit: reading.unit,
        timestamp: new Date(),
        farmId: sensor.farm
      })

      // Publish to MQTT
      await this.mqttService.publish(`sensors/${sensor.id}/data`, {
        sensorId: sensor.id,
        type: sensor.type,
        value: reading.value,
        unit: reading.unit,
        timestamp: new Date(),
        farmId: sensor.farm
      })
    }
  }

  private generateReading(type: string): { value: number; unit: string } {
    switch (type) {
      case 'soil_moisture':
        return { value: Math.random() * 100, unit: '%' }
      case 'temperature':
        return { value: 15 + Math.random() * 25, unit: '°C' }
      case 'ph':
        return { value: 6 + Math.random() * 2, unit: 'pH' }
      case 'light':
        return { value: Math.random() * 100000, unit: 'lux' }
      default:
        return { value: Math.random() * 100, unit: 'units' }
    }
  }
}
```

### Sample Data Loading

**Database Seeding Script:**

```bash
# Load sample farms, users, and sensors
npm run seed:dev

# Load historical sensor data (1000 readings)
npm run seed:sensors

# Reset database and reload all
npm run db:reset && npm run seed:all
```

**Custom Seed Data:**

```typescript
// apps/api-server/seeds/development_data.ts
export const developmentSeed = {
  farms: [
    {
      id: 'farm-alpha',
      name: 'Green Valley Farm',
      location: { lat: 40.7128, lng: -74.0060 },
      size: 50.5,
      cropType: 'tomatoes',
      irrigationType: 'drip'
    },
    {
      id: 'farm-beta', 
      name: 'Sunset Orchards',
      location: { lat: 34.0522, lng: -118.2437 },
      size: 25.0,
      cropType: 'apples',
      irrigationType: 'sprinkler'
    }
  ],
  sensors: [
    { id: 'soil-001', type: 'soil_moisture', farmId: 'farm-alpha' },
    { id: 'temp-001', type: 'temperature', farmId: 'farm-alpha' },
    { id: 'ph-001', type: 'ph', farmId: 'farm-alpha' }
  ],
  users: [
    { email: 'admin@soilwise.com', role: 'admin', farms: ['farm-alpha'] },
    { email: 'farmer@example.com', role: 'farmer', farms: ['farm-beta'] }
  ]
}
```

### Testing Workflows

**API Testing:**

```bash
# Test API health
curl http://localhost:8081/health

# Test authentication
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@soilwise.com","password":"admin123"}'

# Test sensor data endpoint
curl http://localhost:8081/api/v1/sensors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**MQTT Testing:**

```bash
# Subscribe to all sensor data
mosquitto_sub -h localhost -t 'sensors/+/data' -v

# Publish test sensor reading
mosquitto_pub -h localhost -t 'sensors/test-001/data' \
  -m '{"sensorId":"test-001","type":"soil_moisture","value":45.2,"timestamp":"2024-01-15T10:30:00Z"}'

# Monitor system events
mosquitto_sub -h localhost -t 'soilwise/system/+' -v
```

**WebSocket Testing:**

```javascript
// Browser console test
const socket = io('http://localhost:8081')
socket.on('connect', () => console.log('Connected!'))
socket.on('sensor:data', (data) => console.log('Sensor data:', data))
```

---

## 🐳 Docker Compose Setup

### Complete Development Stack

**Run Full Stack with Docker:**

```bash
# Start everything with Docker
npm run docker:dev:build  # Build + start
npm run docker:dev        # Start existing containers
npm run docker:dev:logs   # View logs
npm run docker:dev:down   # Stop and remove
```

**Production Docker Setup:**

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # API Server
  api-server:
    build:
      context: ./apps/api-server
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      MQTT_BROKER_URL: ${MQTT_BROKER_URL}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
      - mosquitto
    restart: unless-stopped
    networks:
      - soilwise-prod

  # Web Dashboard  
  web-dashboard:
    build:
      context: ./apps/web-dashboard
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
    networks:
      - soilwise-prod

  # Edge Hub (for cloud-deployed edge instances)
  edge-hub:
    build:
      context: ./apps/edge-hub
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      API_SERVER_URL: ${API_SERVER_URL}
      MQTT_BROKER_URL: ${MQTT_BROKER_URL}
    ports:
      - "3002:3002"
    volumes:
      - edge_data:/app/data
    restart: unless-stopped
    networks:
      - soilwise-prod

  # Infrastructure services...
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - soilwise-prod
    restart: unless-stopped

volumes:
  postgres_prod_data:
  edge_data:

networks:
  soilwise-prod:
    driver: bridge
```

### Raspberry Pi Edge Deployment

**Edge-Specific Docker Compose:**

```yaml
# docker-compose.pi.yml
version: '3.8'

services:
  edge-hub:
    build:
      context: ./apps/edge-hub
      dockerfile: Dockerfile.pi
    environment:
      NODE_ENV: production
      DEVICE_TYPE: raspberry-pi
      API_SERVER_URL: ${CLOUD_API_URL}
      MQTT_BROKER_URL: mqtt://localhost:1883
    ports:
      - "3002:3002"
    volumes:
      - ./data:/app/data
      - /dev:/dev  # Hardware access
    privileged: true  # For sensor access
    restart: unless-stopped

  mosquitto:
    image: eclipse-mosquitto:2.0
    volumes:
      - ./config/mosquitto-pi.conf:/mosquitto/config/mosquitto.conf
      - ./data/mqtt:/mosquitto/data
    ports:
      - "1883:1883"
      - "9001:9001"
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ./models:/root/.ollama
    environment:
      OLLAMA_HOST: 0.0.0.0
    restart: unless-stopped
```

---

## 🚀 Deployment Flows

### Cloud Deployment (Production)

**1. Build and Push Images:**

```bash
# Build production images
npm run build
docker build -t soilwise/api-server:latest ./apps/api-server
docker build -t soilwise/web-dashboard:latest ./apps/web-dashboard

# Push to registry
docker push soilwise/api-server:latest
docker push soilwise/web-dashboard:latest
```

**2. Deploy with Kubernetes:**

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/api-server.yaml
kubectl apply -f k8s/web-dashboard.yaml

# Check deployment status
kubectl get pods -n soilwise
kubectl get services -n soilwise
```

**3. Automated Deployment Script:**

```bash
#!/bin/bash
# scripts/deploy-cloud.sh

set -e

echo "🚀 Deploying SoilWise to Cloud..."

# Build and test
npm run build
npm run test:production

# Build Docker images
docker build -t $REGISTRY/soilwise-api:$VERSION ./apps/api-server
docker build -t $REGISTRY/soilwise-dashboard:$VERSION ./apps/web-dashboard

# Push images
docker push $REGISTRY/soilwise-api:$VERSION
docker push $REGISTRY/soilwise-dashboard:$VERSION

# Update Kubernetes deployments
kubectl set image deployment/api-server api-server=$REGISTRY/soilwise-api:$VERSION -n soilwise
kubectl set image deployment/web-dashboard web-dashboard=$REGISTRY/soilwise-dashboard:$VERSION -n soilwise

# Wait for rollout
kubectl rollout status deployment/api-server -n soilwise
kubectl rollout status deployment/web-dashboard -n soilwise

echo "✅ Cloud deployment complete!"
```

### Edge Deployment (Raspberry Pi)

**1. Raspberry Pi Setup Script:**

```bash
#!/bin/bash
# scripts/setup-raspberry-pi.sh

echo "🥧 Setting up SoilWise on Raspberry Pi..."

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup project
git clone https://github.com/your-org/soilwise.git
cd soilwise
npm install

# Configure for Pi
cp .env.pi .env
cp config/mosquitto-pi.conf config/mosquitto.conf

# Setup hardware permissions
sudo usermod -a -G dialout $USER
sudo systemctl enable ssh

echo "✅ Raspberry Pi setup complete!"
echo "Please reboot and run: npm run deploy:edge"
```

**2. Edge Deployment Script:**

```bash
#!/bin/bash
# scripts/deploy-edge.sh

set -e

echo "🔧 Deploying SoilWise Edge Hub..."

# Build edge-specific images
docker-compose -f docker-compose.pi.yml build

# Stop existing services
docker-compose -f docker-compose.pi.yml down

# Start updated services
docker-compose -f docker-compose.pi.yml up -d

# Verify deployment
sleep 10
curl -f http://localhost:3002/health || exit 1

echo "✅ Edge deployment complete!"
echo "Edge Hub running at: http://$(hostname -I | awk '{print $1}'):3002"
```

**3. Remote Edge Management:**

```bash
# Deploy to specific Pi devices
./scripts/deploy-edge-remote.sh pi-farm-001.local
./scripts/deploy-edge-remote.sh pi-farm-002.local

# Bulk deployment
cat edge-devices.txt | xargs -I {} ./scripts/deploy-edge-remote.sh {}
```

### Continuous Deployment

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy SoilWise

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy-cloud:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloud
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
          REGISTRY_TOKEN: ${{ secrets.REGISTRY_TOKEN }}
        run: |
          ./scripts/deploy-cloud.sh

  deploy-edge:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Edge Devices
        env:
          EDGE_DEVICES: ${{ secrets.EDGE_DEVICES }}
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          ./scripts/deploy-edge-bulk.sh
```

---

## 📊 Monitoring & Maintenance

### Health Checks

**System Health Dashboard:**

```bash
# Check all service health
npm run health-check

# Individual service checks
curl http://localhost:8081/health      # API Server
curl http://localhost:3002/health      # Edge Hub
curl http://localhost:8000/api/v1/     # ChromaDB
curl http://localhost:11434/api/tags   # Ollama
```

**Health Check Endpoints:**

```typescript
// apps/api-server/src/routes/health.ts
app.get('/health', async (req, res) => {
  const health = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version,
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(), 
      mqtt: await checkMQTT(),
      ai: await checkAIService()
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  }
  
  const allHealthy = Object.values(health.services).every(s => s.status === 'healthy')
  res.status(allHealthy ? 200 : 503).json(health)
})
```

### Logging & Metrics

**Centralized Logging:**

```typescript
// Structured logging configuration
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: process.env.SERVICE_NAME,
    version: process.env.npm_package_version 
  },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```

**Metrics Collection:**

```bash
# View service metrics
npm run metrics

# Export metrics for monitoring tools
curl http://localhost:8081/metrics > metrics.json

# Monitor system resources
npm run monitor:system
```

### Backup & Recovery

**Database Backup:**

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump $DATABASE_URL > $BACKUP_DIR/postgres.sql

# SQLite backup (edge devices)
sqlite3 ./data/soilwise-edge.db ".backup $BACKUP_DIR/edge.db"

# ChromaDB backup
curl http://localhost:8000/api/v1/collections > $BACKUP_DIR/chromadb.json

echo "✅ Backup completed: $BACKUP_DIR"
```

**Automated Backups:**

```bash
# Add to crontab
0 2 * * * /path/to/soilwise/scripts/backup-database.sh
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. **Port Conflicts**

```bash
# Find what's using a port
lsof -i :8081
netstat -tulpn | grep :8081

# Kill process
kill -9 <PID>

# Use different ports
PORT=8082 npm run dev:api
```

#### 2. **Docker Issues**

```bash
# Reset Docker environment
docker-compose down -v
docker system prune -a
npm run docker:dev

# Check Docker logs
docker-compose logs api-server
docker-compose logs postgres
```

#### 3. **Database Connection Issues**

```bash
# Test PostgreSQL connection
psql postgresql://soilwise:password@localhost:5432/soilwise -c "SELECT 1"

# Reset database
npm run db:reset
npm run db:migrate
npm run seed:dev
```

#### 4. **MQTT Connection Problems**

```bash
# Test MQTT broker
mosquitto_pub -h localhost -t test -m "hello"
mosquitto_sub -h localhost -t test

# Check broker config
cat config/mosquitto-dev.conf

# Restart broker
docker-compose restart mosquitto
```

#### 5. **AI Services Not Working**

```bash
# Check Ollama status
curl http://localhost:11434/api/version

# Pull models
ollama pull llama3.1:8b

# Check ChromaDB
curl http://localhost:8000/api/v1/heartbeat
```

### Debug Commands

```bash
# Enable debug logging
DEBUG=soilwise:* npm run dev

# Check service dependencies
npm run check:deps

# Validate environment
npm run validate-env

# Run system diagnostics
npm run diagnose

# Test all integrations
npm run test:integration
```

### Emergency Recovery

**Complete System Reset:**

```bash
#!/bin/bash
# scripts/emergency-reset.sh

echo "🚨 Emergency system reset..."

# Stop all services
npm run docker:dev:down
pkill -f "node.*soilwise"

# Clear data
rm -rf data/ logs/
docker volume prune -f

# Reinstall and restart
npm run clean
npm install
npm run docker:dev
npm run seed:dev

echo "✅ System reset complete"
```

---

## 📋 Quick Reference

### Essential Commands

```bash
# Development
npm run dev                 # Start all services
npm run dev:api            # API server only
npm run dev:dashboard      # Dashboard only
npm run dev:pwa           # PWA only
npm run dev:edge          # Edge hub only

# Infrastructure
npm run docker:dev         # Start Docker services
npm run docker:dev:logs    # View logs
npm run docker:dev:down    # Stop services

# Database
npm run db:migrate         # Run migrations
npm run db:seed           # Load sample data
npm run db:reset          # Reset database

# Testing
npm run test              # Run all tests
npm run test:integration  # Integration tests
npm run health-check      # Check system health

# Deployment
npm run build             # Build for production
npm run deploy:cloud      # Deploy to cloud
npm run deploy:edge       # Deploy to edge devices

# Maintenance
npm run backup            # Backup databases
npm run logs              # View all logs
npm run metrics          # System metrics
npm run diagnose         # System diagnostics
```

### Service URLs

| Service | Development URL | Purpose |
|---------|----------------|---------|
| Web Dashboard | http://localhost:3005 | Farm management UI |
| PWA Farmer App | http://localhost:5179 | Mobile farmer interface |
| API Server | http://localhost:8081 | Cloud backend API |
| Edge Hub | http://localhost:3002 | Edge computing service |
| AI Services | http://localhost:8082 | AI/ML processing |
| Voice Assistant | ws://localhost:8083 | Voice processing |
| PostgreSQL | localhost:5432 | Cloud database |
| Redis | localhost:6379 | Cache & sessions |
| MQTT Broker | localhost:1883 | IoT messaging |
| MQTT WebSocket | ws://localhost:9001 | Browser MQTT |
| ChromaDB | http://localhost:8000 | Vector database |
| Ollama | http://localhost:11434 | Local LLM |

---

*This guide covers complete development setup and deployment workflows. Keep it updated as the platform evolves.*
