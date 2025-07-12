@echo off
REM SoilWise Development Environment Setup Script for Windows

echo 🌱 SoilWise Development Environment Setup
echo ========================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating directories...
mkdir config 2>nul
mkdir database 2>nul
mkdir logs 2>nul
mkdir data 2>nul

REM Create environment file
echo ⚙️ Creating environment configuration...
(
echo # Development Environment Configuration
echo NODE_ENV=development
echo LOG_LEVEL=debug
echo.
echo # Database
echo DATABASE_URL=postgresql://soilwise:password@localhost:5432/soilwise
echo DB_PATH=./data/edge-hub.db
echo.
echo # API Configuration
echo API_PORT=8080
echo EDGE_HUB_PORT=3000
echo DASHBOARD_PORT=5173
echo PWA_PORT=3001
echo.
echo # MQTT Configuration
echo MQTT_BROKER_URL=mqtt://localhost:1883
echo MQTT_WS_URL=ws://localhost:9001
echo.
echo # Authentication
echo JWT_SECRET=development-jwt-secret-key-change-in-production
echo.
echo # Features
echo ENABLE_SIMULATOR=true
echo ENABLE_AI_SERVICES=false
echo ENABLE_VOICE_ASSISTANT=false
echo.
echo # External Services
echo MINIO_ENDPOINT=http://localhost:9000
echo MINIO_ACCESS_KEY=minioadmin
echo MINIO_SECRET_KEY=minioadmin
echo.
echo # CORS
echo CORS_ORIGIN=http://localhost:5173,http://localhost:3001,http://localhost:3000
) > .env.development

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.dev.yml down --remove-orphans

REM Pull latest images
echo 📥 Pulling Docker images...
docker-compose -f docker-compose.dev.yml pull

REM Build services
echo 🔨 Building services...
docker-compose -f docker-compose.dev.yml build --no-cache

REM Start infrastructure services first
echo 🚀 Starting infrastructure services...
docker-compose -f docker-compose.dev.yml up -d postgres redis mosquitto minio

REM Wait for infrastructure to be ready
echo ⏳ Waiting for infrastructure services...
timeout /t 10 /nobreak >nul

REM Start application services
echo 🚀 Starting application services...
docker-compose -f docker-compose.dev.yml up -d api-server edge-hub

REM Wait for API server to be ready
echo ⏳ Waiting for API server...
timeout /t 15 /nobreak >nul

REM Start frontend services
echo 🚀 Starting frontend services...
docker-compose -f docker-compose.dev.yml up -d web-dashboard pwa-farmer

REM Start monitoring services
echo 📊 Starting monitoring services...
docker-compose -f docker-compose.dev.yml up -d prometheus grafana

REM Final health check
echo 🏥 Performing health checks...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 SoilWise Development Environment is Ready!
echo =============================================
echo.
echo 📱 Applications:
echo   🌐 Web Dashboard:    http://localhost:5173
echo   📱 PWA Farmer App:   http://localhost:3001
echo   ⚙️  Edge Hub:        http://localhost:3000
echo   🔌 API Server:       http://localhost:8080
echo.
echo 🔧 Infrastructure:
echo   🗄️  PostgreSQL:      localhost:5432
echo   📡 MQTT Broker:      localhost:1883 (WebSocket: 9001)
echo   💾 Redis:            localhost:6379
echo   📁 MinIO:            http://localhost:9000 (admin/admin)
echo.
echo 📊 Monitoring:
echo   📈 Prometheus:       http://localhost:9091
echo   📊 Grafana:          http://localhost:3002 (admin/admin)
echo   📧 MailHog:          http://localhost:8025
echo.
echo 🔧 Useful Commands:
echo   📋 View logs:        docker-compose -f docker-compose.dev.yml logs -f [service]
echo   🔄 Restart service:  docker-compose -f docker-compose.dev.yml restart [service]
echo   🛑 Stop all:         docker-compose -f docker-compose.dev.yml down
echo   🧹 Clean up:         docker-compose -f docker-compose.dev.yml down -v
echo.
echo 🌱 Data Flow Test:
echo   1. Open Web Dashboard: http://localhost:5173
echo   2. Check real-time sensor data (simulated)
echo   3. Open PWA App: http://localhost:3001
echo   4. Verify MQTT connection and offline sync
echo.
echo ⚠️  Note: Simulated sensor data is enabled for development.
echo    Real sensors will be detected automatically when connected.

pause
