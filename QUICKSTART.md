# 🚀 SoilWise Quick Start Guide

Get the SoilWise agriculture platform running in minutes!

## ⚡ Prerequisites

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 8.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

## 🔧 Quick Setup

### Option 1: Automated Setup (Windows)

#### Using Batch Script
```cmd
dev.bat
```

#### Using PowerShell
```powershell
.\dev.ps1
```

### Option 2: Manual Setup

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
```

3. **Start development servers:**
```bash
npm run dev
```

## 🌐 Access Your Services

Once running, access the platform at:

| Service | URL | Description |
|---------|-----|-------------|
| **Web Dashboard** | http://localhost:3005 | Main dashboard interface |
| **PWA Farmer App** | http://localhost:5179 | Mobile-first farmer app |
| **API Server** | http://localhost:8081 | REST API endpoints |
| **Edge Hub** | http://localhost:3002 | Edge computing interface |

## 📱 Service Status

After running `npm run dev`, you should see:

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
# API Server health check
curl http://localhost:8081/api/v1/health

# Edge Hub health check  
curl http://localhost:3002/health
```

### View Logs
```bash
# View all service logs
npm run dev

# View specific service logs
cd apps/api-server && npm run dev
```

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services |
| `npm run build` | Build all applications |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run clean` | Clean build artifacts |

### Individual Service Commands
```bash
# Start specific services
npm run dev:api          # API server only
npm run dev:dashboard    # Web dashboard only
npm run dev:pwa         # PWA farmer app only
npm run dev:edge        # Edge hub only
```

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

## 📊 Sample Data

The platform includes sample sensor data for testing:

- **Soil Moisture**: 65.5%
- **Temperature**: 24.2°C
- **pH Level**: 6.8
- **Humidity**: 72%

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

### Port Configuration
Default ports (configurable via environment variables):
- Web Dashboard: 3005
- PWA Farmer App: 5179
- API Server: 8081
- Edge Hub: 3002
- AI Services: 8082
- Voice Assistant: 8083

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

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port
lsof -i :8081
kill -9 <PID>
```

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use Node Version Manager
nvm use 18
```

#### Permission Errors (Linux/Mac)
```bash
# Fix npm permissions
sudo chown -R $USER ~/.npm
```

#### Database Issues
```bash
# Reset database
rm -f data/soilwise.db
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

## Need Help?

- Check the full README.md for detailed documentation
- See `docs/` folder for comprehensive guides
- Open an issue on GitHub
