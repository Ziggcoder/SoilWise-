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
