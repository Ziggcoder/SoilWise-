# Deployment Guide - SoilWise Platform

## 🚀 Deployment Overview

SoilWise supports multiple deployment strategies to accommodate different environments and requirements:

1. **Development** - Local development environment
2. **Cloud** - Scalable cloud deployment
3. **Edge** - Raspberry Pi edge computing
4. **Hybrid** - Combined cloud and edge deployment

## 🏁 Prerequisites

### General Requirements
- **Node.js** 18.0.0 or higher
- **Docker** 20.10.0 or higher
- **Docker Compose** 2.0.0 or higher

### Cloud Deployment
- **Kubernetes** cluster (GKE, EKS, AKS)
- **PostgreSQL** database
- **Redis** for caching
- **Object Storage** (S3, GCS, Azure Blob)

### Edge Deployment
- **Raspberry Pi 4B+** (8GB RAM recommended)
- **64GB+ microSD card** (Class 10 or higher)
- **Reliable power supply**
- **Network connectivity** (WiFi/Ethernet)

## 🔧 Development Deployment

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd soilwise

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start services
npm run dev
```

### Docker Development
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### Docker Compose (Simple Cloud)
```bash
# Production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

#### 1. Build Docker Images
```bash
# Build all images
docker-compose build

# Tag for registry
docker tag soilwise/web-dashboard:latest your-registry/soilwise-web:latest
docker tag soilwise/api-server:latest your-registry/soilwise-api:latest
docker tag soilwise/pwa-farmer:latest your-registry/soilwise-pwa:latest

# Push to registry
docker push your-registry/soilwise-web:latest
docker push your-registry/soilwise-api:latest
docker push your-registry/soilwise-pwa:latest
```

#### 2. Deploy to Kubernetes
```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/database.yaml
kubectl apply -f k8s/api-server.yaml
kubectl apply -f k8s/web-dashboard.yaml
kubectl apply -f k8s/pwa-farmer.yaml
kubectl apply -f k8s/ingress.yaml
```

#### 3. Kubernetes Manifests

**Namespace** (`k8s/namespace.yaml`)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: soilwise
```

**ConfigMap** (`k8s/configmap.yaml`)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: soilwise-config
  namespace: soilwise
data:
  NODE_ENV: "production"
  API_URL: "https://api.soilwise.com"
  MQTT_BROKER_URL: "mqtt://mqtt.soilwise.com:1883"
  AI_SERVICE_URL: "http://ai-services:8082"
```

**API Server Deployment** (`k8s/api-server.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: soilwise
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api-server
        image: your-registry/soilwise-api:latest
        ports:
        - containerPort: 8081
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "postgresql"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: soilwise-secrets
              key: db-password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8081
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-server
  namespace: soilwise
spec:
  selector:
    app: api-server
  ports:
  - port: 8081
    targetPort: 8081
```

**Web Dashboard Deployment** (`k8s/web-dashboard.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-dashboard
  namespace: soilwise
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-dashboard
  template:
    metadata:
      labels:
        app: web-dashboard
    spec:
      containers:
      - name: web-dashboard
        image: your-registry/soilwise-web:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: web-dashboard
  namespace: soilwise
spec:
  selector:
    app: web-dashboard
  ports:
  - port: 80
    targetPort: 80
```

**Ingress** (`k8s/ingress.yaml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: soilwise-ingress
  namespace: soilwise
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - soilwise.com
    - api.soilwise.com
    secretName: soilwise-tls
  rules:
  - host: soilwise.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-dashboard
            port:
              number: 80
  - host: api.soilwise.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-server
            port:
              number: 8081
```

## 🥧 Raspberry Pi Edge Deployment

### 1. Raspberry Pi Setup

#### Install Raspberry Pi OS
```bash
# Flash Raspberry Pi OS Lite 64-bit to SD card
# Enable SSH and WiFi during setup
```

#### Initial Configuration
```bash
# Connect via SSH
ssh pi@raspberrypi.local

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi

# Install Docker Compose
sudo apt install docker-compose -y

# Reboot
sudo reboot
```

### 2. Deploy SoilWise Edge

#### Transfer Files
```bash
# Copy project to Raspberry Pi
scp -r . pi@raspberrypi.local:/home/pi/soilwise/
```

#### Deploy Services
```bash
# Connect to Raspberry Pi
ssh pi@raspberrypi.local

# Navigate to project
cd /home/pi/soilwise

# Setup environment
cp .env.pi .env

# Deploy services
docker-compose -f docker-compose.pi.yml up -d
```

### 3. Edge-Specific Configuration

**Environment Variables** (`.env.pi`)
```bash
# Device Configuration
DEVICE_ID=edge_pi_001
DEVICE_NAME=Farm Edge Hub
DEVICE_LOCATION=Field Station Alpha

# Database
DB_PATH=/data/soilwise.db

# MQTT
MQTT_BROKER_URL=mqtt://cloud.soilwise.com:1883
MQTT_CLIENT_ID=edge_pi_001

# AI Services (Local)
AI_SERVICE_URL=http://localhost:8082
OLLAMA_API_URL=http://localhost:11434

# Voice Assistant
WHISPER_MODEL_PATH=/models/whisper-tiny
COQUI_MODEL_PATH=/models/coqui-basic

# Sync Settings
SYNC_INTERVAL=300000
SYNC_BATCH_SIZE=100
OFFLINE_MODE=true

# Hardware
SERIAL_PORTS=/dev/ttyUSB0,/dev/ttyACM0
I2C_ENABLED=true
SPI_ENABLED=true
```

**Docker Compose for Pi** (`docker-compose.pi.yml`)
```yaml
version: '3.8'

services:
  edge-hub:
    build: 
      context: ./apps/edge-hub
      dockerfile: Dockerfile.pi
    volumes:
      - /data:/data
      - /dev:/dev
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
      - /dev/ttyACM0:/dev/ttyACM0
    privileged: true
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - DB_PATH=/data/soilwise.db
    depends_on:
      - ai-services
      - voice-assistant

  ai-services:
    build:
      context: ./packages/ai-services
      dockerfile: Dockerfile.pi
    volumes:
      - /data/models:/models
    ports:
      - "8082:8082"
    environment:
      - NODE_ENV=production
      - OLLAMA_API_URL=http://ollama:11434

  voice-assistant:
    build:
      context: ./packages/voice-assistant
      dockerfile: Dockerfile.pi
    volumes:
      - /data/models:/models
    ports:
      - "8083:8083"
    environment:
      - NODE_ENV=production
      - WHISPER_MODEL_PATH=/models/whisper-tiny

  ollama:
    image: ollama/ollama:latest
    volumes:
      - /data/ollama:/root/.ollama
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_MODELS=llama3:8b

  mqtt-broker:
    image: eclipse-mosquitto:latest
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - /data/mqtt:/mosquitto/data
      - /data/mqtt/config:/mosquitto/config
```

### 4. Hardware Integration

#### Sensor Connection
```bash
# Enable I2C and SPI
sudo raspi-config
# Interface Options > I2C > Yes
# Interface Options > SPI > Yes

# Install sensor libraries
pip3 install adafruit-circuitpython-*
pip3 install w1thermsensor
```

#### GPIO Configuration
```python
# Example sensor reading script
import RPi.GPIO as GPIO
import time

# Setup GPIO pins
GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.IN)  # Sensor input pin

def read_sensor():
    return GPIO.input(18)

# Cleanup
GPIO.cleanup()
```

## 🔄 Hybrid Deployment

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloud Services                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web Dashboard │  │   API Gateway   │  │   Data Lake     │ │
│  │   (Kubernetes)  │  │   (Load Balancer│  │   (PostgreSQL)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                          ┌─────┴─────┐
                          │   MQTT    │
                          │   Broker  │
                          └─────┬─────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    Edge Computing Hub                          │
│                   (Raspberry Pi Fleet)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Edge Hub #1   │  │   Edge Hub #2   │  │   Edge Hub #3   │ │
│  │   (Farm A)      │  │   (Farm B)      │  │   (Farm C)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Setup Steps

1. **Deploy Cloud Services**
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/
```

2. **Deploy Edge Hubs**
```bash
# For each Raspberry Pi
docker-compose -f docker-compose.pi.yml up -d
```

3. **Configure Sync**
```bash
# Setup cloud sync endpoints
export CLOUD_SYNC_ENDPOINT=https://api.soilwise.com/sync
export CLOUD_API_KEY=your_api_key
```

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Generate certificates with Let's Encrypt
certbot certonly --webroot -w /var/www/html -d soilwise.com

# Configure nginx
server {
    listen 443 ssl;
    server_name soilwise.com;
    
    ssl_certificate /etc/letsencrypt/live/soilwise.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/soilwise.com/privkey.pem;
    
    location / {
        proxy_pass http://web-dashboard:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Firewall Configuration
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 1883/tcp  # MQTT
sudo ufw enable

# Raspberry Pi
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3002 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 1883 -j ACCEPT
```

## 📊 Monitoring and Logging

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'soilwise-api'
    static_configs:
      - targets: ['api-server:8081']
    metrics_path: '/metrics'

  - job_name: 'soilwise-edge'
    static_configs:
      - targets: ['edge-hub:3002']
    metrics_path: '/metrics'
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "SoilWise Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{job=\"soilwise-api\"}"
          }
        ]
      },
      {
        "title": "Sensor Data Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(sensor_data_total[5m])"
          }
        ]
      }
    ]
  }
}
```

### Log Aggregation
```yaml
# fluentd configuration
<source>
  @type tail
  path /var/log/containers/soilwise-*.log
  pos_file /var/log/fluentd-docker.log.pos
  tag docker.soilwise.*
  format json
</source>

<match docker.soilwise.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name soilwise
</match>
```

## 🔧 Backup and Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump -h localhost -U soilwise soilwise_db > backup.sql

# SQLite backup (Edge)
sqlite3 /data/soilwise.db ".backup backup.db"
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker exec postgres pg_dump -U soilwise soilwise_db > $BACKUP_DIR/db_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /data

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/db_$DATE.sql s3://soilwise-backups/
aws s3 cp $BACKUP_DIR/files_$DATE.tar.gz s3://soilwise-backups/

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 🔄 Update and Maintenance

### Rolling Updates
```bash
# Update API server
kubectl set image deployment/api-server api-server=your-registry/soilwise-api:v2.0.0

# Check rollout status
kubectl rollout status deployment/api-server

# Rollback if needed
kubectl rollout undo deployment/api-server
```

### Edge Device Updates
```bash
# Update edge device
ssh pi@raspberrypi.local
cd /home/pi/soilwise
git pull origin main
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

## 🚨 Troubleshooting

### Common Issues

#### Service Not Starting
```bash
# Check logs
docker-compose logs api-server

# Check resource usage
docker stats

# Check port conflicts
netstat -tulpn | grep :8081
```

#### Database Connection Issues
```bash
# Test database connection
docker exec -it postgres psql -U soilwise -d soilwise_db

# Check database logs
docker logs postgres
```

#### MQTT Connection Issues
```bash
# Test MQTT connection
mosquitto_pub -h localhost -t test -m "hello"
mosquitto_sub -h localhost -t test

# Check MQTT logs
docker logs mqtt-broker
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Database migrations applied
- [ ] Firewall rules configured
- [ ] Monitoring setup

### Post-Deployment
- [ ] Health checks passing
- [ ] Services accessible
- [ ] Backups configured
- [ ] Monitoring alerts configured
- [ ] Documentation updated

### Edge Deployment
- [ ] Raspberry Pi configured
- [ ] Sensors connected
- [ ] Network connectivity verified
- [ ] Sync with cloud working
- [ ] Local AI models loaded

## 🔮 Scaling Considerations

### Horizontal Scaling
```yaml
# Scale API servers
kubectl scale deployment api-server --replicas=5

# Auto-scaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling
```yaml
# PostgreSQL clustering
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-cluster
spec:
  instances: 3
  primaryUpdateStrategy: unsupervised
  postgresql:
    parameters:
      max_connections: "200"
      shared_preload_libraries: "pg_stat_statements"
```

This deployment guide provides comprehensive instructions for deploying SoilWise in various environments. Choose the appropriate deployment strategy based on your requirements and infrastructure capabilities.
