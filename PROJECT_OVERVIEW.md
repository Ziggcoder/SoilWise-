# SoilWise Platform - Project Overview

## 📋 Table of Contents
1. [Project Summary](#project-summary)
2. [System Architecture](#system-architecture)
3. [Technical Stack](#technical-stack)
4. [Service Breakdown](#service-breakdown)
5. [Development Status](#development-status)
6. [File Structure](#file-structure)
7. [Key Features](#key-features)
8. [Getting Started](#getting-started)
9. [Documentation Index](#documentation-index)
10. [Support](#support)

## 🌾 Project Summary

SoilWise is a comprehensive **agriculture SaaS platform** that combines:
- **IoT sensor monitoring** for real-time crop conditions
- **AI-powered crop advisory** with local LLM inference
- **Voice-enabled assistance** for hands-free operation
- **Offline-first PWA** for rural connectivity
- **Edge computing** on Raspberry Pi for local processing

### 🎯 Target Users
- **Small to medium farmers** seeking smart agriculture solutions
- **Agricultural consultants** providing advisory services
- **Research institutions** studying crop optimization
- **IoT developers** building agriculture solutions

### 💰 Business Model
- **Hardware + SaaS** subscription model
- **Tiered pricing** based on sensor count and features
- **Professional services** for installation and support
- **Data analytics** premium features

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloud Services                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web Dashboard │  │   API Gateway   │  │   Data Lake     │ │
│  │   (React SPA)   │  │   (Node.js)     │  │   (PostgreSQL)  │ │
│  │   Port: 3005    │  │   Port: 8081    │  │   Port: 5432    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTP/MQTT/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                    Edge Computing Hub                          │
│                   (Raspberry Pi 4B+)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PWA Server    │  │   AI Engine     │  │   Voice Agent   │ │
│  │   (Node.js)     │  │   (Ollama)      │  │   (Whisper)     │ │
│  │   Port: 5179    │  │   Port: 8082    │  │   Port: 8083    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Local DB      │  │   Vector DB     │  │   Edge Hub      │ │
│  │   (SQLite)      │  │   (ChromaDB)    │  │   (Node.js)     │ │
│  │   File Based    │  │   Port: 8000    │  │   Port: 3002    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │ Serial/I2C/SPI
          ┌─────────────────────┴─────────────────────┐
          │                                           │
    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  Soil   │  │  Temp/  │  │   pH    │  │ Camera  │
    │ Sensor  │  │ Humid   │  │ Sensor  │  │ Module  │
    └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

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

## 📊 Development Status

### ✅ Completed Features
- [x] Monorepo structure with Turbo
- [x] All service stubs and basic functionality
- [x] Docker development environment
- [x] TypeScript configuration
- [x] Basic React interfaces
- [x] API server with health checks
- [x] MQTT integration (development)
- [x] Local SQLite database
- [x] Voice assistant framework
- [x] AI services integration
- [x] Edge hub basic functionality
- [x] PWA configuration
- [x] Development scripts (Windows/Linux)

### 🔄 In Progress
- [ ] Complete sensor data flow
- [ ] AI model integration
- [ ] Voice model implementation
- [ ] Hardware sensor drivers
- [ ] Production deployment configs
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security implementation

### 📋 Planned Features
- [ ] User authentication system
- [ ] Mobile app optimization
- [ ] Advanced analytics dashboard
- [ ] Cloud synchronization
- [ ] Hardware installation guides
- [ ] Commercial deployment
- [ ] Multi-language support
- [ ] Advanced AI features

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

## 🛠️ Getting Started

### Quick Start (5 minutes)
```bash
# 1. Clone the repository
git clone <repository-url>
cd soilwise

# 2. Install dependencies
npm install

# 3. Start development servers
npm run dev
```

### Access Points
- **Web Dashboard**: http://localhost:3005
- **PWA Farmer App**: http://localhost:5179
- **API Server**: http://localhost:8081
- **Edge Hub**: http://localhost:3002

### Development Scripts
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
```

### Docker Development
```bash
# Start with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Documentation Index

### 📖 User Documentation
- **[README.md](README.md)** - Project overview and quick start
- **[QUICKSTART.md](QUICKSTART.md)** - Detailed setup instructions
- **[API Documentation](docs/api/README.md)** - Complete API reference

### 🔧 Developer Documentation
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Comprehensive development guide
- **[Architecture Guide](docs/architecture/system-architecture.md)** - System architecture
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

### 🚀 Deployment Documentation
- **[Deployment Guide](docs/deployment/README.md)** - Production deployment
- **[Troubleshooting Guide](docs/troubleshooting/README.md)** - Common issues and solutions

### 🏗️ Technical Documentation
- **Service Architecture** - Individual service documentation
- **Database Schema** - Data model documentation
- **Hardware Integration** - IoT sensor setup guides

## 🆘 Support

### 📞 Getting Help
- **Documentation**: Start with the relevant guide above
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Email**: contact@soilwise.com

### 🐛 Reporting Issues
1. Check existing issues first
2. Use the issue templates
3. Provide detailed information
4. Include logs and screenshots

### 💡 Feature Requests
1. Check if already requested
2. Use the feature request template
3. Explain the use case
4. Consider implementation complexity

### 🤝 Contributing
1. Read the Contributing Guide
2. Fork the repository
3. Create a feature branch
4. Submit a pull request

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
- **Q1 2024**: MVP with basic functionality
- **Q2 2024**: AI integration and voice assistant
- **Q3 2024**: Commercial deployment and scaling
- **Q4 2024**: Advanced features and optimization

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

*Last updated: January 2024*
