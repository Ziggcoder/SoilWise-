# 🌱 SoilWise - Complete Development Setup

## Quick Start (Docker - Recommended)

### Prerequisites
- Docker Desktop installed and running
- Git
- Node.js 18+ (for local development)

### 1. Start Development Environment

**Windows:**
```bash
npm run start:dev:win
```

**Linux/macOS:**
```bash
npm run start:dev
```

This will automatically:
- ✅ Create necessary directories and configuration
- ✅ Start all services in Docker containers
- ✅ Set up development database with sample data
- ✅ Configure MQTT broker for IoT communication
- ✅ Enable real-time data simulation
- ✅ Start monitoring stack (Prometheus, Grafana)

### 2. Access Applications

Once the startup script completes, access:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Web Dashboard** | http://localhost:5173 | Real-time monitoring & analytics |
| 📱 **PWA Farmer App** | http://localhost:3001 | Mobile-first farmer interface |
| ⚙️ **Edge Hub** | http://localhost:3000 | IoT gateway & local processing |
| 🔌 **API Server** | http://localhost:8080 | Cloud backend services |
| 📊 **Grafana** | http://localhost:3002 | Monitoring dashboards (admin/admin) |
| 📈 **Prometheus** | http://localhost:9091 | Metrics collection |
| 📁 **MinIO** | http://localhost:9000 | File storage (admin/admin) |

### 3. Verify System Health

```bash
npm run test:integration
```

This runs comprehensive tests including:
- ✅ Service connectivity
- ✅ Real-time WebSocket communication
- ✅ MQTT message flow
- ✅ API endpoint availability
- ✅ Data simulation verification

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Edge Hub      │    │   API Server    │    │  Web Dashboard  │
│  (Raspberry Pi) │    │    (Cloud)      │    │     (SPA)       │
│                 │    │                 │    │                 │
│ • SQLite DB     │◄──►│ • PostgreSQL    │◄──►│ • React + Vite  │
│ • Data Sim      │    │ • Redis Cache   │    │ • Real-time UI  │
│ • MQTT Broker   │    │ • REST API      │    │ • Socket.io     │
│ • WebSocket     │    │ • WebSocket     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│  PWA Farmer     │◄─────────────┘
                        │    (Mobile)     │
                        │                 │
                        │ • Offline-First │
                        │ • IndexedDB     │
                        │ • Service Worker│
                        │ • MQTT Sync     │
                        └─────────────────┘
```

## Development Workflows

### Local Development (Hot Reload)

```bash
# Start all services with hot reload
npm run dev:all

# Or start individual services
npm run dev:api      # API Server only
npm run dev:edge     # Edge Hub only
npm run dev:dashboard # Web Dashboard only
npm run dev:pwa      # PWA Farmer only
```

### Docker Development (Full Stack)

```bash
# Start complete environment
npm run docker:dev

# View logs from all services
npm run docker:dev:logs

# Restart specific service
docker-compose -f docker-compose.dev.yml restart edge-hub

# Stop everything
npm run docker:dev:down
```

### Testing & Debugging

```bash
# Run integration tests
npm run test:integration

# System health check
npm run test:system

# View service logs
docker-compose -f docker-compose.dev.yml logs -f [service-name]

# Access service shell
docker-compose -f docker-compose.dev.yml exec edge-hub sh
```

## Data Flow Verification

The system includes a **realistic data simulator** that generates:

- 🌡️ **4 IoT devices** across 3 farms
- 📊 **Sensor readings**: soil moisture, temperature, pH, nutrients
- ⚠️ **Smart alerts** based on threshold violations
- 🔄 **Real-time updates** via WebSocket and MQTT

### Real-time Data Flow:
1. **Edge Hub** generates simulated sensor data
2. **WebSocket** broadcasts to dashboard for real-time display
3. **MQTT** publishes to PWA for offline sync
4. **REST API** syncs with cloud database
5. **Alerts** triggered automatically for anomalies

## Service Communication

```
Sensor Data Flow:
Edge Hub Simulator → SQLite → WebSocket → Dashboard
                   → MQTT → PWA (Offline Sync)
                   → REST API → PostgreSQL → Cloud Storage

Real-time Updates:
Edge Hub → Socket.io → Dashboard (Live Charts)
         → MQTT → PWA (Background Sync)

Offline Capability:
PWA ← MQTT ← Edge Hub (When Online)
PWA → IndexedDB → Background Sync → Cloud (When Online)
```

## Configuration

### Environment Variables
- Development: `.env.development` (auto-created)
- Production: `.env.production`
- Docker: `docker-compose.dev.yml`

### Key Settings
```bash
# Enable/disable features
ENABLE_SIMULATOR=true        # Realistic IoT data simulation
ENABLE_AI_SERVICES=false     # AI/ML features (optional)
ENABLE_VOICE_ASSISTANT=false # Voice interface (optional)

# Service ports
EDGE_HUB_PORT=3000          # IoT gateway
API_PORT=8080               # Cloud API
DASHBOARD_PORT=5173         # Web interface
PWA_PORT=3001               # Mobile app
```

## Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check Docker is running
docker info

# Restart Docker Desktop
# Re-run: npm run start:dev
```

**Port conflicts:**
```bash
# Check what's using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/macOS

# Stop conflicting service or change port in docker-compose.dev.yml
```

**No real-time data:**
```bash
# Check data simulator
curl http://localhost:3000/status

# Should show: "simulator": "running"
```

**Database connection issues:**
```bash
# Reset database
docker-compose -f docker-compose.dev.yml down -v
npm run start:dev
```

### Health Monitoring

Access **Grafana** at http://localhost:3002 for:
- 📈 System performance metrics
- 🔍 Service health monitoring  
- 📊 Real-time data flow visualization
- ⚠️ Alert management

### Log Analysis

```bash
# View all logs
npm run docker:dev:logs

# Service-specific logs
docker-compose -f docker-compose.dev.yml logs -f edge-hub
docker-compose -f docker-compose.dev.yml logs -f api-server
docker-compose -f docker-compose.dev.yml logs -f web-dashboard
```

## Production Deployment

For production deployment, see:
- 📖 `docs/deployment/deployment-guide.md`
- 🐳 `docker-compose.yml` (production config)
- ☸️ `k8s/` (Kubernetes manifests)

## Next Steps

1. **Explore the Dashboard**: Real-time sensor monitoring
2. **Test the PWA**: Mobile-responsive farmer interface  
3. **Check MQTT**: IoT device communication
4. **Review Architecture**: `docs/architecture/system-architecture.md`
5. **Add Real Sensors**: Connect actual IoT devices to Edge Hub

---

## 🚀 Ready to Build with SoilWise!

The complete development environment is now running with:
- ✅ Real-time data simulation
- ✅ End-to-end connectivity
- ✅ Offline-first mobile app
- ✅ Cloud synchronization
- ✅ Monitoring & observability

Start building your agriculture IoT solution! 🌱
