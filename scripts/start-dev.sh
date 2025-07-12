#!/bin/bash

# SoilWise Development Environment Setup Script
set -e

echo "🌱 SoilWise Development Environment Setup"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p {config,database,logs,data}
mkdir -p apps/{api-server,edge-hub,web-dashboard,pwa-farmer}
mkdir -p packages/{ai-services,voice-assistant}

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env.development << EOF
# Development Environment Configuration
NODE_ENV=development
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://soilwise:password@localhost:5432/soilwise
DB_PATH=./data/edge-hub.db

# API Configuration
API_PORT=8080
EDGE_HUB_PORT=3000
DASHBOARD_PORT=5173
PWA_PORT=3001

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_WS_URL=ws://localhost:9001

# Authentication
JWT_SECRET=development-jwt-secret-key-change-in-production

# Features
ENABLE_SIMULATOR=true
ENABLE_AI_SERVICES=false
ENABLE_VOICE_ASSISTANT=false

# External Services
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3001,http://localhost:3000
EOF

# Create basic database initialization
echo "🗄️ Creating database initialization..."
cat > database/init.sql << EOF
-- SoilWise Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'farmer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farms table
CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    location POINT NOT NULL,
    size DECIMAL(10,2),
    crop_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    farm_id INTEGER REFERENCES farms(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sensor readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(device_id),
    farm_id INTEGER REFERENCES farms(id),
    sensor_type VARCHAR(100) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    location POINT,
    quality VARCHAR(20) DEFAULT 'good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id),
    device_id VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device ON sensor_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_farm ON alerts(farm_id);

-- Insert sample data
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@soilwise.com', '\$2b\$10\$hash', 'Admin User', 'admin'),
('farmer@soilwise.com', '\$2b\$10\$hash', 'John Farmer', 'farmer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO farms (name, owner_id, location, size, crop_type) VALUES
('Green Valley Farm', 2, POINT(-74.0060, 40.7128), 150.5, 'corn'),
('Sunshine Greenhouse', 2, POINT(-74.0058, 40.7130), 75.2, 'tomatoes'),
('Golden Wheat Fields', 2, POINT(-74.0055, 40.7135), 220.8, 'wheat')
ON CONFLICT DO NOTHING;
EOF

# Create Prometheus configuration
echo "📊 Creating monitoring configuration..."
cat > config/prometheus-dev.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api-server'
    static_configs:
      - targets: ['api-server:8080']
    metrics_path: '/metrics'
    
  - job_name: 'edge-hub'
    static_configs:
      - targets: ['edge-hub:3000']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
EOF

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans

# Pull latest images
echo "📥 Pulling Docker images..."
docker-compose -f docker-compose.dev.yml pull

# Build services
echo "🔨 Building services..."
docker-compose -f docker-compose.dev.yml build --no-cache

# Start infrastructure services first
echo "🚀 Starting infrastructure services..."
docker-compose -f docker-compose.dev.yml up -d postgres redis mosquitto minio

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure services..."
sleep 10

# Check if PostgreSQL is ready
echo "🔍 Checking PostgreSQL connection..."
until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U soilwise; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

# Start application services
echo "🚀 Starting application services..."
docker-compose -f docker-compose.dev.yml up -d api-server edge-hub

# Wait for API server to be ready
echo "⏳ Waiting for API server..."
sleep 15

# Start frontend services
echo "🚀 Starting frontend services..."
docker-compose -f docker-compose.dev.yml up -d web-dashboard pwa-farmer

# Start monitoring services
echo "📊 Starting monitoring services..."
docker-compose -f docker-compose.dev.yml up -d prometheus grafana

# Final health check
echo "🏥 Performing health checks..."
sleep 10

# Check service status
services=("postgres" "redis" "mosquitto" "api-server" "edge-hub" "web-dashboard" "pwa-farmer")
for service in "\${services[@]}"; do
    if docker-compose -f docker-compose.dev.yml ps \$service | grep -q "Up"; then
        echo "✅ \$service is running"
    else
        echo "❌ \$service is not running"
    fi
done

# Display connection information
echo ""
echo "🎉 SoilWise Development Environment is Ready!"
echo "============================================="
echo ""
echo "📱 Applications:"
echo "  🌐 Web Dashboard:    http://localhost:5173"
echo "  📱 PWA Farmer App:   http://localhost:3001"
echo "  ⚙️  Edge Hub:        http://localhost:3000"
echo "  🔌 API Server:       http://localhost:8080"
echo ""
echo "🔧 Infrastructure:"
echo "  🗄️  PostgreSQL:      localhost:5432"
echo "  📡 MQTT Broker:      localhost:1883 (WebSocket: 9001)"
echo "  💾 Redis:            localhost:6379"
echo "  📁 MinIO:            http://localhost:9000 (admin/admin)"
echo ""
echo "📊 Monitoring:"
echo "  📈 Prometheus:       http://localhost:9091"
echo "  📊 Grafana:          http://localhost:3002 (admin/admin)"
echo "  📧 MailHog:          http://localhost:8025"
echo ""
echo "🔧 Useful Commands:"
echo "  📋 View logs:        docker-compose -f docker-compose.dev.yml logs -f [service]"
echo "  🔄 Restart service:  docker-compose -f docker-compose.dev.yml restart [service]"
echo "  🛑 Stop all:         docker-compose -f docker-compose.dev.yml down"
echo "  🧹 Clean up:         docker-compose -f docker-compose.dev.yml down -v"
echo ""
echo "🌱 Data Flow Test:"
echo "  1. Open Web Dashboard: http://localhost:5173"
echo "  2. Check real-time sensor data (simulated)"
echo "  3. Open PWA App: http://localhost:3001"
echo "  4. Verify MQTT connection and offline sync"
echo ""
echo "⚠️  Note: Simulated sensor data is enabled for development."
echo "   Real sensors will be detected automatically when connected."
