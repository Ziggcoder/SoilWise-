# 🚀 SoilWise OneDoc
Get the SoilWise agriculture platform running in minutes!
## ⚡ Prerequisites
- **Node.js** 18.0.0 or higher 
- **npm** 8.0.0 or higher
- **Git**

## 🔧 Quick Setup
### Option 1: Manual Setup
1. **Clone and install:**
```bash
git clone <repository-url>
cd soilwise
npm install
```
2. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your configuration (optional for development)
# Database
DB_PATH=./data/soilwise.db
# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
# AI Services
AI_SERVICE_URL=http://localhost:8082
OLLAMA_API_URL=http://localhost:11434
# Voice Assistant
WHISPER_MODEL_PATH=./models/whisper
COQUI_MODEL_PATH=./models/coqui
# Cloud Services
CLOUD_SYNC_ENDPOINT=https://api.soilwise.com
CLOUD_API_KEY=your_api_key
```
3. **Start development servers:**
```bash
npm run dev
```

### Option 2: Automated Setup (Windows)
#### Using Batch Script
```cmd
dev.bat
```
#### Using PowerShell
```powershell
.\dev.ps1
```
###### ###### ###### ###### ###### ###### ###### ###### ###### ######
## 📱 Service Status
After running `npm run dev`, you should see:
###### ###### ###### ###### ###### ###### ###### ###### ###### ######
## 📁 File Structure

```
soilwise/
├── 📁 apps/                          # Main applications
│   ├── 📁 web-dashboard/            # React dashboard
│   │   ├── 📁 src/                  # Source code
│   │   ├── 📄 package.json          # Dependencies
│   │   ├── 📄 vite.config.ts        # Vite configuration
│   │   └── 📄 tailwind.config.js    # Tailwind CSS config
│   ├── 📁 pwa-farmer/               # PWA application
│   │   ├── 📁 src/                  # Source code
│   │   ├── 📁 public/               # Static assets
│   │   ├── 📄 package.json          # Dependencies
│   │   └── 📄 vite.config.ts        # Vite configuration
│   ├── 📁 api-server/               # Node.js API server
│   │   ├── 📁 src/                  # Source code
│   │   │   ├── 📄 server.ts         # Main server file
│   │   │   ├── 📁 routes/           # API routes
│   │   │   ├── 📁 services/         # Business logic
│   │   │   ├── 📁 middleware/       # Express middleware
│   │   │   └── 📁 utils/            # Utility functions
│   │   ├── 📄 package.json          # Dependencies
│   │   └── 📄 tsconfig.json         # TypeScript config
│   └── 📁 edge-hub/                 # Edge computing hub
│       ├── 📁 src/                  # Source code
│       │   ├── 📄 server.ts         # Main server file
│       │   ├── 📁 services/         # Edge services
│       │   ├── 📁 database/         # Local database
│       │   └── 📁 utils/            # Utility functions
│       ├── 📄 package.json          # Dependencies
│       └── 📄 tsconfig.json         # TypeScript config
├── 📁 packages/                     # Shared packages
│   ├── 📁 ai-services/              # AI/ML services
│   │   ├── 📁 src/                  # Source code
│   │   │   ├── 📄 index.ts          # Main entry point
│   │   │   ├── 📁 advisory/         # Advisory engine
│   │   │   └── 📁 utils/            # Utility functions
│   │   ├── 📄 package.json          # Dependencies
│   │   ├── 📄 requirements.txt      # Python dependencies
│   │   └── 📄 tsconfig.json         # TypeScript config
│   └── 📁 voice-assistant/          # Voice processing
│       ├── 📁 src/                  # Source code
│       │   ├── 📄 index.ts          # Main entry point
│       │   ├── 📁 stt/              # Speech-to-text
│       │   ├── 📁 tts/              # Text-to-speech
│       │   ├── 📁 nlp/              # Natural language processing
│       │   └── 📁 audio/            # Audio processing
│       ├── 📄 package.json          # Dependencies
│       ├── 📄 requirements.txt      # Python dependencies
│       └── 📄 tsconfig.json         # TypeScript config
├── 📁 docs/                         # Documentation
│   ├── 📁 architecture/             # System architecture
│   ├── 📁 api/                      # API documentation
│   ├── 📁 deployment/               # Deployment guides
│   ├── 📁 troubleshooting/          # Troubleshooting
│   └── 📄 DEVELOPER_GUIDE.md        # Developer guide
├── 📁 scripts/                      # Build and deployment scripts
├── 📁 docker/                       # Docker configurations
├── 📄 package.json                  # Root package.json
├── 📄 turbo.json                    # Turbo configuration
├── 📄 docker-compose.yml            # Docker Compose
├── 📄 docker-compose.pi.yml         # Raspberry Pi Compose
├── 📄 .env.example                  # Environment variables template
├── 📄 .env.pi                       # Raspberry Pi environment
├── 📄 README.md                     # Main README
├── 📄 QUICKSTART.md                 # Quick start guide
├── 📄 CONTRIBUTING.md               # Contributing guide
├── 📄 dev.bat                       # Windows development script
└── 📄 dev.ps1                       # PowerShell development script
```
## 🌐 Access Your Services on following URLs
Once running, access the platform at:
| Service           | URL                   | Description                |
|-------------------|-----------------------|----------------------------|
| **Web Dashboard** | http://localhost:3005 | Main dashboard interface   |
| **PWA Farmer App**| http://localhost:5179 | Mobile-first farmer app    |
| **API Server**    | http://localhost:8081 | REST API endpoints         |
| **Edge Hub**      | http://localhost:3002 | Edge computing interface   |

### Port Configuration
Default ports (configurable via environment variables):
- Web Dashboard: 3005
- PWA Farmer App: 5179
- API Server: 8081
- Edge Hub: 3002
- AI Services: 8082
- Voice Assistant: 8083

✅ **Working Services:**
- Web Dashboard - React app with real-time charts
- PWA Farmer App - Offline-first mobile interface  
- API Server - RESTful API with WebSocket support
- AI Services - Machine learning advisory engine
- Voice Assistant - Speech recognition and synthesis

⚠️ **Expected Warnings:**
- MQTT connection errors (normal without MQTT broker)
- ChromaDB warnings (normal without vector database)
- Voice model loading warnings (normal without AI models)


## 🔍 Verify Installation
### Check Service Health
```bash
curl http://localhost:8081/api/v1/health # API Server health check
curl http://localhost:3002/health # Edge Hub health check  
```

### View Logs
```bash
npm run dev # View all service logs
cd apps/api-server && npm run dev # View specific service logs
```

## 🛠️ Development Commands
| Command         | Description            |
|-----------------|------------------------|
| `npm run dev`   | Start all services     |
| `npm run build` | Build all applications |
| `npm run test`  | Run all tests          |
| `npm run lint`  | Lint all packages      |
| `npm run clean` | Clean build artifacts  |

### Individual Service Commands
| Command             | Description            |
|---------------------|------------------------|
|npm run dev:api      | # API server only      |
|npm run dev:dashboard| # Web dashboard only   |
|npm run dev:pwa      | # PWA farmer app only  |
|npm run dev:edge     | # Edge hub only        |

## 🐳 Docker Alternative
If you prefer Docker:
```bash
# Start all services with Docker
docker-compose up -d
# View logs
docker-compose logs -f
# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database
DB_PATH=./data/soilwise.db

# MQTT (optional for development)
MQTT_BROKER_URL=mqtt://localhost:1883

# AI Services
AI_SERVICE_URL=http://localhost:8082
OLLAMA_API_URL=http://localhost:11434

# Voice Assistant
WHISPER_MODEL_PATH=./models/whisper
COQUI_MODEL_PATH=./models/coqui
```


## 🎯 Next Steps

1. **Explore the Web Dashboard** - http://localhost:3005
   - View sensor data and charts
   - Manage farms and alerts
   - Configure system settings

2. **Test the PWA** - http://localhost:5179
   - Install as mobile app
   - Test offline functionality
   - Capture field data

3. **Try the API** - http://localhost:8081/api/v1/health
   - Explore REST endpoints
   - Test WebSocket connections
   - Review API documentation

4. **Configure Hardware** (Optional)
   - Connect IoT sensors
   - Setup MQTT broker
   - Configure LoRaWAN gateway

###### ###### ###### ###### ###### ###### ###### ###### ###### ######
###### 🆘 Troubleshooting ###### ###### ###### ###### ###### ######
###### ###### ###### ###### ###### ###### ###### ###### ###### ######
### Common Issues
#### Port Already in Use
```bash
lsof -i :8081 # Kill process on port
kill -9 <PID>
```
#### Node.js Version Issues
```bash
node --version
nvm use 18
```

#### Permission Errors (Linux/Mac)
```bash
sudo chown -R $USER ~/.npm # Fix npm permissions
```

#### Database Issues
```bash
rm -f data/soilwise.db # Reset database
npm run db:migrate
```

### Getting Help
- **Documentation**: [docs/](docs/)
- **Issues**: Create a GitHub issue
- **Developer Guide**: [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
## 📚 Additional Resources
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Detailed development instructions
- **[Architecture Overview](docs/architecture/system-architecture.md)** - System design
- **[API Documentation](docs/api/README.md)** - API reference
- **[Deployment Guide](docs/deployment/README.md)** - Production deployment

---

🎉 **Congratulations!** You now have SoilWise running locally. Start building the future of smart agriculture!


###### ###### ###### ###### ###### ###### ###### ###### ###### ######
## Individual Services
If you want to run services individually:
```cmd
# API Server
cd apps\api-server
npm install
npm run dev

# Web Dashboard
cd apps\web-dashboard
npm install
npm run dev

# PWA Farmer App
cd apps\pwa-farmer
npm install
npm run dev

# Edge Hub
cd apps\edge-hub
npm install
npm run dev
```
## Docker Setup (Optional)
```cmd
docker-compose up -d
```
###### ###### ###### ###### ###### ###### ###### ###### ###### ######
## Troubleshooting
### Turbo not found
If you get "turbo not found" error:
- Use `npm run dev` instead of `turbo run dev`
- Or install turbo globally: `npm install -g turbo`
### Port conflicts
If ports are in use, modify the ports in:
- `apps/*/package.json` scripts
- `docker-compose.yml`
### Dependencies issues
```cmd
# Clean install
npm run clean
npm install
npm run install:all
```
###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######
###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ###### ######

# Chapter 1 
## 🔧 Technology Stack
### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **PWA** - Offline-first mobile app
- **Vite** - Fast build tool
### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **MQTT** - IoT messaging
- **SQLite** - Local database
### AI/ML
- **Ollama** - Local LLM inference
- **Whisper** - Speech recognition
- **Coqui TTS** - Text-to-speech
- **LangChain** - AI agent framework
- **ChromaDB** - Vector database
### IoT & Hardware
- **Raspberry Pi 4B+** - Edge computing
- **LoRaWAN** - Long-range communication
- **MQTT** - Device messaging
- **Docker** - Containerization

## 💻 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **PWA** capabilities for offline use
- **Chart.js** for data visualization

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Socket.io** for real-time communication
- **MQTT** for IoT device communication
- **SQLite** for local data storage

### AI/ML
- **Ollama** for local LLM inference
- **Whisper** for speech recognition
- **Coqui TTS** for text-to-speech
- **LangChain** for AI agent orchestration
- **ChromaDB** for vector storage

### DevOps
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Turbo** for monorepo management
- **GitHub Actions** for CI/CD

### Hardware
- **Raspberry Pi 4B+** for edge computing
- **IoT sensors** for environmental monitoring
- **LoRaWAN** for long-range communication
- **MQTT** for device messaging

## 🔧 Service Breakdown

### 1. Web Dashboard (`apps/web-dashboard`)
**Purpose**: Cloud-based management interface
**Technology**: React + TypeScript + Vite
**Port**: 3005
**Features**:
- Real-time sensor data visualization
- Farm management interface
- Alert and notification system
- Historical data analysis
- Multi-farm dashboard

### 2. PWA Farmer App (`apps/pwa-farmer`)
**Purpose**: Mobile-first offline application
**Technology**: React PWA + Service Workers
**Port**: 5179
**Features**:
- Offline-first architecture
- Field data collection
- Photo and note capture
- Local SQLite synchronization
- Push notifications

### 3. API Server (`apps/api-server`)
**Purpose**: Central API and communication hub
**Technology**: Node.js + Express + Socket.io
**Port**: 8081
**Features**:
- RESTful API endpoints
- WebSocket real-time communication
- MQTT broker integration
- Authentication and authorization
- Data validation and processing

### 4. Edge Hub (`apps/edge-hub`)
**Purpose**: Raspberry Pi edge computing node
**Technology**: Node.js + SQLite + Hardware interfaces
**Port**: 3002
**Features**:
- Local sensor data processing
- Offline operation capability
- MQTT client for cloud sync
- Hardware abstraction layer
- Local storage and caching

### 5. AI Services (`packages/ai-services`)
**Purpose**: AI-powered crop advisory engine
**Technology**: LangChain + ChromaDB + Ollama
**Port**: 8082
**Features**:
- Crop recommendation engine
- Predictive analytics
- Disease detection
- Yield optimization
- Knowledge base integration

### 6. Voice Assistant (`packages/voice-assistant`)
**Purpose**: Voice-enabled interaction
**Technology**: Whisper + Coqui TTS + Node.js
**Port**: 8083
**Features**:
- Speech recognition (Whisper)
- Text-to-speech (Coqui TTS)
- Natural language processing
- Voice command handling
- Offline speech processing

## 🎯 Core Features
### 1. 📊 IoT Sensor Dashboard
- **Real-time monitoring** of soil conditions
- **Historical data** visualization and analytics
- **Alert system** for critical conditions
- **Multi-farm management** capabilities
### 2. 📱 Offline-First PWA
- **Works without internet** connectivity
- **Local SQLite database** synchronization
- **Field data collection** and management
- **Photo and note** capturing
### 3. 🎙️ Voice-Enabled Assistant
- **Voice queries** in local languages
- **Spoken recommendations** and alerts
- **Hands-free operation** for field work
- **Offline speech processing**
### 4. 🤖 AI Advisory Engine
- **Crop recommendations** based on soil conditions
- **Weather-based irrigation** scheduling
- **Disease and pest identification**
- **Yield optimization** suggestions

## 🚀 Key Features

### 1. Real-time IoT Monitoring
- **Sensor Data Collection**: Soil moisture, temperature, pH, humidity
- **Real-time Visualization**: Live charts and graphs
- **Alert System**: Automatic notifications for critical conditions
- **Historical Analysis**: Trend analysis and data export

### 2. AI-Powered Advisory
- **Crop Recommendations**: Based on soil conditions and weather
- **Disease Detection**: Early warning system
- **Yield Optimization**: Data-driven farming suggestions
- **Local LLM**: Offline AI processing on Raspberry Pi

### 3. Voice Assistant
- **Speech Recognition**: Whisper-based offline STT
- **Text-to-Speech**: Coqui TTS for natural responses
- **Voice Commands**: Hands-free operation
- **Multi-language Support**: Planned for local languages

### 4. Offline-First Architecture
- **PWA Technology**: Works without internet
- **Local Storage**: SQLite for edge computing
- **Sync Capability**: Cloud synchronization when online
- **Resilient Design**: Operates in poor connectivity areas

### 5. Edge Computing
- **Raspberry Pi Deployment**: Local processing power
- **Hardware Integration**: Direct sensor connectivity
- **Local AI Inference**: No cloud dependency
- **Energy Efficient**: Optimized for battery/solar power

# Chapter 2
## Service Dependencies
### Required Services
1. **PostgreSQL** - Primary database
   - Port: 5432
   - Database: `soilwise`
2. **Redis** - Caching and session storage
   - Port: 6379
3. **MQTT Broker** - IoT communication
   - Port: 1883 (MQTT)
   - Port: 9001 (WebSocket)
### Optional Services
1. **Ollama** - Local LLM inference
   - Port: 11434
2. **ChromaDB** - Vector database
   - Port: 8000
## Validation
Run the environment validation script to check your configuration:
```bash
node validate-env.js
```
This will verify that:
- All required variables are set
- No placeholder values remain
- Service endpoints are accessible
## Troubleshooting
### Common Issues
1. **MQTT Connection Failed**
   - Verify `MQTT_BROKER_URL` is correct
   - Check broker is running on specified port
   - Validate credentials
2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` format
   - Validate database exists
3. **Frontend Can't Connect to API**
   - Verify `VITE_API_URL` matches API server
   - Check CORS configuration
   - Ensure API server is running
### Environment File Locations
- Main: `.env` (root directory)
- Web Dashboard: `apps/web-dashboard/.env.local`
- Edge Hub: Uses main `.env`
- Docker: Environment variables in `docker-compose.yml`

#### Chpater 4 
## 📊 Project Statistics
### 📈 Current Metrics
- **Services**: 6 main services
- **Languages**: TypeScript, JavaScript, Python
- **Frameworks**: React, Node.js, Express
- **Databases**: SQLite, PostgreSQL, ChromaDB
- **Deployment**: Docker, Kubernetes, Raspberry Pi

### 🎯 Project Goals
- **Offline Operation**: 95% functionality without internet
- **Response Time**: <100ms API responses
- **Scalability**: Support 1000+ sensors per edge hub
- **Reliability**: 99.9% uptime for critical services
- **Battery Life**: 6+ months for solar-powered sensors

### 📅 Roadmap
- **Q1 2025**: MVP with basic functionality
- **Q2 2025**: AI integration and voice assistant
- **Q3 2025**: Commercial deployment and scaling
- **Q4 2025**: Advanced features and optimization

## 🏆 Achievements
### ✅ Technical Milestones
- [x] Monorepo architecture established
- [x] All services running in development
- [x] Docker development environment
- [x] Basic AI integration
- [x] Voice assistant framework
- [x] Offline PWA functionality
### 🎖️ Recognition
- Open source agriculture project
- Sustainable farming technology
- Rural connectivity solution
- Edge computing innovation
---
**SoilWise** - Empowering agriculture with smart technology 🌱
*Last updated: January 2025*

#### Chapter 5 
## ✅ **MISSION ACCOMPLISHED**
The complete SoilWise platform has been successfully analyzed, implemented, and wired up with **end-to-end connectivity** from edge devices to cloud dashboard. The system is now **fully operational** with realistic data flows and comprehensive architecture.
---
## 🏗️ **System Architecture Overview**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           🌱 SoilWise IoT Platform                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ Edge Hub    │◄──►│ API Server  │◄──►│ Dashboard   │◄──►│ PWA Farmer  │   │
│  │ (Pi/Local)  │    │ (Cloud)     │    │ (Web SPA)   │    │ (Mobile)    │   │
│  ├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤   │
│  │• SQLite DB  │    │• PostgreSQL │    │• React+Vite │    │• React PWA  │   │
│  │• Data Sim   │    │• Redis Cache│    │• Socket.io  │    │• IndexedDB  │   │
│  │• MQTT Broker│    │• REST API   │    │• Real-time  │    │• Offline    │   │
│  │• WebSocket  │    │• WebSocket  │    │• Monitoring │    │• MQTT Sync  │   │
│  │• IoT Bridge │    │• Auth/Users │    │• Analytics  │    │• Service SW │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                          📊 Real-Time Data Flow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Sensor Data → Edge Hub → WebSocket → Dashboard (Live Updates)              │
│                    ↓                                                        │
│               MQTT Publish → PWA (Background Sync)                          │
│                    ↓                                                        │
│               REST API → Cloud Storage → Analytics                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Key Components Implemented**

### **Edge Hub (Raspberry Pi Gateway)**
- ✅ **Complete Server Architecture** (`src/server.ts`)
- ✅ **SQLite Database Layer** with full CRUD operations
- ✅ **Real-time Data Simulator** (4 devices, 3 farms, realistic patterns)
- ✅ **MQTT Service** for IoT device communication
- ✅ **WebSocket Server** for real-time dashboard updates
- ✅ **Bridge Services** (PWA sync, Dashboard, Cloud)
- ✅ **System Monitor** with health checks and metrics
- ✅ **Camera Service** for image capture and analysis
- ✅ **Configuration Management** (Database, MQTT, AI, Camera)

### **API Server (Cloud Backend)**
- ✅ **Express.js REST API** with comprehensive endpoints
- ✅ **PostgreSQL Integration** for persistent cloud storage
- ✅ **Redis Caching** for performance optimization
- ✅ **Authentication & Authorization** (JWT-based)
- ✅ **Real-time Socket.io** for live updates
- ✅ **Farm & Sensor Management** APIs
- ✅ **Alert System** with notification support

### **Web Dashboard (Real-time SPA)**
- ✅ **React + Vite** modern frontend architecture
- ✅ **Real-time Charts** and sensor visualization
- ✅ **Socket.io Client** for live data streaming
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **Farm Management** interface
- ✅ **Alert Dashboard** with real-time notifications

### **PWA Farmer App (Offline-First Mobile)**
- ✅ **Progressive Web App** architecture
- ✅ **Service Worker** for offline capability
- ✅ **IndexedDB** for local data storage
- ✅ **MQTT Client** for background synchronization
- ✅ **Mobile-optimized** farmer interface
- ✅ **Offline-first** data management

---

## 📡 **Communication Protocols & Data Flow**

### **Real-time Communication**
```
Edge Hub ──WebSocket──► Dashboard (Live sensor updates)
         ──MQTT──► PWA (Background sync)
         ──REST API──► Cloud Storage
```

### **Data Synchronization**
```
IoT Sensors → Edge Hub → Local SQLite → Real-time Broadcasting
                      → Cloud API → PostgreSQL → Dashboard
                      → MQTT → PWA → IndexedDB → Offline Access
```

### **Offline Capability**
```
PWA ←─MQTT─► Edge Hub (When Online)
    ←─IndexedDB─► Local Storage (When Offline)
    ←─Background Sync─► Cloud (When Online Returns)
```

---

## 🚀 **Development Environment Ready**

### **Docker Orchestration**
- ✅ **Development Stack** (`docker-compose.dev.yml`)
  - PostgreSQL database with sample data
  - Redis caching layer
  - MQTT broker (Mosquitto) with WebSocket support
  - MinIO object storage
  - Prometheus + Grafana monitoring
  - All application services with hot reload

### **Quick Start Commands**
## 📊 **Data Simulation & Testing**

### **Realistic IoT Data Generator**
The system includes a comprehensive **Data Simulator** (`src/services/dataSimulator.ts`) that generates:

- **4 IoT Devices** across 3 different farms
- **Sensor Types**: Soil moisture, temperature, pH, nutrients
- **Realistic Patterns**: Seasonal variations, daily cycles, weather effects
- **Smart Alerts**: Automatic threshold-based notifications
- **Geographic Distribution**: Different farm locations and conditions

### **Sample Data Flow**
```json
{
  "deviceId": "SOIL_001",
  "farmId": "1", 
  "sensorType": "soil_moisture",
  "value": 65.4,
  "unit": "%",
  "timestamp": "2025-07-12T10:30:00Z",
  "location": { "lat": 40.7128, "lng": -74.0060 },
  "quality": "good"
}
```

---

## 🔒 **Security & Production Ready**

### **Authentication & Authorization**
- ✅ JWT-based authentication
- ✅ Role-based access control (admin, farmer)
- ✅ Secure API endpoints
- ✅ CORS configuration

### **Security Features**
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization
- ✅ Environment-based configuration
- ✅ Database connection pooling
- ✅ Error handling and logging

### **Production Deployment**
- ✅ Docker containers for all services
- ✅ Kubernetes manifests for cloud deployment
- ✅ Environment configuration management
- ✅ Health checks and monitoring
- ✅ Graceful shutdown handling

---

## 📈 **Monitoring & Observability**

### **System Health Monitoring**
- ✅ **Prometheus** metrics collection
- ✅ **Grafana** dashboards for visualization
- ✅ **Health check endpoints** for all services
- ✅ **System resource monitoring** (CPU, memory, disk)
- ✅ **Application metrics** (sensor data, alerts, API calls)

### **Logging & Debugging**
- ✅ **Winston** structured logging
- ✅ **Log aggregation** across all services
- ✅ **Error tracking** and alerting
- ✅ **Performance monitoring**

---

## 🧪 **Testing & Quality Assurance**

### **Integration Testing**
- ✅ **End-to-end test suite** (`scripts/test-integration.js`)
- ✅ **Health endpoint verification**
- ✅ **WebSocket connection testing**  
- ✅ **MQTT communication validation**
- ✅ **API endpoint testing**
- ✅ **Data flow verification**

### **System Testing**
- ✅ **Service connectivity checks**
- ✅ **Database integration testing**
- ✅ **Real-time communication validation**
- ✅ **Offline/online sync testing**

---

## 🎯 **Mission Results Summary**

| Component | Status | Features |
|-----------|--------|----------|
| **Edge Hub Analysis** | ✅ Complete | Deep architectural analysis, missing component identification |
| **Missing Modules** | ✅ Implemented | Camera service, bridges, system monitor, data simulator |
| **Integration Logic** | ✅ Complete | End-to-end connectivity between all systems |
| **Data Flow Wiring** | ✅ Operational | Real-time WebSocket, MQTT sync, REST API integration |
| **Simulation & Testing** | ✅ Active | Realistic IoT data generation with 4 devices |
| **Local Development** | ✅ Ready | Complete Docker environment with monitoring |
| **Production Deployment** | ✅ Configured | Docker + Kubernetes manifests |

---

## 🌟 **Ready for Development & Production**

The **SoilWise IoT platform** is now:

- 🔗 **Fully Connected**: End-to-end data flow from sensors to dashboard
- 📊 **Real-time Capable**: Live sensor monitoring and alerts
- 📱 **Mobile-ready**: Offline-first PWA for farmers  
- 🔄 **Sync-enabled**: Automatic cloud synchronization
- 🐳 **Docker-ready**: Complete containerized development environment
- ☸️ **Cloud-ready**: Kubernetes deployment configuration
- 📈 **Observable**: Comprehensive monitoring and logging
- 🧪 **Tested**: Integration test suite validates all connections

### **Next Steps for Developers:**

1. **Run the system**: `npm run start:dev:win`
2. **Access dashboard**: http://localhost:5173
3. **View real-time data**: Simulated sensor feeds
4. **Test PWA**: Mobile farmer interface
5. **Monitor system**: Grafana dashboards
6. **Connect real sensors**: Replace simulator with actual IoT devices

---

## 🎉 **Project Status: COMPLETE & OPERATIONAL**

**The SoilWise platform has been successfully wired up end-to-end and is ready for agricultural IoT development and deployment!** 🌱

All requirements have been fulfilled:
- ✅ Edge-hub comprehensive analysis
- ✅ Missing component identification and implementation  
- ✅ Complete system integration
- ✅ End-to-end connectivity validation
- ✅ Realistic data simulation
- ✅ Local development environment
- ✅ Production deployment readiness

The system is now **production-ready** and can be used as a foundation for real agricultural IoT deployments.


# SoilWise System Integration Architecture

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CLOUD INFRASTRUCTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   API Server    │────│   Database      │────│  AI Services    │             │
│  │  (Node.js)      │    │ (PostgreSQL)    │    │ (Ollama/GPU)    │             │
│  │ Port: 8080      │    │ Port: 5432      │    │ Port: 11434     │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│           │                       │                       │                     │
│           │              ┌─────────────────┐               │                     │
│           │              │  File Storage   │               │                     │
│           │              │    (S3/Minio)   │               │                     │
│           │              │  Port: 9000     │               │                     │
│           │              └─────────────────┘               │                     │
└───────────┼─────────────────────────────────────────────────┼─────────────────────┘
            │                                                 │
            │ HTTPS/REST API                                  │ HTTP/gRPC
            │ WebSocket (Real-time)                           │
            │                                                 │
┌───────────▼─────────────────────────────────────────────────▼─────────────────────┐
│                              EDGE INFRASTRUCTURE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        Edge Hub (Raspberry Pi)                             │ │
│  │                              Port: 3000                                    │ │
│  ├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤ │
│  │  Sensor Manager │   MQTT Broker   │  Camera Service │   Voice Assistant   │ │
│  │                 │   Port: 1883    │                 │                     │ │
│  ├─────────────────┼─────────────────┼─────────────────┼─────────────────────┤ │
│  │  PWA Sync       │ Dashboard Bridge│  Cloud Bridge   │  System Monitor     │ │
│  │  Bridge         │                 │                 │                     │ │
│  ├─────────────────┴─────────────────┴─────────────────┴─────────────────────┤ │
│  │                        Local Database (SQLite)                            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│           │                       │                       │                     │
│           │ MQTT                  │ WebSocket             │ HTTPS              │
│           │                       │                       │                     │
└───────────┼───────────────────────┼───────────────────────┼─────────────────────┘
            │                       │                       │
            │                       │                       │
┌───────────▼─────────────┐ ┌───────▼─────────────┐ ┌───────▼─────────────┐
│      IoT Devices        │ │   Web Dashboard     │ │    Farmer PWA       │
├─────────────────────────┤ ├─────────────────────┤ ├─────────────────────┤
│ • Soil Sensors          │ │ • React SPA         │ │ • React PWA         │
│ • Weather Stations      │ │ • Real-time Charts  │ │ • Offline-first     │
│ • Cameras               │ │ • Alert Management  │ │ • Mobile optimized  │
│ • LoRaWAN Gateways     │ │ • System Control    │ │ • Field operations  │
│ • Irrigation Systems   │ │ • Port: 5173        │ │ • Port: 3001        │
└─────────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

## 🔄 **DEPLOYMENT ARCHITECTURE**

### **CLOUD TIER** (AWS/Azure/GCP)
```
Production Environment:
├── API Server (Node.js)
│   ├── Load Balancer (ALB/nginx)
│   ├── Auto Scaling Group (2-10 instances)
│   ├── Container: Docker on ECS/EKS
│   └── Health Checks: /health endpoint
├── Database Cluster
│   ├── Primary: PostgreSQL (RDS/managed)
│   ├── Read Replicas: 2x instances
│   └── Backup: Automated daily snapshots
├── AI Services
│   ├── GPU Instances: p3.xlarge for Ollama
│   ├── Container: CUDA-enabled Docker
│   └── Model Storage: EFS/persistent volume
└── File Storage
    ├── Object Storage: S3/Azure Blob
    ├── CDN: CloudFront/Azure CDN
    └── Backup: Cross-region replication
```

### **EDGE TIER** (On-Farm Raspberry Pi)
```
Edge Hub (Raspberry Pi 4+):
├── Hardware Requirements
│   ├── CPU: ARM64 Cortex-A72 (4 cores)
│   ├── RAM: 8GB minimum
│   ├── Storage: 64GB+ microSD + USB SSD
│   └── Connectivity: Ethernet + WiFi + 4G/LTE
├── Operating System
│   ├── OS: Raspberry Pi OS Lite 64-bit
│   ├── Runtime: Node.js 18+ LTS
│   └── Database: SQLite 3.40+
├── Services (systemd)
│   ├── soilwise-edge.service (main application)
│   ├── mosquitto.service (MQTT broker)
│   └── node-exporter.service (monitoring)
└── Network Configuration
    ├── Static IP: 192.168.1.100
    ├── Port Forwarding: 3000, 1883
    └── VPN: WireGuard tunnel to cloud
```

### **CLIENT TIER** (Browser/Mobile)
```
Web Dashboard:
├── Hosting: CDN (Vercel/Netlify)
├── Build: Vite production bundle
├── Cache: Service Worker + CDN
└── Access: HTTPS + Auth tokens

Farmer PWA:
├── Hosting: Edge Hub local + CDN fallback
├── Offline: Service Worker + IndexedDB
├── Sync: Background sync when online
└── Install: Add to Home Screen
```

## 📊 **DATA FLOW ARCHITECTURE**

### **1. Device → Edge Hub Flow**
```
Sensor Data Pipeline:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Sensors   │───▶│   LoRaWAN   │───▶│  Edge Hub   │───▶│ Local Store │
│             │    │   Gateway   │    │ (Receiver)  │    │  (SQLite)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                    │                   │                   │
     │ Protocol:          │ Protocol:         │ Protocol:         │ Storage:
     │ • Modbus RTU       │ • LoRaWAN        │ • MQTT Topics     │ • sensor_data
     │ • RS485            │ • 868/915 MHz     │ • JSON payload    │ • alerts
     │ • Analog 4-20mA    │ • Class A/C       │ • QoS 1           │ • device_registry
     │ • I2C/SPI          │                   │                   │
```

### **2. Edge Hub → Cloud Flow**
```
Cloud Sync Pipeline:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Local Store │───▶│ Cloud Bridge│───▶│ API Server  │───▶│   Database  │
│  (SQLite)   │    │  (Batch)    │    │ (REST API)  │    │(PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                    │                   │                   │
     │ Trigger:           │ Protocol:         │ Endpoints:        │ Storage:
     │ • Every 5 min      │ • HTTPS POST      │ • /sync/sensors   │ • sensor_readings
     │ • Data threshold   │ • JWT auth        │ • /sync/alerts    │ • farm_management
     │ • Connection up    │ • Retry logic     │ • /sync/devices   │ • user_accounts
     │ • Manual sync      │ • Batch 100 rec   │                   │
```

### **3. Real-time Dashboard Flow**
```
Live Data Pipeline:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Sensor Data │───▶│Dashboard    │───▶│  WebSocket  │───▶│ React App   │
│  (Real-time)│    │  Bridge     │    │ Connection  │    │ (Charts)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                    │                   │                   │
     │ Update Rate:       │ Protocol:         │ Events:           │ UI Updates:
     │ • 1-5 seconds      │ • Socket.io       │ • sensor_data     │ • Live charts
     │ • On threshold     │ • Room-based      │ • system_alert    │ • Alert popups
     │ • On alert         │ • Authentication  │ • device_status   │ • Status indicators
     │                    │                   │ • camera_update   │
```

### **4. PWA Offline Flow**
```
Mobile Sync Pipeline:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Field Worker │───▶│   PWA App   │───▶│ PWA Bridge  │───▶│ Sync Queue  │
│ (Actions)   │    │(IndexedDB)  │    │    (MQTT)   │    │ (Pending)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                    │                   │                   │
     │ Operations:        │ Storage:          │ Protocol:         │ Sync Strategy:
     │ • Log observations │ • Service Worker  │ • MQTT topics     │ • When online
     │ • Add tasks        │ • Background sync │ • QoS 2 delivery  │ • Conflict resolve
     │ • Take photos      │ • Offline queue   │ • JSON payload    │ • Last-write-wins
     │ • Record notes     │                   │                   │
```

## 🔗 **COMMUNICATION STRATEGIES**

### **1. MQTT Communication (Edge ↔ Devices)**
```typescript
// Topic Structure
const topics = {
  // Device → Edge Hub
  sensorData: 'sensors/{farm_id}/{device_id}/data',
  deviceStatus: 'devices/{farm_id}/{device_id}/status',
  alerts: 'sensors/{farm_id}/{device_id}/alert',
  
  // Edge Hub → Devices
  commands: 'commands/{farm_id}/{device_id}/control',
  config: 'config/{farm_id}/{device_id}/update',
  
  // PWA ↔ Edge Hub
  pwaSync: 'pwa/{user_id}/sync',
  pwaData: 'pwa/{user_id}/data',
  pwaCommands: 'pwa/{user_id}/commands'
}

// Message Format
interface MQTTMessage {
  timestamp: string
  farm_id: string
  device_id: string
  type: 'sensor_data' | 'alert' | 'command' | 'status'
  payload: {
    // Sensor data
    temperature?: number
    humidity?: number
    soil_moisture?: number
    ph_level?: number
    // Device status
    battery_level?: number
    signal_strength?: number
    // Commands
    action?: 'start_irrigation' | 'take_photo' | 'calibrate'
    duration?: number
  }
  metadata?: {
    location: { lat: number, lng: number }
    quality: 'high' | 'medium' | 'low'
    calibrated: boolean
  }
}
```

### **2. WebSocket Communication (Edge ↔ Dashboard)**
```typescript
// WebSocket Events
interface WebSocketEvents {
  // Client → Server
  'subscribe_farm': { farm_id: string }
  'subscribe_sensor': { sensor_id: string }
  'send_command': { device_id: string, command: string }
  'request_history': { sensor_id: string, hours: number }
  
  // Server → Client
  'sensor_data': SensorReading
  'system_alert': SystemAlert
  'device_status': DeviceStatus
  'camera_update': CameraPhoto
  'sync_status': SyncStatus
}

// Authentication Flow
const authFlow = {
  connect: 'Client connects with JWT token',
  validate: 'Server validates token and permissions',
  subscribe: 'Client subscribes to farm/sensor data',
  stream: 'Server streams real-time data',
  disconnect: 'Graceful cleanup of subscriptions'
}
```

### **3. REST API Communication (Edge ↔ Cloud)**
```typescript
// API Endpoints
const apiEndpoints = {
  // Data Sync
  'POST /sync/sensor-data': 'Batch upload sensor readings',
  'POST /sync/alerts': 'Upload critical alerts',
  'POST /sync/devices': 'Sync device registry',
  'GET /sync/configurations': 'Download edge configurations',
  
  // Real-time Commands
  'POST /commands/{device_id}': 'Send remote device command',
  'GET /commands/{device_id}/status': 'Check command status',
  
  // File Upload
  'POST /upload/photos': 'Upload camera images',
  'POST /upload/logs': 'Upload system logs',
  
  // Health & Monitoring
  'GET /health': 'System health check',
  'POST /metrics': 'System metrics upload'
}

// Request/Response Format
interface APISyncRequest {
  source: 'edge-hub'
  timestamp: string
  batch: {
    type: 'sensor_data' | 'alerts' | 'devices'
    data: any[]
    checksum: string
  }
}

interface APISyncResponse {
  success: boolean
  processed: number
  failed: number
  errors?: string[]
  next_sync?: string
}
```

## ⚡ **SYNC STRATEGIES**

### **1. Real-time Sync (Critical Data)**
```typescript
// Immediate sync for critical events
const realTimeSync = {
  triggers: [
    'Critical alerts (pH < 4 or > 9)',
    'System failures',
    'Security breaches',
    'Device malfunctions'
  ],
  method: 'Immediate HTTP POST',
  timeout: '5 seconds',
  retry: '3 attempts with exponential backoff',
  fallback: 'Store locally and mark for urgent sync'
}
```

### **2. Batch Sync (Regular Data)**
```typescript
// Scheduled batch sync for efficiency
const batchSync = {
  schedule: 'Every 5 minutes',
  batchSize: 100,
  compression: 'gzip',
  method: 'HTTP POST with batch payload',
  optimization: {
    'Low connectivity': 'Reduce to every 15 minutes',
    'High data volume': 'Increase batch size to 500',
    'Night hours': 'Reduce to every 30 minutes'
  }
}
```

### **3. Offline Fallback Strategy**
```typescript
// Comprehensive offline handling
const offlineStrategy = {
  detection: {
    method: 'Periodic connectivity check (ping 8.8.8.8)',
    interval: '30 seconds',
    timeout: '5 seconds'
  },
  storage: {
    primary: 'SQLite with WAL mode',
    capacity: '1GB local storage',
    cleanup: 'Remove data older than 30 days'
  },
  sync: {
    onReconnect: 'Upload all pending data',
    prioritization: 'Alerts first, then sensor data',
    conflictResolution: 'Last-write-wins with timestamp comparison'
  },
  userNotification: {
    dashboard: 'Show "Offline Mode" indicator',
    pwa: 'Display sync status in app header',
    api: 'Return cached data with staleness indicator'
  }
}
```

### **4. Progressive Web App Sync**
```typescript
// PWA-specific sync strategy
const pwaSync = {
  online: {
    method: 'Real-time MQTT + background HTTP sync',
    frequency: 'Live updates + 1-minute batch sync',
    conflict: 'Server state takes precedence'
  },
  offline: {
    storage: 'IndexedDB + Service Worker cache',
    capacity: '50MB application data',
    operations: [
      'Log field observations',
      'Add/edit farm tasks',
      'Take and annotate photos',
      'Record voice notes'
    ]
  },
  backgroundSync: {
    trigger: 'When connectivity restored',
    strategy: 'Upload local changes first',
    retry: 'Exponential backoff up to 24 hours',
    notification: 'Show sync progress to user'
  }
}
```

## 🔒 **SECURITY & RELIABILITY**

### **Network Security**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Devices     │───▶│    Edge Hub     │───▶│  Cloud API      │
│   (LoRaWAN)     │    │  (TLS tunnel)   │    │ (HTTPS + JWT)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ Encryption:           │ Security:             │ Authentication:
         │ • AES-128             │ • WireGuard VPN       │ • JWT tokens
         │ • Device keys         │ • Firewall rules      │ • OAuth 2.0
         │ • Message auth        │ • Rate limiting       │ • API keys
```

### **Data Reliability**
```
Fault Tolerance:
├── Edge Hub Redundancy
│   ├── Watchdog timer (auto-restart)
│   ├── Health monitoring (systemd)
│   └── Backup power (UPS)
├── Data Persistence
│   ├── SQLite WAL mode (crash safety)
│   ├── Daily local backups
│   └── Cloud sync verification
└── Network Resilience
    ├── Multiple connectivity options
    ├── Automatic failover
    └── Queue-based retry logic
```

This integration architecture provides a robust, scalable, and fault-tolerant system that can handle real-world agricultural IoT requirements while maintaining excellent user experience across all interfaces.