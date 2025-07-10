# System Architecture - SoilWise Agriculture SaaS Platform

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloud Infrastructure                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web Dashboard │  │   API Gateway   │  │   Data Lake     │ │
│  │   (React SPA)   │  │   (Node.js)     │  │   (PostgreSQL)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                          ┌─────┴─────┐
                          │   MQTT    │
                          │  Broker   │
                          └─────┬─────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Edge Computing Hub                         │
│                    (Raspberry Pi 4B+)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PWA Server    │  │   AI Engine     │  │   Voice Agent   │ │
│  │   (Node.js)     │  │   (Ollama)      │  │   (Whisper)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Local DB      │  │   Vector DB     │  │   MQTT Client   │ │
│  │   (SQLite)      │  │   (ChromaDB)    │  │   (Node.js)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
          ┌─────────┴─────────┐   ┌─────────┴─────────┐
          │   LoRaWAN Gateway │   │   WiFi/Ethernet   │
          │   (RAK7258)       │   │   Sensors         │
          └─────────┬─────────┘   └─────────┬─────────┘
                    │                       │
    ┌───────────────┴───────────────┐      │
    │                               │      │
┌───┴───┐  ┌───────┐  ┌───────┐  ┌─┴──┐  ┌┴────┐
│Soil   │  │Temp/  │  │pH     │  │Cam │  │Pump │
│Sensor │  │Humid  │  │Sensor │  │era │  │Ctrl │
└───────┘  └───────┘  └───────┘  └────┘  └─────┘
```

## 🔧 Component Architecture

### 1. Web Dashboard (React + TypeScript)

```typescript
// Component Architecture
src/
├── components/
│   ├── dashboard/
│   │   ├── SensorGrid.tsx
│   │   ├── WeatherWidget.tsx
│   │   └── AlertPanel.tsx
│   ├── charts/
│   │   ├── TimeSeriesChart.tsx
│   │   └── HeatmapChart.tsx
│   └── shared/
│       ├── Layout.tsx
│       └── Navigation.tsx
├── hooks/
│   ├── useMqttConnection.ts
│   ├── useSensorData.ts
│   └── useWebRTC.ts
├── services/
│   ├── mqttService.ts
│   ├── apiService.ts
│   └── authService.ts
└── store/
    ├── sensorSlice.ts
    ├── alertSlice.ts
    └── userSlice.ts
```

### 2. Offline-First PWA (Progressive Web App)

```javascript
// PWA Service Architecture
src/
├── sw.js                    // Service Worker
├── manifest.json           // App Manifest
├── offline/
│   ├── syncManager.js      // Background sync
│   ├── cacheStrategy.js    // Cache strategies
│   └── conflictResolver.js // Conflict resolution
├── database/
│   ├── schema.sql          // SQLite schema
│   ├── migrations/         // Database migrations
│   └── sync.js            // Data synchronization
└── components/
    ├── OfflineIndicator.jsx
    ├── SyncStatus.jsx
    └── CameraCapture.jsx
```

### 3. Voice Assistant (Whisper + Coqui + Ollama)

```python
# Voice Processing Pipeline
voice_assistant/
├── speech_to_text/
│   ├── whisper_client.py   # OpenAI Whisper
│   ├── audio_preprocessor.py
│   └── language_detector.py
├── text_to_speech/
│   ├── coqui_tts.py        # Coqui TTS
│   ├── voice_cloning.py
│   └── audio_postprocessor.py
├── nlp/
│   ├── ollama_client.py    # LLaMA3 integration
│   ├── intent_classifier.py
│   └── context_manager.py
└── pipeline/
    ├── voice_pipeline.py
    ├── audio_buffer.py
    └── response_generator.py
```

### 4. AI Advisory Engine (LangChain + Vector DB)

```python
# AI Advisory Architecture
ai_engine/
├── agents/
│   ├── crop_advisor.py     # Crop recommendation
│   ├── irrigation_planner.py
│   ├── disease_detector.py
│   └── yield_optimizer.py
├── knowledge_base/
│   ├── vector_store.py     # ChromaDB integration
│   ├── document_loader.py
│   ├── embeddings.py
│   └── retrieval.py
├── chains/
│   ├── qa_chain.py         # Q&A chain
│   ├── recommendation_chain.py
│   └── analysis_chain.py
└── tools/
    ├── weather_api.py
    ├── market_data.py
    └── satellite_imagery.py
```

## 🔄 Data Flow Architecture

### 1. Real-time Data Pipeline

```
IoT Sensors → LoRaWAN Gateway → Edge Hub → Local Processing → MQTT → Cloud
     ↓              ↓             ↓            ↓          ↓       ↓
   Field Data → Signal Boost → Pre-process → AI Analysis → Sync → Store
```

### 2. Offline-First Synchronization

```
Local SQLite ←→ Conflict Resolution ←→ Cloud PostgreSQL
     ↓                  ↓                      ↓
   Offline            Merge                 Central
   Storage           Strategy              Database
```

### 3. AI Inference Pipeline

```
Voice Input → Whisper → Text → LLaMA3 → Response → Coqui TTS → Audio Output
     ↓          ↓        ↓       ↓         ↓         ↓          ↓
   Audio      Speech    NLP    AI        Text     Speech     Audio
  Capture      to      Process Inference Generate  Synth    Playback
              Text
```

## 🌐 Network Architecture

### Edge Computing Hub (Raspberry Pi)
- **CPU**: ARM Cortex-A72 (1.5GHz)
- **RAM**: 8GB LPDDR4
- **Storage**: 256GB microSD + 1TB USB SSD
- **Connectivity**: WiFi 6, Ethernet, 4G/5G (optional)
- **IoT**: LoRaWAN, Zigbee, Bluetooth

### Communication Protocols
- **MQTT**: Device-to-cloud messaging
- **LoRaWAN**: Long-range, low-power sensors
- **WebRTC**: Real-time audio/video
- **HTTP/WebSocket**: Web dashboard
- **gRPC**: Microservice communication

## 📊 Database Architecture

### Local Database (SQLite)
```sql
-- Core Tables
CREATE TABLE sensors (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    location TEXT,
    last_reading REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE readings (
    id INTEGER PRIMARY KEY,
    sensor_id INTEGER,
    value REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

CREATE TABLE alerts (
    id INTEGER PRIMARY KEY,
    sensor_id INTEGER,
    type TEXT NOT NULL,
    message TEXT,
    severity INTEGER,
    acknowledged BOOLEAN DEFAULT FALSE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Cloud Database (PostgreSQL)
```sql
-- Partitioned tables for scalability
CREATE TABLE sensor_readings_partitioned (
    id BIGSERIAL PRIMARY KEY,
    farm_id UUID NOT NULL,
    sensor_id UUID NOT NULL,
    reading_type VARCHAR(50) NOT NULL,
    value DECIMAL(10,4),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
) PARTITION BY RANGE (timestamp);

-- Time-series indexing
CREATE INDEX idx_readings_timestamp ON sensor_readings_partitioned (timestamp);
CREATE INDEX idx_readings_farm_sensor ON sensor_readings_partitioned (farm_id, sensor_id);
```

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT**: Stateless authentication
- **OAuth 2.0**: Third-party integration
- **RBAC**: Role-based access control
- **mTLS**: Device authentication

### Data Security
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Key Management**: Hardware Security Module (HSM)
- **Audit Logging**: Comprehensive audit trail
- **Privacy**: GDPR/CCPA compliant

## 🚀 Deployment Architecture

### Edge Deployment (Raspberry Pi)
```yaml
# docker-compose.yml
version: '3.8'
services:
  edge-hub:
    image: soilwise/edge-hub:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./models:/app/models
    environment:
      - NODE_ENV=production
      - OLLAMA_HOST=ollama:11434
    depends_on:
      - ollama
      - mqtt-broker

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ./models:/root/.ollama

  mqtt-broker:
    image: eclipse-mosquitto:latest
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mqtt:/mosquitto/config
```

### Cloud Deployment (Kubernetes)
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: soilwise-api
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
        image: soilwise/api:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## 📈 Scalability Considerations

### Horizontal Scaling
- **Microservices**: Independent scaling of components
- **Load Balancing**: Multiple edge hubs per region
- **Database Sharding**: Partition by farm/geography
- **CDN**: Global content delivery

### Performance Optimization
- **Caching**: Redis for frequently accessed data
- **Message Queuing**: RabbitMQ for async processing
- **Database Optimization**: Read replicas, connection pooling
- **Edge Computing**: Reduce latency with local processing

## 🔧 Monitoring & Observability

### Metrics & Logging
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and alerting
- **ELK Stack**: Centralized logging
- **Jaeger**: Distributed tracing

### Health Monitoring
- **Uptime**: Service availability monitoring
- **Performance**: Response time and throughput
- **Resource Usage**: CPU, memory, storage
- **IoT Health**: Sensor battery and connectivity

This architecture provides a robust, scalable foundation for the SoilWise agriculture SaaS platform, combining edge computing capabilities with cloud infrastructure to deliver real-time insights and AI-powered recommendations to farmers in rural areas.
