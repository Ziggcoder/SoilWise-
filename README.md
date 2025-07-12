# SoilWise - Smart Agriculture Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)](https://www.typescriptlang.org/)

## 🌾 Overview

SoilWise is an **offline-first agriculture SaaS platform** that combines IoT sensor monitoring, AI-powered crop advisory, and voice-enabled assistance. Built for rural deployment with Raspberry Pi-based edge computing and local LLM inference.

### � Key Features

- **📊 Real-time IoT Monitoring** - Soil moisture, temperature, pH, nutrients
- **🤖 AI-Powered Advisory** - Crop recommendations, disease detection, yield optimization
- **🎙️ Voice Assistant** - Offline speech recognition and synthesis
- **📱 Offline-First PWA** - Works without internet connectivity
- **🔄 Edge Computing** - Local processing on Raspberry Pi
- **☁️ Cloud Sync** - Hybrid local/cloud data architecture

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloud Services                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Web Dashboard │  │   API Gateway   │  │   Data Lake     │  │
│  │   (React SPA)   │  │   (Node.js)     │  │   (PostgreSQL)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │ MQTT/HTTP
┌─────────────────────────────────────────────────────────────────┐
│                    Edge Computing Hub                           │
│                   (Raspberry Pi 4B+)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   PWA Server    │  │   AI Engine     │  │   Voice Agent   │  │
│  │   (Node.js)     │  │   (Ollama)      │  │   (Whisper)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Local DB      │  │   Vector DB     │  │   MQTT Client   │  │
│  │   (SQLite)      │  │   (ChromaDB)    │  │   (Node.js)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          │                                           │
        ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  Soil   │  │  Temp/  │  │   pH    │  │ Camera  │
        │ Sensor  │  │ Humid   │  │ Sensor  │  │ Module  │
        └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/soilwise.git
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

### 🌐 Access Points

Once running, access the services at:

- **Web Dashboard**: http://localhost:3005
- **PWA Farmer App**: http://localhost:5179
- **API Server**: http://localhost:8081
- **Edge Hub**: http://localhost:3002

### � Quick Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in development mode |
| `npm run build` | Build all applications |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run docker:up` | Start with Docker Compose |
- Voice assistant implementation
## 📁 Project Structure

```
soilwise/
├── apps/                           # Main applications
│   ├── web-dashboard/             # React dashboard (Cloud UI)
│   ├── pwa-farmer/               # Offline-first PWA (Mobile)
│   ├── api-server/               # Node.js API server (Cloud)
│   └── edge-hub/                 # Raspberry Pi edge computing
├── packages/                      # Shared packages
│   ├── ai-services/              # AI/ML services (LangChain, ChromaDB)
│   └── voice-assistant/          # Voice processing (Whisper, Coqui TTS)
├── docs/                         # Documentation
│   ├── architecture/             # System architecture docs
│   ├── deployment/              # Deployment guides
│   └── api/                     # API documentation
├── scripts/                      # Setup and deployment scripts
└── docker/                       # Docker configurations
```

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

## 🚀 Development

### Development Commands

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

# Docker development
npm run docker:up      # Start with Docker Compose
npm run docker:down    # Stop Docker services
```

### Development Workflow

1. **Local Development**: Use `npm run dev` for hot-reload development
2. **Testing**: Run `npm run test` for unit and integration tests
3. **Building**: Use `npm run build` before deployment
4. **Linting**: Run `npm run lint` to check code quality

## � Docker Deployment

### Local Development
```bash
docker-compose up -d
```

### Raspberry Pi Deployment
```bash
docker-compose -f docker-compose.pi.yml up -d
```

## 📚 Documentation

- **[Architecture Guide](docs/architecture/system-architecture.md)** - Detailed system architecture
- **[Deployment Guide](docs/deployment/README.md)** - Deployment instructions
- **[API Documentation](docs/api/README.md)** - API reference
- **[Hardware Setup](docs/hardware/README.md)** - IoT sensor setup
- **[Troubleshooting](docs/troubleshooting/README.md)** - Common issues and solutions

## 🔒 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
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

## 💰 Monetization Strategy

### Hardware + SaaS Model
1. **Hardware Sales**: IoT sensors, gateway devices
2. **SaaS Subscriptions**: 
   - Basic: $29/month (5 sensors)
   - Professional: $99/month (20 sensors)
   - Enterprise: $299/month (unlimited)
3. **Installation & Support**: $500-2000 per farm
4. **Data Analytics**: Premium insights and reports

## 🛠️ Development Roadmap
### Phase 1: Core Infrastructure ✅
- [x] Basic IoT sensor integration
- [x] Web dashboard MVP
- [x] Local database setup
- [x] Development environment
### Phase 2: Offline PWA (In Progress)
- [x] PWA development
- [ ] Offline synchronization
- [ ] Mobile optimization
- [ ] Camera integration
### Phase 3: AI Integration (In Progress)
- [x] Voice assistant implementation
- [x] AI advisory engine
- [ ] LLM integration
- [ ] Advanced analytics
### Phase 4: Production & Deployment
- [ ] Raspberry Pi optimization
- [ ] Field testing
- [ ] Commercial deployment
- [ ] Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/soilwise/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/soilwise/discussions)
- **Email**: support@soilwise.com
