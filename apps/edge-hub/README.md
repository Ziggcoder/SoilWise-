# Edge Hub - SoilWise Platform

## 🚀 Overview

The Edge Hub is a Raspberry Pi-based edge computing service that provides local processing capabilities for IoT sensors, AI inference, and data synchronization. It enables the SoilWise platform to operate in remote areas with limited internet connectivity while maintaining full functionality.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Edge Hub (Raspberry Pi)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   IoT Gateway   │  │   Local AI      │  │   Data      │ │
│  │   (LoRaWAN)     │  │   (Ollama)      │  │   Sync      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   MQTT Broker   │  │   Local DB      │  │   Web       │ │
│  │   (Mosquitto)   │  │   (SQLite)      │  │   Server    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Voice         │  │   Camera        │  │   Alert     │ │
│  │   Processing    │  │   Processing    │  │   System    │ │
│  │   (Whisper)     │  │   (OpenCV)      │  │   (Local)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐              ┌──────▼──────┐
        │   LoRaWAN      │              │   Wi-Fi     │
        │   Sensors      │              │   Sensors   │
        │   (Long Range) │              │   (Local)   │
        └────────────────┘              └─────────────┘
```

## 🔧 Technology Stack

### Core Technologies
- **Node.js** - JavaScript runtime for edge computing
- **TypeScript** - Type safety for reliable operation
- **Express** - Web server framework
- **SQLite** - Local database for data persistence
- **MQTT** - IoT messaging protocol
- **Socket.io** - Real-time communication

### Hardware Integration
- **Raspberry Pi 4B+** - Edge computing platform
- **LoRaWAN Gateway** - Long-range sensor communication
- **USB Camera** - Image capture and processing
- **GPIO** - Direct sensor interfacing

### AI/ML Stack
- **Ollama** - Local LLM inference engine
- **Whisper** - Speech recognition
- **OpenCV** - Computer vision processing
- **TensorFlow Lite** - Edge ML inference

### Communication
- **MQTT** - Device-to-device messaging
- **WebSocket** - Real-time web communication
- **HTTP/REST** - API endpoints
- **LoRaWAN** - Long-range sensor communication

## 📁 Project Structure

```
src/
├── server.ts              # Main server entry point
├── config/                # Configuration files
│   ├── database.ts        # Database configuration
│   ├── mqtt.ts           # MQTT broker configuration
│   ├── lorawan.ts        # LoRaWAN gateway setup
│   └── ai.ts             # AI service configuration
├── services/             # Core services
│   ├── sensorService.ts  # Sensor data processing
│   ├── mqttService.ts    # MQTT client and broker
│   ├── aiService.ts      # Local AI inference
│   ├── voiceService.ts   # Voice processing
│   ├── cameraService.ts  # Camera and image processing
│   ├── syncService.ts    # Cloud synchronization
│   └── alertService.ts   # Alert processing
├── controllers/          # API controllers
│   ├── sensorController.ts
│   ├── aiController.ts
│   ├── voiceController.ts
│   └── healthController.ts
├── routes/               # API routes
│   ├── sensors.ts
│   ├── ai.ts
│   ├── voice.ts
│   └── health.ts
├── middleware/           # Express middleware
│   ├── auth.ts
│   ├── validation.ts
│   └── error.ts
├── models/               # Data models
│   ├── sensor.ts
│   ├── reading.ts
│   └── alert.ts
├── utils/                # Utility functions
│   ├── logger.ts
│   ├── gpio.ts
│   ├── system.ts
│   └── crypto.ts
└── types/                # TypeScript types
    ├── sensor.ts
    ├── mqtt.ts
    └── ai.ts
```

## 🚀 Quick Start

### Prerequisites
- Raspberry Pi 4B+ with Raspberry Pi OS
- Node.js 18.0.0 or higher
- Python 3.9+ (for AI services)
- Docker (optional)

### Hardware Setup

1. **Raspberry Pi Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install system dependencies
sudo apt-get install -y python3 python3-pip mosquitto mosquitto-clients
```

2. **Enable hardware interfaces:**
```bash
# Enable I2C, SPI, and Camera
sudo raspi-config nonint do_i2c 0
sudo raspi-config nonint do_spi 0
sudo raspi-config nonint do_camera 0
```

### Software Setup

1. **Navigate to the edge hub directory:**
```bash
cd apps/edge-hub
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

4. **Initialize database:**
```bash
npm run db:init
```

5. **Start the edge hub:**
```bash
npm run dev
```

The edge hub will be available at `http://localhost:3002`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
npm run db:init      # Initialize database
npm run db:migrate   # Run database migrations
npm run ai:setup     # Setup AI models
npm run system:info  # Show system information
```

## 🌐 IoT Sensor Integration

### LoRaWAN Gateway Setup
```typescript
// LoRaWAN gateway configuration
export class LoRaWANService {
  private gateway: LoRaWANGateway;
  private devices: Map<string, LoRaDevice> = new Map();

  constructor(config: LoRaWANConfig) {
    this.gateway = new LoRaWANGateway(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.gateway.on('uplink', (data) => {
      this.handleUplinkMessage(data);
    });

    this.gateway.on('device_join', (device) => {
      this.handleDeviceJoin(device);
    });

    this.gateway.on('error', (error) => {
      logger.error('LoRaWAN error:', error);
    });
  }

  private async handleUplinkMessage(data: LoRaUplinkMessage) {
    try {
      const deviceId = data.deviceEUI;
      const payload = this.decodePayload(data.payload);
      
      // Process sensor data
      await this.processSensorData(deviceId, payload);
      
      // Store in local database
      await this.storeSensorReading(deviceId, payload);
      
      // Publish to MQTT
      await this.publishToMQTT(deviceId, payload);
      
    } catch (error) {
      logger.error('Error processing uplink message:', error);
    }
  }

  private decodePayload(payload: Buffer): SensorReading {
    // Decode based on sensor type
    // Example: Temperature + Humidity sensor
    return {
      temperature: payload.readInt16BE(0) / 100,
      humidity: payload.readUInt16BE(2) / 100,
      battery: payload.readUInt8(4),
      timestamp: new Date()
    };
  }
}
```

### MQTT Broker Integration
```typescript
// MQTT service for local messaging
export class MQTTService {
  private client: mqtt.MqttClient;
  private broker: mqtt.MqttClient;

  constructor(config: MQTTConfig) {
    this.setupBroker(config);
    this.setupClient(config);
  }

  private setupBroker(config: MQTTConfig) {
    // Start local MQTT broker (Mosquitto)
    const brokerOptions = {
      port: config.port,
      host: config.host,
      persistence: true,
      retained: true
    };

    // Configure broker with authentication
    this.configureBrokerAuth(config);
  }

  private setupClient(config: MQTTConfig) {
    this.client = mqtt.connect(`mqtt://${config.host}:${config.port}`, {
      username: config.username,
      password: config.password,
      keepalive: 60,
      clean: true
    });

    this.client.on('connect', () => {
      logger.info('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  private subscribeToTopics() {
    const topics = [
      'sensors/+/data',
      'sensors/+/config',
      'alerts/+',
      'ai/+/request',
      'voice/+/command'
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          logger.info(`Subscribed to ${topic}`);
        }
      });
    });
  }

  async publishSensorData(sensorId: string, data: SensorReading) {
    const topic = `sensors/${sensorId}/data`;
    const payload = JSON.stringify(data);
    
    this.client.publish(topic, payload, { qos: 1, retain: true });
  }

  async publishAlert(alert: Alert) {
    const topic = `alerts/${alert.type}`;
    const payload = JSON.stringify(alert);
    
    this.client.publish(topic, payload, { qos: 2 });
  }
}
```

## 🤖 Local AI Processing

### Ollama Integration
```typescript
// Local LLM service using Ollama
export class AIService {
  private ollama: OllamaClient;
  private models: Map<string, string> = new Map();

  constructor(config: AIConfig) {
    this.ollama = new OllamaClient({
      host: config.ollamaHost,
      port: config.ollamaPort
    });
    
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      // Load agricultural advisory model
      await this.ollama.pull('agricultural-advisor:latest');
      this.models.set('advisory', 'agricultural-advisor:latest');
      
      // Load crop disease detection model
      await this.ollama.pull('crop-disease-detector:latest');
      this.models.set('disease', 'crop-disease-detector:latest');
      
      logger.info('AI models initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI models:', error);
    }
  }

  async generateCropAdvice(sensorData: SensorReading[], context: FarmContext): Promise<string> {
    const prompt = this.buildAdvisoryPrompt(sensorData, context);
    
    try {
      const response = await this.ollama.generate({
        model: this.models.get('advisory'),
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 500
      });
      
      return response.response;
    } catch (error) {
      logger.error('Error generating crop advice:', error);
      return this.getFallbackAdvice(sensorData);
    }
  }

  private buildAdvisoryPrompt(sensorData: SensorReading[], context: FarmContext): string {
    const latestReadings = sensorData.slice(-24); // Last 24 hours
    const avgTemp = latestReadings.reduce((sum, r) => sum + r.temperature, 0) / latestReadings.length;
    const avgHumidity = latestReadings.reduce((sum, r) => sum + r.humidity, 0) / latestReadings.length;
    const avgMoisture = latestReadings.reduce((sum, r) => sum + r.soilMoisture, 0) / latestReadings.length;

    return `
      You are an agricultural advisor AI. Based on the following sensor data and farm context, provide actionable advice for the farmer.

      Farm Context:
      - Crop: ${context.cropType}
      - Growth Stage: ${context.growthStage}
      - Location: ${context.location}
      - Season: ${context.season}

      Recent Sensor Data (24h average):
      - Temperature: ${avgTemp.toFixed(1)}°C
      - Humidity: ${avgHumidity.toFixed(1)}%
      - Soil Moisture: ${avgMoisture.toFixed(1)}%

      Provide specific, actionable advice for:
      1. Irrigation recommendations
      2. Pest/disease risk assessment
      3. Optimal growing conditions
      4. Any immediate actions needed

      Keep the advice concise and practical.
    `;
  }

  async detectCropDisease(imageBuffer: Buffer): Promise<DiseaseDetection> {
    try {
      // Preprocess image
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Run inference
      const result = await this.ollama.generate({
        model: this.models.get('disease'),
        prompt: 'Analyze this crop image for signs of disease or pest damage.',
        images: [processedImage.toString('base64')]
      });
      
      return this.parseDisease Detection(result.response);
    } catch (error) {
      logger.error('Error detecting crop disease:', error);
      return { disease: 'unknown', confidence: 0, recommendations: [] };
    }
  }
}
```

### Voice Processing
```typescript
// Voice processing service
export class VoiceService {
  private whisper: WhisperClient;
  private tts: TTSClient;

  constructor(config: VoiceConfig) {
    this.whisper = new WhisperClient({
      modelPath: config.whisperModelPath,
      language: config.language
    });
    
    this.tts = new TTSClient({
      modelPath: config.ttsModelPath,
      voice: config.voice
    });
  }

  async processVoiceCommand(audioBuffer: Buffer): Promise<VoiceResponse> {
    try {
      // Speech to text
      const transcript = await this.whisper.transcribe(audioBuffer);
      logger.info('Voice command:', transcript);
      
      // Process command
      const response = await this.processCommand(transcript);
      
      // Text to speech
      const audioResponse = await this.tts.synthesize(response.text);
      
      return {
        transcript,
        response: response.text,
        audio: audioResponse,
        action: response.action
      };
    } catch (error) {
      logger.error('Voice processing error:', error);
      return this.getErrorResponse();
    }
  }

  private async processCommand(transcript: string): Promise<CommandResponse> {
    const command = this.parseCommand(transcript.toLowerCase());
    
    switch (command.type) {
      case 'sensor_status':
        return await this.getSensorStatus(command.params);
      
      case 'irrigation_control':
        return await this.controlIrrigation(command.params);
      
      case 'weather_info':
        return await this.getWeatherInfo();
      
      case 'crop_advice':
        return await this.getCropAdvice(command.params);
      
      default:
        return {
          text: 'I didn\'t understand that command. Please try again.',
          action: 'none'
        };
    }
  }

  private parseCommand(transcript: string): VoiceCommand {
    // Simple command parsing - could be enhanced with NLP
    if (transcript.includes('sensor') || transcript.includes('temperature')) {
      return { type: 'sensor_status', params: {} };
    }
    
    if (transcript.includes('irrigation') || transcript.includes('water')) {
      return { type: 'irrigation_control', params: {} };
    }
    
    if (transcript.includes('weather')) {
      return { type: 'weather_info', params: {} };
    }
    
    if (transcript.includes('advice') || transcript.includes('recommendation')) {
      return { type: 'crop_advice', params: {} };
    }
    
    return { type: 'unknown', params: {} };
  }
}
```

## 🗄️ Local Data Management

### SQLite Database
```typescript
// Database service for local data storage
export class DatabaseService {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema() {
    const schema = `
      CREATE TABLE IF NOT EXISTS sensors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        location_lat REAL,
        location_lng REAL,
        status TEXT DEFAULT 'active',
        last_reading DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id TEXT NOT NULL,
        temperature REAL,
        humidity REAL,
        soil_moisture REAL,
        ph REAL,
        nutrients TEXT,
        timestamp DATETIME NOT NULL,
        synced BOOLEAN DEFAULT 0,
        FOREIGN KEY (sensor_id) REFERENCES sensors(id)
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL,
        sensor_id TEXT,
        acknowledged BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sensor_id) REFERENCES sensors(id)
      );

      CREATE TABLE IF NOT EXISTS ai_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query_hash TEXT UNIQUE NOT NULL,
        response TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_readings_sensor_timestamp 
        ON sensor_readings(sensor_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_alerts_created 
        ON alerts(created_at);
    `;

    this.db.exec(schema, (err) => {
      if (err) {
        logger.error('Database schema initialization error:', err);
      } else {
        logger.info('Database initialized successfully');
      }
    });
  }

  async insertSensorReading(reading: SensorReading): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO sensor_readings 
        (sensor_id, temperature, humidity, soil_moisture, ph, nutrients, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        reading.sensorId,
        reading.temperature,
        reading.humidity,
        reading.soilMoisture,
        reading.ph,
        JSON.stringify(reading.nutrients),
        reading.timestamp.toISOString(),
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getSensorReadings(sensorId: string, hours: number = 24): Promise<SensorReading[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM sensor_readings 
        WHERE sensor_id = ? AND timestamp > datetime('now', '-${hours} hours')
        ORDER BY timestamp ASC
      `;

      this.db.all(query, [sensorId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToReading(row)));
        }
      });
    });
  }

  async cacheAIResponse(query: string, response: string, ttlHours: number = 24): Promise<void> {
    const queryHash = crypto.createHash('sha256').update(query).digest('hex');
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO ai_cache (query_hash, response, expires_at)
        VALUES (?, ?, ?)
      `);

      stmt.run(queryHash, response, expiresAt.toISOString(), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
```

## 🔄 Cloud Synchronization

### Sync Service
```typescript
// Cloud synchronization service
export class SyncService {
  private isOnline: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private cloudAPI: CloudAPIClient;

  constructor(config: SyncConfig) {
    this.cloudAPI = new CloudAPIClient(config.cloudEndpoint, config.apiKey);
    this.setupConnectivityMonitoring();
    this.startPeriodicSync();
  }

  private setupConnectivityMonitoring() {
    // Monitor internet connectivity
    setInterval(async () => {
      const wasOnline = this.isOnline;
      this.isOnline = await this.checkConnectivity();
      
      if (!wasOnline && this.isOnline) {
        logger.info('Internet connectivity restored');
        await this.performFullSync();
      } else if (wasOnline && !this.isOnline) {
        logger.info('Internet connectivity lost');
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('https://api.soilwise.com/health', {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(async () => {
      if (this.isOnline) {
        await this.performIncrementalSync();
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes when online
  }

  private async performFullSync(): Promise<void> {
    try {
      logger.info('Starting full synchronization');
      
      // Upload unsynchronized data
      await this.uploadPendingData();
      
      // Download latest configurations
      await this.downloadConfigurations();
      
      // Sync AI model updates
      await this.syncAIModels();
      
      logger.info('Full synchronization completed');
    } catch (error) {
      logger.error('Full sync failed:', error);
    }
  }

  private async uploadPendingData(): Promise<void> {
    // Upload sensor readings
    const unsyncedReadings = await this.db.getUnsyncedReadings();
    for (const reading of unsyncedReadings) {
      try {
        await this.cloudAPI.uploadSensorReading(reading);
        await this.db.markReadingAsSynced(reading.id);
      } catch (error) {
        logger.error('Failed to upload reading:', error);
      }
    }

    // Upload alerts
    const unsyncedAlerts = await this.db.getUnsyncedAlerts();
    for (const alert of unsyncedAlerts) {
      try {
        await this.cloudAPI.uploadAlert(alert);
        await this.db.markAlertAsSynced(alert.id);
      } catch (error) {
        logger.error('Failed to upload alert:', error);
      }
    }
  }

  private async downloadConfigurations(): Promise<void> {
    try {
      const config = await this.cloudAPI.getEdgeConfiguration();
      await this.applyConfiguration(config);
    } catch (error) {
      logger.error('Failed to download configurations:', error);
    }
  }
}
```

## 🚨 Alert System

### Alert Processing
```typescript
// Alert processing service
export class AlertService {
  private rules: AlertRule[] = [];
  private subscribers: AlertSubscriber[] = [];

  constructor(private db: DatabaseService, private mqtt: MQTTService) {
    this.loadAlertRules();
  }

  private loadAlertRules() {
    this.rules = [
      {
        id: 'high_temperature',
        condition: (reading: SensorReading) => reading.temperature > 35,
        message: 'High temperature detected',
        severity: 'warning',
        cooldown: 30 * 60 * 1000 // 30 minutes
      },
      {
        id: 'low_soil_moisture',
        condition: (reading: SensorReading) => reading.soilMoisture < 20,
        message: 'Low soil moisture - irrigation needed',
        severity: 'critical',
        cooldown: 60 * 60 * 1000 // 1 hour
      },
      {
        id: 'sensor_offline',
        condition: (reading: SensorReading) => 
          Date.now() - reading.timestamp.getTime() > 30 * 60 * 1000,
        message: 'Sensor offline for more than 30 minutes',
        severity: 'warning',
        cooldown: 60 * 60 * 1000 // 1 hour
      }
    ];
  }

  async processSensorReading(reading: SensorReading): Promise<void> {
    for (const rule of this.rules) {
      if (rule.condition(reading)) {
        await this.triggerAlert(rule, reading);
      }
    }
  }

  private async triggerAlert(rule: AlertRule, reading: SensorReading): Promise<void> {
    // Check cooldown
    const lastAlert = await this.db.getLastAlert(rule.id, reading.sensorId);
    if (lastAlert && Date.now() - lastAlert.createdAt.getTime() < rule.cooldown) {
      return; // Still in cooldown period
    }

    // Create alert
    const alert: Alert = {
      id: `${rule.id}_${reading.sensorId}_${Date.now()}`,
      type: rule.id,
      message: rule.message,
      severity: rule.severity,
      sensorId: reading.sensorId,
      sensorReading: reading,
      acknowledged: false,
      createdAt: new Date()
    };

    // Store alert
    await this.db.insertAlert(alert);

    // Notify subscribers
    await this.notifySubscribers(alert);

    // Publish to MQTT
    await this.mqtt.publishAlert(alert);

    logger.info(`Alert triggered: ${alert.message} for sensor ${alert.sensorId}`);
  }

  private async notifySubscribers(alert: Alert): Promise<void> {
    for (const subscriber of this.subscribers) {
      try {
        await subscriber.notify(alert);
      } catch (error) {
        logger.error('Failed to notify subscriber:', error);
      }
    }
  }

  addSubscriber(subscriber: AlertSubscriber): void {
    this.subscribers.push(subscriber);
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.db.acknowledgeAlert(alertId);
  }
}
```

## 📷 Camera Processing

### Camera Service
```typescript
// Camera service for image capture and processing
export class CameraService {
  private camera: any; // Camera interface
  private opencv: any; // OpenCV for image processing

  constructor(config: CameraConfig) {
    this.setupCamera(config);
    this.opencv = require('opencv4nodejs');
  }

  private setupCamera(config: CameraConfig) {
    // Initialize camera based on type (USB, CSI, etc.)
    if (config.type === 'usb') {
      this.camera = new USBCamera(config.devicePath);
    } else if (config.type === 'csi') {
      this.camera = new CSICamera(config.width, config.height);
    }
  }

  async captureImage(): Promise<Buffer> {
    try {
      const imageBuffer = await this.camera.capture();
      return imageBuffer;
    } catch (error) {
      logger.error('Camera capture error:', error);
      throw error;
    }
  }

  async processPlantImage(imageBuffer: Buffer): Promise<PlantAnalysis> {
    try {
      // Load image
      const image = this.opencv.imdecode(imageBuffer);
      
      // Preprocessing
      const processedImage = this.preprocessImage(image);
      
      // Plant detection
      const plantMask = this.detectPlant(processedImage);
      
      // Health analysis
      const healthAnalysis = this.analyzeHealth(processedImage, plantMask);
      
      // Disease detection
      const diseaseAnalysis = await this.detectDisease(imageBuffer);
      
      return {
        plantArea: this.calculatePlantArea(plantMask),
        healthScore: healthAnalysis.score,
        diseases: diseaseAnalysis.diseases,
        recommendations: this.generateRecommendations(healthAnalysis, diseaseAnalysis)
      };
    } catch (error) {
      logger.error('Image processing error:', error);
      throw error;
    }
  }

  private preprocessImage(image: any): any {
    // Resize image for consistent processing
    const resized = image.resize(640, 480);
    
    // Apply Gaussian blur to reduce noise
    const blurred = resized.gaussianBlur(new this.opencv.Size(5, 5), 0);
    
    // Convert to HSV for better color analysis
    const hsv = blurred.cvtColor(this.opencv.COLOR_BGR2HSV);
    
    return hsv;
  }

  private detectPlant(image: any): any {
    // Define green color range for plant detection
    const lowerGreen = new this.opencv.Vec3(35, 50, 50);
    const upperGreen = new this.opencv.Vec3(85, 255, 255);
    
    // Create mask for green areas
    const mask = image.inRange(lowerGreen, upperGreen);
    
    // Apply morphological operations to clean up mask
    const kernel = this.opencv.getStructuringElement(
      this.opencv.MORPH_ELLIPSE, 
      new this.opencv.Size(5, 5)
    );
    
    const cleaned = mask.morphologyEx(this.opencv.MORPH_CLOSE, kernel);
    
    return cleaned;
  }

  private analyzeHealth(image: any, plantMask: any): HealthAnalysis {
    // Extract plant pixels
    const plantPixels = image.copyTo(new this.opencv.Mat(), plantMask);
    
    // Calculate color statistics
    const meanColor = plantPixels.mean(plantMask);
    
    // Analyze color distribution
    const hue = meanColor[0];
    const saturation = meanColor[1];
    const value = meanColor[2];
    
    // Health score based on color characteristics
    let healthScore = 100;
    
    // Reduce score for yellowing (high hue)
    if (hue > 60) healthScore -= (hue - 60) * 2;
    
    // Reduce score for low saturation (pale color)
    if (saturation < 100) healthScore -= (100 - saturation) * 0.5;
    
    // Reduce score for low brightness (dark areas)
    if (value < 100) healthScore -= (100 - value) * 0.3;
    
    return {
      score: Math.max(0, Math.min(100, healthScore)),
      colorStats: { hue, saturation, value },
      issues: this.identifyIssues(hue, saturation, value)
    };
  }
}
```

## 🔧 System Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3002
NODE_ENV=production
LOG_LEVEL=info

# Database
DB_PATH=./data/edge.db

# MQTT
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_USERNAME=edge_user
MQTT_PASSWORD=edge_password

# LoRaWAN
LORAWAN_GATEWAY_ID=edge-gateway-001
LORAWAN_NETWORK_SERVER=ttn.community
LORAWAN_FREQUENCY_PLAN=EU868

# AI Services
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
WHISPER_MODEL_PATH=./models/whisper-base.bin
TTS_MODEL_PATH=./models/tts-model.bin

# Camera
CAMERA_TYPE=usb
CAMERA_DEVICE_PATH=/dev/video0
CAMERA_WIDTH=1280
CAMERA_HEIGHT=720

# Cloud Sync
CLOUD_ENDPOINT=https://api.soilwise.com
CLOUD_API_KEY=your-api-key
SYNC_INTERVAL=300000

# Hardware
GPIO_ENABLED=true
I2C_ENABLED=true
SPI_ENABLED=true
```

### System Setup Script
```bash
#!/bin/bash
# setup-edge-hub.sh

echo "Setting up SoilWise Edge Hub..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    nodejs npm \
    python3 python3-pip \
    mosquitto mosquitto-clients \
    sqlite3 \
    i2c-tools \
    python3-opencv \
    ffmpeg

# Install Python dependencies
pip3 install \
    ollama \
    whisper \
    opencv-python \
    numpy \
    scipy

# Setup hardware interfaces
sudo raspi-config nonint do_i2c 0
sudo raspi-config nonint do_spi 0
sudo raspi-config nonint do_camera 0

# Create directories
mkdir -p /opt/soilwise/data
mkdir -p /opt/soilwise/models
mkdir -p /opt/soilwise/logs

# Set permissions
sudo chown -R pi:pi /opt/soilwise

# Install Node.js dependencies
cd /opt/soilwise
npm install

# Setup systemd service
sudo cp edge-hub.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable edge-hub.service

# Start MQTT broker
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

echo "Edge Hub setup completed!"
```

## 🚀 Performance Optimization

### Resource Management
```typescript
// Resource monitoring and optimization
export class ResourceManager {
  private cpuUsage: number = 0;
  private memoryUsage: number = 0;
  private temperatureThreshold = 80; // °C

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    setInterval(() => {
      this.updateSystemStats();
      this.checkResourceLimits();
    }, 30000); // Check every 30 seconds
  }

  private updateSystemStats() {
    // CPU usage
    this.cpuUsage = this.getCPUUsage();
    
    // Memory usage
    this.memoryUsage = this.getMemoryUsage();
    
    // System temperature
    const temperature = this.getSystemTemperature();
    
    logger.debug(`System stats - CPU: ${this.cpuUsage}%, Memory: ${this.memoryUsage}%, Temp: ${temperature}°C`);
  }

  private getCPUUsage(): number {
    const cpuInfo = fs.readFileSync('/proc/loadavg', 'utf8');
    const loadAvg = parseFloat(cpuInfo.split(' ')[0]);
    return Math.min(100, loadAvg * 100);
  }

  private getMemoryUsage(): number {
    const memInfo = fs.readFileSync('/proc/meminfo', 'utf8');
    const lines = memInfo.split('\n');
    
    const totalMem = parseInt(lines[0].split(/\s+/)[1]);
    const availMem = parseInt(lines[2].split(/\s+/)[1]);
    
    return ((totalMem - availMem) / totalMem) * 100;
  }

  private getSystemTemperature(): number {
    try {
      const temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
      return parseInt(temp) / 1000; // Convert from millidegrees
    } catch {
      return 0;
    }
  }

  private checkResourceLimits() {
    // Throttle AI processing if CPU is high
    if (this.cpuUsage > 80) {
      this.throttleAIProcessing();
    }
    
    // Reduce cache size if memory is high
    if (this.memoryUsage > 90) {
      this.clearCaches();
    }
    
    // Reduce processing if temperature is high
    const temperature = this.getSystemTemperature();
    if (temperature > this.temperatureThreshold) {
      this.reduceProcessing();
    }
  }

  private throttleAIProcessing() {
    // Implement AI processing throttling
    logger.warn('High CPU usage detected - throttling AI processing');
  }

  private clearCaches() {
    // Clear application caches
    logger.warn('High memory usage detected - clearing caches');
  }

  private reduceProcessing() {
    // Reduce processing load to prevent overheating
    logger.warn('High temperature detected - reducing processing load');
  }
}
```

## 🧪 Testing

### Hardware Testing
```typescript
// Hardware integration tests
describe('Hardware Integration', () => {
  it('should read sensor data from GPIO', async () => {
    const sensor = new GPIO_Sensor(18);
    const reading = await sensor.read();
    expect(reading).toBeDefined();
    expect(reading.value).toBeGreaterThan(0);
  });

  it('should capture image from camera', async () => {
    const camera = new CameraService({ type: 'usb', devicePath: '/dev/video0' });
    const image = await camera.captureImage();
    expect(image).toBeInstanceOf(Buffer);
    expect(image.length).toBeGreaterThan(0);
  });

  it('should process MQTT messages', async () => {
    const mqtt = new MQTTService({ host: 'localhost', port: 1883 });
    const message = { sensorId: 'test', temperature: 25.5 };
    
    await mqtt.publishSensorData('test', message);
    
    // Verify message was processed
    const stored = await db.getLatestReading('test');
    expect(stored.temperature).toBe(25.5);
  });
});
```

### Performance Testing
```typescript
// Performance benchmarks
describe('Performance Tests', () => {
  it('should process sensor data within time limits', async () => {
    const start = Date.now();
    
    await sensorService.processBatchReading(generateTestData(1000));
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should handle AI inference efficiently', async () => {
    const aiService = new AIService(config);
    const sensorData = generateTestSensorData();
    
    const start = Date.now();
    const advice = await aiService.generateCropAdvice(sensorData, farmContext);
    const duration = Date.now() - start;
    
    expect(advice).toBeDefined();
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
  });
});
```

## 🔒 Security

### Device Security
```typescript
// Security service for edge device
export class SecurityService {
  private certificateStore: Map<string, Buffer> = new Map();
  private encryptionKey: Buffer;

  constructor(config: SecurityConfig) {
    this.loadCertificates(config.certificatePath);
    this.encryptionKey = this.generateEncryptionKey(config.keyPath);
  }

  encryptSensitiveData(data: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptSensitiveData(encryptedData: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  validateDeviceCertificate(deviceId: string, certificate: Buffer): boolean {
    const storedCert = this.certificateStore.get(deviceId);
    return storedCert && storedCert.equals(certificate);
  }

  generateDeviceToken(deviceId: string): string {
    const payload = {
      deviceId,
      timestamp: Date.now(),
      permissions: ['sensor_read', 'sensor_write']
    };
    
    return jwt.sign(payload, this.encryptionKey, { expiresIn: '24h' });
  }
}
```

## 🤝 Contributing

1. Follow the main project's [Contributing Guidelines](../../CONTRIBUTING.md)
2. Test on actual Raspberry Pi hardware when possible
3. Consider resource constraints in implementations
4. Add comprehensive error handling for hardware failures
5. Document hardware setup requirements

## 📚 Additional Resources

- [Raspberry Pi Documentation](https://www.raspberrypi.org/documentation/)
- [LoRaWAN Specification](https://www.lora-alliance.org/resource-hub/lorawantm-specification-v104)
- [MQTT Protocol](https://mqtt.org/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Main Project Documentation](../../docs/README.md)
