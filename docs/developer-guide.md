# SoilWise Developer Guidebook

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Development Environment Setup](#development-environment-setup)
4. [Running the Full System](#running-the-full-system)
5. [Code Examples & Patterns](#code-examples--patterns)
6. [Best Practices](#best-practices)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Contributing Guidelines](#contributing-guidelines)

---

## 🌾 Project Overview

SoilWise is an **offline-first agriculture SaaS platform** that combines:
- **IoT sensor monitoring** (soil, weather, crop conditions)
- **AI-powered crop advisory** (disease detection, yield optimization)
- **Voice-enabled assistance** (hands-free field operations)
- **Edge computing** (Raspberry Pi-based local processing)
- **Hybrid cloud-local architecture** (works with/without internet)

### Key Architectural Principles
- **Offline-first design** - All apps work without internet
- **Event-driven communication** - MQTT, Socket.io, REST APIs
- **Microservices architecture** - Independent, scalable services
- **Edge computing** - Local AI inference and data processing
- **Progressive Web Apps** - Mobile-first, installable applications

---

## 🏗️ Monorepo Structure

```
soilwise/
├── 📱 apps/                           # Main applications
│   ├── web-dashboard/                 # React cloud dashboard
│   ├── pwa-farmer/                   # Offline-first mobile PWA
│   ├── api-server/                   # Node.js cloud backend
│   └── edge-hub/                     # Raspberry Pi edge computing
├── 📦 packages/                       # Shared packages
│   ├── ai-services/                  # AI/ML processing engine
│   └── voice-assistant/              # Speech processing
├── 📖 docs/                          # Documentation
├── 🐳 docker/                        # Docker configurations
├── ⚙️ scripts/                       # Automation scripts
├── ☸️ k8s/                           # Kubernetes manifests
└── 🔧 config/                        # Configuration files
```

### Application Responsibilities

| App | Responsibility | Tech Stack | Port |
|-----|---------------|------------|------|
| **web-dashboard** | Cloud management interface | React + TypeScript + Redux | 3005 |
| **pwa-farmer** | Field worker mobile app | React + PWA + IndexedDB | 5179 |
| **api-server** | Cloud backend API | Node.js + Express + PostgreSQL | 8081 |
| **edge-hub** | Local edge processing | Node.js + SQLite + IoT | 3002 |

### Package Responsibilities

| Package | Responsibility | Key Technologies |
|---------|---------------|------------------|
| **ai-services** | Crop advisory & ML | LangChain + Ollama + ChromaDB |
| **voice-assistant** | Speech processing | Whisper + Coqui TTS + WebSocket |

---

## 🚀 Development Environment Setup

### Prerequisites

```bash
# Node.js 18+
node --version  # >= 18.0.0
npm --version   # >= 8.0.0

# Git
git --version

# Docker (optional, for containers)
docker --version
docker-compose --version
```

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-org/soilwise.git
cd soilwise

# Install all dependencies
npm install

# Validate installation
npm run validate-env
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Generate secure secrets (Linux/macOS)
./setup.sh

# Or manually edit .env with your configuration
```

#### Required Environment Variables

```bash
# Core Configuration
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL=postgresql://admin:password@localhost:5432/soilwise
DB_PASSWORD=your_secure_password

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=soilwise
MQTT_PASSWORD=soilwise_mqtt_pass

# AI Services
OPENAI_API_KEY=your_openai_key          # Optional, for cloud AI
OLLAMA_API_URL=http://localhost:11434   # Local LLM

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
SESSION_SECRET=your_session_secret_here
```

### 3. Individual App Setup

#### 🌐 Web Dashboard (React Cloud UI)

```bash
cd apps/web-dashboard

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Edit VITE_API_URL, VITE_MQTT_BROKER_URL

# Run development server
npm run dev
# Access: http://localhost:3005
```

**Tech Requirements:**
- React 18 + TypeScript
- Vite build system
- Redux Toolkit (state management)
- Tailwind CSS (styling)

#### 📱 PWA Farmer App (Mobile Offline-First)

```bash
cd apps/pwa-farmer

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Edit VITE_API_URL, VITE_EDGE_HUB_URL

# Run development server
npm run dev
# Access: http://localhost:5179

# Build for mobile
npm run cap:build
```

**Tech Requirements:**
- React 18 + TypeScript
- Capacitor (mobile deployment)
- Dexie (IndexedDB wrapper)
- PWA capabilities

#### ⚡ API Server (Cloud Backend)

```bash
cd apps/api-server

# Install dependencies
npm install

# Database setup
npm run migrate
npm run seed

# Run development server
npm run dev
# Access: http://localhost:8081
```

**Tech Requirements:**
- Node.js + Express
- PostgreSQL database
- Redis cache
- Socket.io for real-time

#### 🔧 Edge Hub (Raspberry Pi)

```bash
cd apps/edge-hub

# Install dependencies
npm install

# Setup local database
npm run setup-db

# Install AI models (optional)
npm run install-ai

# Run development server
npm run dev
# Access: http://localhost:3002
```

**Tech Requirements:**
- Node.js + Express
- SQLite local database
- Serial communication
- MQTT client

### 4. Package Setup

#### 🤖 AI Services

```bash
cd packages/ai-services

# Install dependencies
npm install
pip install -r requirements.txt

# Install models
npm run install-models

# Run service
npm run dev
# Access: http://localhost:8082
```

#### 🎙️ Voice Assistant

```bash
cd packages/voice-assistant

# Install dependencies
npm install

# Install voice models
npm run install-models

# Run service
npm run dev
# Access: WebSocket on port 8083
```

---

## 🚀 Running the Full System

### Development Mode (All Services)

```bash
# Start all services concurrently
npm run dev

# Or start individual services
npm run dev:api          # API server only
npm run dev:dashboard    # Web dashboard only  
npm run dev:pwa         # PWA farmer app only
npm run dev:edge        # Edge hub only
```

### Docker Development

```bash
# Start core infrastructure
npm run docker:dev

# Or manually with docker-compose
docker-compose -f docker-compose.dev.yml up -d

# View logs
npm run docker:dev:logs
```

### Production Deployment

```bash
# Build all applications
npm run build

# Deploy to cloud
npm run deploy:cloud

# Deploy to Raspberry Pi
npm run deploy:edge
```

### Service Access Points

Once running, access services at:

| Service | URL | Purpose |
|---------|-----|---------|
| Web Dashboard | http://localhost:3005 | Farm management interface |
| PWA Farmer App | http://localhost:5179 | Mobile field worker app |
| API Server | http://localhost:8081 | Cloud backend API |
| Edge Hub | http://localhost:3002 | Local edge processing |
| AI Services | http://localhost:8082 | AI/ML processing |
| Voice Assistant | ws://localhost:8083 | Voice processing |

---

## 💻 Code Examples & Patterns

### 1. Real-Time Soil Sensor Data Flow

#### Device → Edge Hub → API → Dashboard

**Edge Hub: Sensor Data Collection**

```typescript
// apps/edge-hub/src/services/sensorManager.ts
import { SerialPort } from 'serialport'
import { MQTTService } from './mqttService'

export class SensorManager {
  private mqttService: MQTTService

  async processSensorData(rawData: Buffer): Promise<void> {
    // Parse sensor data
    const sensorData = this.parseSensorReading(rawData)
    
    // Store locally (offline-first)
    await this.database.storeSensorReading(sensorData)
    
    // Publish to MQTT for real-time updates
    await this.mqttService.publish(`sensors/${sensorData.sensorId}/data`, {
      sensorId: sensorData.sensorId,
      type: sensorData.type,
      value: sensorData.value,
      timestamp: sensorData.timestamp,
      location: sensorData.location
    })
    
    // Sync to cloud API (when online)
    if (this.isOnline()) {
      await this.syncToCloud(sensorData)
    }
  }

  private parseSensorReading(rawData: Buffer): SensorData {
    // Parse Arduino/sensor protocol
    const parsed = JSON.parse(rawData.toString())
    return {
      sensorId: parsed.id,
      type: parsed.type as SensorType,
      value: parseFloat(parsed.value),
      unit: parsed.unit,
      timestamp: new Date(),
      location: parsed.location
    }
  }
}
```

**API Server: Real-Time Broadcasting**

```typescript
// apps/api-server/src/services/mqtt.ts
import mqtt from 'mqtt'
import { Server } from 'socket.io'

export class MQTTService {
  private client: mqtt.MqttClient
  private io: Server

  constructor(io: Server) {
    this.io = io
    this.client = mqtt.connect(process.env.MQTT_BROKER_URL)
    this.setupSubscriptions()
  }

  private setupSubscriptions(): void {
    // Subscribe to all sensor data
    this.client.subscribe('sensors/+/data', (err) => {
      if (err) logger.error('MQTT subscription error:', err)
    })

    // Handle incoming sensor data
    this.client.on('message', async (topic, message) => {
      try {
        const sensorData = JSON.parse(message.toString())
        
        // Store in cloud database
        await this.storeSensorData(sensorData)
        
        // Broadcast to connected dashboards
        this.io.emit('sensor:data', sensorData)
        
        // Trigger AI analysis if needed
        if (this.shouldTriggerAI(sensorData)) {
          await this.triggerAIAnalysis(sensorData)
        }
      } catch (error) {
        logger.error('Error processing sensor data:', error)
      }
    })
  }
}
```

**Dashboard: Real-Time Updates**

```typescript
// apps/web-dashboard/src/hooks/useMqttConnection.ts
import mqtt, { MqttClient } from 'mqtt'
import { useAppDispatch } from '../store'
import { updateSensorReading } from '../store/slices/sensorSlice'

export const useMqttConnection = () => {
  const dispatch = useAppDispatch()
  const [client, setClient] = useState<MqttClient | null>(null)

  useEffect(() => {
    const mqttClient = mqtt.connect(import.meta.env.VITE_MQTT_BROKER_URL, {
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
    })

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker')
      
      // Subscribe to all sensor data
      mqttClient.subscribe('sensors/+/data')
    })

    mqttClient.on('message', (topic, message) => {
      try {
        const sensorData = JSON.parse(message.toString())
        
        // Update Redux store with real-time data
        dispatch(updateSensorReading(sensorData))
        
        // Trigger alerts if values are critical
        if (sensorData.value > CRITICAL_THRESHOLDS[sensorData.type]) {
          dispatch(addAlert({
            type: 'warning',
            message: `Critical ${sensorData.type} reading: ${sensorData.value}`,
            sensorId: sensorData.sensorId
          }))
        }
      } catch (error) {
        console.error('Error processing MQTT message:', error)
      }
    })

    setClient(mqttClient)
    return () => mqttClient.end()
  }, [dispatch])

  return { client, isConnected: client?.connected || false }
}
```

### 2. Offline Sync in PWA

**PWA: Offline Data Management**

```typescript
// apps/pwa-farmer/src/services/syncService.ts
import Dexie, { Table } from 'dexie'

interface OfflineAction {
  id?: number
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  table: string
  data: any
  timestamp: Date
  synced: boolean
}

class SyncDatabase extends Dexie {
  sensors!: Table<SensorData>
  readings!: Table<SensorReading>
  actions!: Table<OfflineAction>

  constructor() {
    super('SoilWiseOffline')
    this.version(1).stores({
      sensors: '++id, sensorId, farmId, type',
      readings: '++id, sensorId, timestamp, value',
      actions: '++id, timestamp, synced'
    })
  }
}

export class SyncService {
  private db = new SyncDatabase()
  private isOnline = navigator.onLine

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  // Store data locally and queue for sync
  async createReading(reading: SensorReading): Promise<void> {
    // Store data locally immediately
    await this.db.readings.add(reading)
    
    // Queue sync action
    await this.db.actions.add({
      type: 'CREATE',
      table: 'readings',
      data: reading,
      timestamp: new Date(),
      synced: false
    })

    // Try to sync if online
    if (this.isOnline) {
      await this.syncPendingActions()
    }
  }

  // Sync pending actions when back online
  private async syncPendingActions(): Promise<void> {
    const pendingActions = await this.db.actions
      .where('synced')
      .equals(false)
      .toArray()

    for (const action of pendingActions) {
      try {
        await this.syncAction(action)
        await this.db.actions.update(action.id!, { synced: true })
      } catch (error) {
        console.error('Failed to sync action:', error)
        // Will retry on next sync
      }
    }
  }

  private async syncAction(action: OfflineAction): Promise<void> {
    const endpoint = `${API_BASE_URL}/${action.table}`
    
    switch (action.type) {
      case 'CREATE':
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
        break
      
      case 'UPDATE':
        await fetch(`${endpoint}/${action.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
        break
      
      case 'DELETE':
        await fetch(`${endpoint}/${action.data.id}`, {
          method: 'DELETE'
        })
        break
    }
  }

  private async handleOnline(): Promise<void> {
    this.isOnline = true
    await this.syncPendingActions()
  }

  private handleOffline(): void {
    this.isOnline = false
  }
}
```

### 3. AI Agent Calling Advisory Engine

**AI Advisory Service Integration**

```typescript
// packages/ai-services/src/advisory/cropAdvisor.ts
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ChromaVectorStore } from '@langchain/community/vectorstores/chroma'
import { OpenAIEmbeddings } from '@langchain/openai'

export class CropAdvisor {
  private llm: ChatOllama
  private vectorStore: ChromaVectorStore
  private embeddings: OpenAIEmbeddings

  constructor() {
    this.llm = new ChatOllama({
      baseUrl: process.env.OLLAMA_API_URL,
      model: 'llama3.1:8b',
      temperature: 0.2
    })

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    })

    this.vectorStore = new ChromaVectorStore(this.embeddings, {
      url: process.env.CHROMADB_URL,
      collectionName: 'agricultural_knowledge'
    })
  }

  async generateRecommendation(
    sensorData: SensorData[],
    cropType: string,
    farmContext: FarmContext
  ): Promise<AdvisoryRecommendation> {
    
    // 1. Analyze current conditions
    const conditions = this.analyzeSensorData(sensorData)
    
    // 2. Search for relevant agricultural knowledge
    const relevantKnowledge = await this.searchKnowledgeBase(
      `${cropType} optimal conditions soil moisture temperature pH`,
      5
    )
    
    // 3. Generate contextualized recommendation
    const prompt = this.buildAdvisoryPrompt(
      conditions,
      cropType,
      farmContext,
      relevantKnowledge
    )
    
    const response = await this.llm.invoke(prompt)
    
    // 4. Parse and structure response
    return this.parseAdvisoryResponse(response.content, conditions)
  }

  private buildAdvisoryPrompt(
    conditions: AnalyzedConditions,
    cropType: string,
    context: FarmContext,
    knowledge: string[]
  ): string {
    return `
You are an expert agricultural advisor. Based on the following information, provide specific recommendations:

CURRENT CONDITIONS:
- Soil Moisture: ${conditions.soilMoisture}% (${conditions.soilMoistureStatus})
- Temperature: ${conditions.temperature}°C (${conditions.temperatureStatus})
- pH Level: ${conditions.ph} (${conditions.phStatus})
- Light Level: ${conditions.light}% (${conditions.lightStatus})

CROP: ${cropType}
FARM CONTEXT:
- Location: ${context.location}
- Size: ${context.size} hectares  
- Irrigation: ${context.irrigationType}
- Growing Stage: ${context.growingStage}

RELEVANT KNOWLEDGE:
${knowledge.join('\n\n')}

TASK:
Provide specific, actionable recommendations for:
1. Immediate actions needed (next 24-48 hours)
2. Irrigation scheduling
3. Potential issues to monitor
4. Optimal timing for next activities

Format as JSON with clear action items and reasoning.
    `
  }

  private async searchKnowledgeBase(
    query: string,
    limit: number
  ): Promise<string[]> {
    const results = await this.vectorStore.similaritySearch(query, limit)
    return results.map(doc => doc.pageContent)
  }

  private parseAdvisoryResponse(
    response: string,
    conditions: AnalyzedConditions
  ): AdvisoryRecommendation {
    try {
      const parsed = JSON.parse(response)
      return {
        id: this.generateId(),
        timestamp: new Date(),
        conditions,
        recommendations: parsed.recommendations || [],
        urgency: this.calculateUrgency(conditions),
        confidence: parsed.confidence || 0.8
      }
    } catch (error) {
      // Fallback parsing for non-JSON responses
      return this.parseTextResponse(response, conditions)
    }
  }
}
```

**Edge Hub: AI Integration**

```typescript
// apps/edge-hub/src/services/aiService.ts
import { CropAdvisor } from '@soilwise/ai-services'

export class AIService {
  private cropAdvisor: CropAdvisor
  private isLocalAIAvailable = false

  constructor() {
    this.cropAdvisor = new CropAdvisor()
    this.checkLocalAIAvailability()
  }

  async requestAdvisory(farmId: string): Promise<AdvisoryRecommendation> {
    try {
      // Get recent sensor data
      const sensorData = await this.database.getRecentReadings(farmId, 24) // Last 24 hours
      
      // Get farm context
      const farmContext = await this.database.getFarmContext(farmId)
      
      // Generate recommendation
      const recommendation = await this.cropAdvisor.generateRecommendation(
        sensorData,
        farmContext.cropType,
        farmContext
      )
      
      // Store recommendation locally
      await this.database.storeRecommendation(recommendation)
      
      // Broadcast to connected clients
      this.broadcastRecommendation(recommendation)
      
      return recommendation
      
    } catch (error) {
      logger.error('AI advisory generation failed:', error)
      
      // Fallback to rule-based recommendations
      return this.generateRuleBasedRecommendation(farmId)
    }
  }

  private async checkLocalAIAvailability(): Promise<void> {
    try {
      const response = await fetch(`${process.env.OLLAMA_API_URL}/api/tags`)
      this.isLocalAIAvailable = response.ok
      logger.info(`Local AI availability: ${this.isLocalAIAvailable}`)
    } catch (error) {
      this.isLocalAIAvailable = false
      logger.warn('Local AI not available, will use cloud fallback')
    }
  }
}
```

---

## 📋 Best Practices

### Folder Conventions

```
apps/[app-name]/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components/routes
│   ├── services/          # Business logic services
│   ├── hooks/             # Custom React hooks
│   ├── store/             # State management
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── config/            # Configuration files
├── public/                # Static assets
├── tests/                 # Test files
└── package.json
```

### Environment Variables

**Naming Convention:**
```bash
# Format: [SERVICE]_[CATEGORY]_[NAME]
MQTT_BROKER_URL=mqtt://localhost:1883
API_SERVER_PORT=8080
AI_SERVICE_OLLAMA_URL=http://localhost:11434
DASHBOARD_WEB_URL=http://localhost:3005

# Security-related (always required)
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
DB_PASSWORD=your_db_password
```

**Environment Files:**
```
.env.example          # Template with all variables
.env                  # Local development (gitignored)
.env.production       # Production values (encrypted)
.env.test            # Test environment values
```

### MQTT Topic Naming

**Standard Topic Structure:**
```
soilwise/
├── sensors/
│   ├── [sensor-id]/
│   │   ├── data              # Real-time sensor readings
│   │   ├── status            # Sensor online/offline status
│   │   └── config            # Configuration updates
│   └── discovery/            # New sensor announcements
├── farms/
│   ├── [farm-id]/
│   │   ├── alerts            # Farm-specific alerts
│   │   ├── irrigation        # Irrigation commands
│   │   └── recommendations   # AI recommendations
│   └── management/           # Farm management events
├── devices/
│   ├── [device-id]/
│   │   ├── commands          # Device control commands
│   │   ├── status            # Device health status
│   │   └── telemetry         # Device telemetry data
│   └── edge-hubs/            # Edge hub coordination
└── system/
    ├── sync/                 # Data synchronization events
    ├── maintenance/          # System maintenance
    └── monitoring/           # System health monitoring
```

**Topic Examples:**
```bash
# Sensor data
soilwise/sensors/soil-001/data
soilwise/sensors/temp-002/status

# Farm management
soilwise/farms/farm-alpha/alerts
soilwise/farms/farm-alpha/recommendations

# Device control
soilwise/devices/irrigation-pump-01/commands
soilwise/devices/edge-hub-01/telemetry

# System events
soilwise/system/sync/cloud-to-edge
soilwise/system/monitoring/health-check
```

### API Route Conventions

**RESTful API Structure:**
```
/api/v1/
├── /auth/                   # Authentication endpoints
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh
├── /farms/                  # Farm management
│   ├── GET /                # List farms
│   ├── POST /               # Create farm
│   ├── GET /:id             # Get farm details
│   ├── PUT /:id             # Update farm
│   └── DELETE /:id          # Delete farm
├── /sensors/                # Sensor management
│   ├── GET /                # List sensors
│   ├── POST /               # Register sensor
│   ├── GET /:id             # Get sensor details
│   ├── PUT /:id             # Update sensor
│   ├── DELETE /:id          # Delete sensor
│   └── GET /:id/readings    # Get sensor readings
├── /ai/                     # AI services
│   ├── POST /advisory       # Request crop advisory
│   ├── POST /analysis       # Data analysis
│   └── GET /recommendations # Get recommendations
└── /sync/                   # Data synchronization
    ├── POST /upload         # Upload offline data
    ├── GET /download        # Download updates
    └── GET /status          # Sync status
```

### Error Handling

**Standardized Error Response:**
```typescript
interface APIError {
  success: false
  error: {
    code: string           // ERROR_CODE_CONSTANT
    message: string        // Human-readable message
    details?: any         // Additional error details
    timestamp: string     // ISO timestamp
    requestId: string     // Unique request identifier
  }
}

// Example usage
res.status(400).json({
  success: false,
  error: {
    code: 'INVALID_SENSOR_DATA',
    message: 'Sensor reading value is outside valid range',
    details: { value: -50, validRange: [0, 100] },
    timestamp: new Date().toISOString(),
    requestId: req.id
  }
})
```

### Database Conventions

**Table Naming:**
```sql
-- Singular nouns, snake_case
users
farms
sensors
sensor_readings
ai_recommendations
sync_logs

-- Junction tables
user_farms
sensor_farms
```

**Column Naming:**
```sql
-- Standard columns for all tables
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
deleted_at      TIMESTAMP NULL                        -- Soft delete

-- Foreign keys
user_id         UUID REFERENCES users(id)
farm_id         UUID REFERENCES farms(id)
sensor_id       UUID REFERENCES sensors(id)
```

### Logging Standards

```typescript
// Use structured logging with consistent format
import { logger } from '../utils/logger'

// Log levels: error, warn, info, debug
logger.error('Database connection failed', {
  component: 'DatabaseService',
  operation: 'connect',
  error: error.message,
  timestamp: new Date().toISOString()
})

logger.info('Sensor data received', {
  component: 'SensorManager',
  sensorId: 'soil-001',
  dataType: 'soil_moisture',
  value: 45.2,
  farmId: 'farm-alpha'
})
```

---

## 🔧 Troubleshooting Guide

### Common Development Issues

#### 1. **Services Won't Start**

**Problem:** `npm run dev` fails with port conflicts

**Solution:**
```bash
# Check what's running on ports
lsof -i :3000  # or netstat -tulpn | grep :3000

# Kill processes if needed
kill -9 <PID>

# Or use different ports
PORT=3001 npm run dev:api
```

#### 2. **Database Connection Issues**

**Problem:** PostgreSQL connection refused

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check connection string in .env
DATABASE_URL=postgresql://admin:password@localhost:5432/soilwise

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### 3. **MQTT Connection Failures**

**Problem:** MQTT broker not reachable

**Solution:**
```bash
# Start Mosquitto broker
docker run -it -p 1883:1883 eclipse-mosquitto:2.0

# Test MQTT connection
mosquitto_pub -h localhost -t test -m "hello"
mosquitto_sub -h localhost -t test

# Check firewall/network settings
telnet localhost 1883
```

#### 4. **AI Services Not Working**

**Problem:** Ollama/LLM not responding

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Start Ollama
ollama serve

# Pull required model
ollama pull llama3.1:8b

# Check GPU availability (optional)
nvidia-smi
```

#### 5. **PWA Not Installing**

**Problem:** Service worker registration fails

**Solution:**
```bash
# Ensure HTTPS in production
# Check service worker registration in browser DevTools
# Verify manifest.json is accessible

# Development: test PWA features
npm run build
npm run preview  # Serves built app
```

### Edge Hub Specific Issues

#### 1. **Serial Port Access Denied**

**Problem:** Cannot access `/dev/ttyUSB0` or `/dev/ttyACM0`

**Solution (Linux):**
```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER

# Or set permissions
sudo chmod 666 /dev/ttyUSB0

# List available serial ports
ls -la /dev/tty*
```

#### 2. **Raspberry Pi Performance Issues**

**Problem:** Edge hub runs slowly or crashes

**Solution:**
```bash
# Check system resources
htop
df -h
free -h

# Optimize Node.js for Pi
NODE_OPTIONS="--max-old-space-size=512" npm start

# Monitor temperature
vcgencmd measure_temp
```

### Debug Commands

```bash
# View logs for all services
npm run logs

# Debug specific service
DEBUG=soilwise:* npm run dev:api

# Check service health
curl http://localhost:8081/health
curl http://localhost:3002/health

# Monitor MQTT traffic
mosquitto_sub -h localhost -t 'soilwise/+/+' -v

# Test database connectivity
npm run db:test

# Validate environment
npm run validate-env
```

### Performance Monitoring

```bash
# Monitor API server performance
curl http://localhost:8081/metrics

# Check database performance
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity"

# Monitor MQTT broker
curl http://localhost:15675/api/overview  # RabbitMQ management

# System resource monitoring
docker stats  # If using Docker
```

---

## 🤝 Contributing Guidelines

### Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/soilwise.git
   cd soilwise
   git remote add upstream https://github.com/original-org/soilwise.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/sensor-calibration
   ```

3. **Development**
   ```bash
   npm install
   npm run dev
   # Make your changes
   npm run test
   npm run lint
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add sensor calibration feature"
   git push origin feature/sensor-calibration
   ```

5. **Create Pull Request**
   - Fill out PR template
   - Ensure CI passes
   - Request review

### Code Quality Standards

**TypeScript:**
```typescript
// Use strict typing
interface SensorReading {
  sensorId: string
  value: number
  timestamp: Date
  unit: string
}

// Avoid any, use specific types
const readings: SensorReading[] = []

// Use proper error handling
try {
  await sensorService.getReading(id)
} catch (error: unknown) {
  if (error instanceof SensorError) {
    logger.error('Sensor error:', error.message)
  }
}
```

**Testing Requirements:**
```bash
# Unit tests required for all services
npm run test

# Integration tests for API endpoints
npm run test:integration

# E2E tests for critical user flows
npm run test:e2e

# Minimum 80% code coverage
npm run test:coverage
```

**Linting:**
```bash
# ESLint for code quality
npm run lint

# Prettier for formatting
npm run format

# TypeScript type checking
npm run type-check
```

### Git Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add sensor calibration API endpoint
fix: resolve MQTT connection timeout issue
docs: update API documentation
style: format sensor service code
refactor: simplify data validation logic
test: add unit tests for crop advisor
chore: update dependencies
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

---

## 📞 Getting Help

### Documentation
- **[Project Overview](../README.md)** - Start here
- **[API Documentation](api/README.md)** - Complete API reference
- **[Architecture Guide](architecture/system-architecture.md)** - System design
- **[Deployment Guide](deployment/README.md)** - Production setup

### Support Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and community
- **Developer Slack** - Real-time development support
- **Email Support** - developers@soilwise.com

### Useful Commands Reference

```bash
# Development
npm run dev              # Start all services
npm run build           # Build for production
npm run test            # Run all tests
npm run lint            # Check code quality

# Debugging
npm run logs            # View service logs
npm run validate-env    # Check environment setup
npm run health-check    # Test all service health

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed with sample data
npm run db:reset        # Reset database

# Docker
npm run docker:dev      # Start with Docker
npm run docker:logs     # View container logs
npm run docker:down     # Stop all containers

# Deployment
npm run deploy:cloud    # Deploy to cloud
npm run deploy:edge     # Deploy to Raspberry Pi
```

---

*This guide is a living document. Please contribute improvements and keep it updated as the platform evolves.*
