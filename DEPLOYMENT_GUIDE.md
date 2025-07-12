# SoilWise Deployment Guide

## 🚀 **DEPLOYMENT OVERVIEW**

This guide covers the complete deployment of the SoilWise system across three tiers:
- **Cloud Infrastructure** (AWS/Azure/GCP)
- **Edge Computing** (Raspberry Pi farms)
- **Client Applications** (Web Dashboard + PWA)

## ☁️ **CLOUD DEPLOYMENT**

### **Option 1: Docker Compose (Simple)**

```bash
# 1. Clone repository
git clone https://github.com/soilwise/soilwise.git
cd soilwise

# 2. Configure environment
cp .env.example .env.production
# Edit .env.production with your values

# 3. Deploy stack
docker-compose -f docker-compose.production.yml up -d

# 4. Initialize database
docker-compose exec api-server npm run migrate
docker-compose exec api-server npm run seed

# 5. Verify deployment
curl http://localhost:8080/health
```

### **Option 2: Kubernetes (Scalable)**

```bash
# 1. Create namespace
kubectl apply -f k8s/production.yaml

# 2. Create secrets
kubectl create secret generic soilwise-secrets \
  --from-literal=database-url="postgresql://user:pass@postgres:5432/soilwise" \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=postgres-password="your-db-password" \
  -n soilwise

# 3. Deploy services
kubectl apply -f k8s/production.yaml

# 4. Check status
kubectl get pods -n soilwise
kubectl get services -n soilwise

# 5. Access dashboard
kubectl port-forward service/api-server-service 8080:80 -n soilwise
```

### **Cloud Infrastructure Requirements**

| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| **API Server** | 1 vCPU, 1GB RAM | 2 vCPU, 4GB RAM | 4 vCPU, 8GB RAM |
| **Database** | 1 vCPU, 2GB RAM | 2 vCPU, 8GB RAM | 4 vCPU, 16GB RAM |
| **AI Services** | 1 GPU, 8GB VRAM | 1 GPU, 16GB VRAM | 2 GPU, 32GB VRAM |
| **Storage** | 50GB SSD | 200GB SSD | 1TB SSD |
| **Network** | 10 Mbps | 100 Mbps | 1 Gbps |

## 🏗️ **EDGE DEPLOYMENT**

### **Raspberry Pi Setup**

```bash
# 1. Automated installation
curl -fsSL https://raw.githubusercontent.com/soilwise/setup/main/install-edge.sh | bash

# 2. Manual configuration
sudo nano /opt/soilwise/config/.env

# 3. Configure cloud connection
CLOUD_SYNC_ENDPOINT=https://api.soilwise.com
CLOUD_API_KEY=your-api-key-here

# 4. Start services
sudo systemctl restart soilwise-edge
sudo systemctl status soilwise-edge

# 5. Test connectivity
curl http://localhost:3000/health
mosquitto_pub -h localhost -t test -m "Hello SoilWise"
```

### **Hardware Requirements**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Device** | Raspberry Pi 4B 4GB | Raspberry Pi 4B 8GB |
| **Storage** | 32GB microSD | 64GB microSD + 256GB SSD |
| **Power** | 3A USB-C | 3A USB-C + UPS backup |
| **Network** | WiFi | Ethernet + 4G LTE backup |
| **Sensors** | 1x soil sensor | 5x sensors + camera |

### **Network Configuration**

```bash
# Static IP configuration
sudo nano /etc/dhcpcd.conf

# Add:
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8

# Port forwarding (router)
# External Port -> Internal IP:Port
3000 -> 192.168.1.100:3000  # Edge Hub
1883 -> 192.168.1.100:1883  # MQTT
3001 -> 192.168.1.100:3001  # PWA
```

## 📱 **CLIENT DEPLOYMENT**

### **Web Dashboard**

```bash
# 1. Build production bundle
cd apps/web-dashboard
npm run build

# 2. Deploy to CDN (Vercel/Netlify)
vercel --prod
# OR
netlify deploy --prod --dir=dist

# 3. Configure environment
# Set VITE_API_URL=https://api.soilwise.com
# Set VITE_WS_URL=wss://api.soilwise.com
```

### **PWA Farmer App**

```bash
# 1. Build PWA bundle
cd apps/pwa-farmer
npm run build

# 2. Deploy to edge hub
scp -r dist/* pi@192.168.1.100:/opt/soilwise/pwa/

# 3. Configure local hosting
# PWA served from edge hub for offline access
# Fallback to CDN when edge is unreachable
```

## 🔧 **CONFIGURATION MATRIX**

### **Environment Variables**

| Variable | Development | Edge Hub | Cloud Production |
|----------|-------------|----------|------------------|
| `NODE_ENV` | development | production | production |
| `LOG_LEVEL` | debug | info | warn |
| `DB_TYPE` | sqlite | sqlite | postgresql |
| `MQTT_HOST` | localhost | localhost | cluster-internal |
| `SYNC_INTERVAL` | 60000 | 300000 | 300000 |
| `AI_ENABLED` | false | true | true |
| `CACHE_TTL` | 60 | 300 | 600 |

### **Service Discovery**

```yaml
# Production service URLs
services:
  api_server: "https://api.soilwise.com"
  mqtt_broker: "wss://mqtt.soilwise.com:9001"
  ai_services: "https://ai.soilwise.com"
  file_storage: "https://files.soilwise.com"
  
# Edge hub URLs  
edge_services:
  edge_hub: "http://192.168.1.100:3000"
  mqtt_local: "ws://192.168.1.100:1883"
  pwa_local: "http://192.168.1.100:3001"
```

## 🔄 **DEPLOYMENT WORKFLOWS**

### **CI/CD Pipeline**

```yaml
# .github/workflows/deploy.yml
name: Deploy SoilWise
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      
  build-cloud:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v3
        with:
          context: ./apps/api-server
          push: true
          tags: soilwise/api-server:latest
          
  build-edge:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v3
        with:
          context: ./apps/edge-hub
          file: ./apps/edge-hub/Dockerfile.arm64
          platforms: linux/arm64
          push: true
          tags: soilwise/edge-hub:latest
          
  deploy-cloud:
    needs: [build-cloud]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api-server \
            api-server=soilwise/api-server:latest \
            -n soilwise
```

### **Edge Auto-Update**

```bash
# Edge hubs auto-update nightly
# /etc/cron.d/soilwise-update
0 2 * * * soilwise cd /opt/soilwise/edge-hub && \
  git pull && \
  npm ci --production && \
  sudo systemctl restart soilwise-edge
```

## 📊 **MONITORING & OBSERVABILITY**

### **Health Checks**

```bash
# Cloud services
curl https://api.soilwise.com/health
curl https://mqtt.soilwise.com/health
curl https://ai.soilwise.com/health

# Edge services  
curl http://192.168.1.100:3000/health
mosquitto_pub -h 192.168.1.100 -t '$SYS/broker/uptime' -n

# Database connections
curl https://api.soilwise.com/health/database
sqlite3 /opt/soilwise/data/edge-hub.db ".tables"
```

### **Metrics Collection**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api-server'
    static_configs:
      - targets: ['api-server:8080']
      
  - job_name: 'edge-hubs'
    static_configs:
      - targets: 
        - '192.168.1.100:9100'  # Farm 1
        - '192.168.1.101:9100'  # Farm 2
        
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### **Alerting Rules**

```yaml
# alerts.yml
groups:
  - name: soilwise
    rules:
      - alert: EdgeHubDown
        expr: up{job="edge-hubs"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Edge Hub {{ $labels.instance }} is down"
          
      - alert: HighCPUUsage
        expr: cpu_usage_percent > 90
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          
      - alert: SensorDataStale
        expr: time() - last_sensor_reading_timestamp > 3600
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "No sensor data received for 1 hour"
```

## 🔒 **SECURITY CHECKLIST**

### **Cloud Security**

- ✅ HTTPS/TLS encryption for all endpoints
- ✅ JWT authentication with refresh tokens
- ✅ API rate limiting (100 req/min per IP)
- ✅ Database encryption at rest
- ✅ VPC network isolation
- ✅ WAF protection against common attacks
- ✅ Regular security updates
- ✅ Backup encryption

### **Edge Security**

- ✅ WireGuard VPN tunnel to cloud
- ✅ Firewall rules (UFW configured)
- ✅ SSH key-only authentication
- ✅ MQTT authentication required
- ✅ Device certificate validation
- ✅ Local data encryption
- ✅ Automatic security updates
- ✅ Intrusion detection (fail2ban)

### **Network Security**

- ✅ TLS 1.3 for all communications
- ✅ Certificate pinning in mobile apps
- ✅ Network segmentation (IoT VLAN)
- ✅ Regular certificate rotation
- ✅ DDoS protection at CDN level
- ✅ Geo-blocking for admin interfaces

## 📞 **TROUBLESHOOTING**

### **Common Issues**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Edge Hub Offline** | Dashboard shows "Disconnected" | Check network, restart services |
| **MQTT Connection Failed** | Sensors not reporting | Verify credentials, check broker |
| **Cloud Sync Failed** | Data not appearing in dashboard | Check API keys, network connectivity |
| **PWA Not Loading** | App shows error screen | Clear cache, check edge hub status |
| **AI Service Down** | No crop analysis | Check GPU availability, restart service |

### **Log Locations**

```bash
# Cloud logs
kubectl logs -f deployment/api-server -n soilwise
docker-compose logs -f api-server

# Edge logs  
sudo journalctl -u soilwise-edge -f
tail -f /opt/soilwise/logs/edge-hub.log
tail -f /opt/soilwise/logs/mosquitto.log

# System logs
tail -f /var/log/syslog
dmesg | grep -i error
```

### **Emergency Procedures**

```bash
# 1. Edge Hub Factory Reset
sudo systemctl stop soilwise-edge
sudo rm -rf /opt/soilwise/data/*
sudo systemctl start soilwise-edge

# 2. Cloud Service Rollback
kubectl rollout undo deployment/api-server -n soilwise

# 3. Database Backup Restore
pg_restore --clean --no-acl --no-owner -h localhost -U soilwise -d soilwise backup.sql

# 4. Emergency Maintenance Mode
kubectl scale deployment api-server --replicas=0 -n soilwise
# Display maintenance page
```

This deployment architecture ensures high availability, scalability, and reliability across the entire SoilWise ecosystem! 🌱
