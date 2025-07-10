# SoilWise Deployment Guide

## 🚀 Deployment Overview

SoilWise supports multiple deployment strategies designed for agricultural environments, from cloud-based installations to edge computing on Raspberry Pi devices in remote locations.

## 🏗️ Deployment Architectures

### 1. Cloud-First Deployment
- **Target**: Large farms with reliable internet
- **Benefits**: Full features, automatic updates, centralized management
- **Infrastructure**: AWS/GCP/Azure + CDN + Load Balancer

### 2. Edge-First Deployment
- **Target**: Remote farms with limited connectivity
- **Benefits**: Offline operation, local AI processing, reduced latency
- **Infrastructure**: Raspberry Pi + Local sensors + Satellite/4G backup

### 3. Hybrid Deployment
- **Target**: Mixed environments
- **Benefits**: Best of both worlds, intelligent sync
- **Infrastructure**: Edge + Cloud with smart synchronization

## 🔧 Edge Computing Setup (Raspberry Pi)

### Hardware Requirements

#### Minimum Configuration
- **Device**: Raspberry Pi 4B (4GB RAM)
- **Storage**: 64GB microSD + 256GB USB SSD
- **Connectivity**: WiFi 6 + Ethernet
- **Power**: 5V/3A official power supply
- **Cooling**: Active cooling fan

#### Recommended Configuration
- **Device**: Raspberry Pi 4B (8GB RAM)
- **Storage**: 128GB microSD + 1TB USB SSD
- **Connectivity**: WiFi 6 + Ethernet + 4G/5G modem
- **Power**: UPS with 4-hour backup
- **Cooling**: Active cooling + heat sinks
- **Case**: Weatherproof enclosure

### Software Installation

#### Step 1: Base OS Setup
```bash
# Flash Raspberry Pi OS (64-bit) to microSD
# Enable SSH and configure WiFi during flash

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y git docker.io docker-compose nodejs npm python3 python3-pip
```

#### Step 2: Docker Setup
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 3: SoilWise Installation
```bash
# Clone repository
git clone https://github.com/soilwise/platform.git
cd platform

# Setup environment
cp .env.example .env.pi
# Edit .env.pi with your configuration

# Install dependencies
npm install

# Build applications
npm run build

# Start services
docker-compose -f docker-compose.pi.yml up -d
```

### AI Models Installation

#### Ollama LLaMA3 Setup
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull LLaMA3 model (8B version for Pi)
ollama pull llama3:8b

# Test model
ollama run llama3:8b "What are the optimal soil conditions for tomatoes?"
```

#### Whisper Model Setup
```bash
# Install Whisper
pip3 install openai-whisper

# Download models
whisper --model base --download-root /opt/whisper-models
whisper --model small --download-root /opt/whisper-models
```

#### Coqui TTS Setup
```bash
# Install Coqui TTS
pip3 install coqui-tts

# Download TTS models
tts --list_models
tts --model_name "tts_models/en/ljspeech/tacotron2-DDC" --text "Hello farmer" --out_path /tmp/test.wav
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Infrastructure as Code (Terraform)
```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# ECS Cluster
resource "aws_ecs_cluster" "soilwise_cluster" {
  name = "soilwise-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "soilwise_alb" {
  name               = "soilwise-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false
}

# RDS PostgreSQL
resource "aws_db_instance" "soilwise_db" {
  identifier = "soilwise-db"
  
  engine         = "postgres"
  engine_version = "14.6"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type         = "gp2"
  storage_encrypted    = true
  
  db_name  = "soilwise"
  username = "admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.soilwise.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = true
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "soilwise_redis" {
  cluster_id           = "soilwise-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.soilwise.name
  security_group_ids   = [aws_security_group.redis.id]
}
```

#### ECS Task Definition
```json
{
  "family": "soilwise-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "soilwise-api",
      "image": "soilwise/api-server:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "postgresql://admin:password@db-endpoint:5432/soilwise"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/soilwise-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Kubernetes Deployment

#### Namespace and ConfigMap
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: soilwise
---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: soilwise-config
  namespace: soilwise
data:
  NODE_ENV: "production"
  MQTT_BROKER_URL: "mqtt://mqtt-broker:1883"
  REDIS_URL: "redis://redis-service:6379"
```

#### API Server Deployment
```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: soilwise-api
  namespace: soilwise
spec:
  replicas: 3
  selector:
    matchLabels:
      app: soilwise-api
  template:
    metadata:
      labels:
        app: soilwise-api
    spec:
      containers:
      - name: api
        image: soilwise/api-server:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: soilwise-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: soilwise-secrets
              key: jwt-secret
        envFrom:
        - configMapRef:
            name: soilwise-config
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: soilwise-api-service
  namespace: soilwise
spec:
  selector:
    app: soilwise-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy SoilWise

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push API
      uses: docker/build-push-action@v4
      with:
        context: ./apps/api-server
        push: true
        tags: soilwise/api-server:latest
    
    - name: Build and push Dashboard
      uses: docker/build-push-action@v4
      with:
        context: ./apps/web-dashboard
        push: true
        tags: soilwise/web-dashboard:latest
    
    - name: Build and push Edge Hub
      uses: docker/build-push-action@v4
      with:
        context: ./apps/edge-hub
        push: true
        tags: soilwise/edge-hub:latest

  deploy-cloud:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to AWS ECS
      run: |
        aws ecs update-service --cluster soilwise-cluster --service soilwise-api --force-new-deployment
        aws ecs update-service --cluster soilwise-cluster --service soilwise-dashboard --force-new-deployment
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_DEFAULT_REGION: us-east-1

  deploy-edge:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to Edge Devices
      run: |
        # Update edge devices via SSH
        for device in ${{ secrets.EDGE_DEVICES }}; do
          ssh -o StrictHostKeyChecking=no pi@$device "
            cd /opt/soilwise &&
            git pull origin main &&
            docker-compose pull &&
            docker-compose up -d
          "
        done
```

## 📊 Monitoring and Observability

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'soilwise-api'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: /metrics
    
  - job_name: 'soilwise-edge'
    static_configs:
      - targets: ['edge-device-1:3000', 'edge-device-2:3000']
    metrics_path: /metrics
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
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
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Sensor Data Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(sensor_readings_total[5m])",
            "legendFormat": "Readings per second"
          }
        ]
      },
      {
        "title": "Edge Device Health",
        "type": "table",
        "targets": [
          {
            "expr": "up{job=\"soilwise-edge\"}",
            "legendFormat": "{{instance}}"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security Considerations

### SSL/TLS Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name soilwise.example.com;
    
    ssl_certificate /etc/ssl/certs/soilwise.crt;
    ssl_certificate_key /etc/ssl/private/soilwise.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://soilwise-api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Edge Device Security
```bash
# Security hardening script for Raspberry Pi
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000/tcp  # SoilWise Edge Hub
sudo ufw allow 1883/tcp  # MQTT
sudo ufw enable

# Disable unused services
sudo systemctl disable bluetooth
sudo systemctl disable avahi-daemon

# Setup fail2ban
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Configure SSH key authentication
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Install security updates automatically
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 🚀 Scaling Strategies

### Horizontal Scaling
- Load balancer with multiple API instances
- Database read replicas
- CDN for static assets
- Edge device clustering

### Vertical Scaling
- Increase instance sizes
- Optimize database queries
- Implement caching layers
- Use more powerful edge devices

### Geographic Scaling
- Multi-region deployment
- Edge CDN distribution
- Regional data replication
- Localized AI models

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Infrastructure provisioned
- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Deployment
- [ ] Build and test all applications
- [ ] Deploy to staging environment
- [ ] Run integration tests
- [ ] Deploy to production
- [ ] Verify all services running
- [ ] Run smoke tests

### Post-Deployment
- [ ] Monitor application metrics
- [ ] Check log files
- [ ] Verify data synchronization
- [ ] Test edge device connectivity
- [ ] Validate AI model performance
- [ ] Update documentation

## 🆘 Troubleshooting

### Common Issues

#### Edge Device Connectivity
```bash
# Check network connectivity
ping -c 4 8.8.8.8

# Check MQTT broker connection
mosquitto_sub -h localhost -t "sensor/+/data"

# Check Docker containers
docker-compose ps
docker-compose logs -f
```

#### AI Model Performance
```bash
# Check Ollama status
ollama list
ollama ps

# Test model inference
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3:8b", "prompt": "Test prompt"}'
```

#### Database Issues
```bash
# Check database connectivity
psql -h localhost -U admin -d soilwise -c "SELECT version();"

# Check database size
psql -h localhost -U admin -d soilwise -c "SELECT pg_size_pretty(pg_database_size('soilwise'));"
```

This deployment guide provides comprehensive instructions for setting up SoilWise in various environments, from simple cloud deployments to complex edge computing scenarios in rural agricultural settings.
