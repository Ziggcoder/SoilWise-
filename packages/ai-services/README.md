# AI Services Package - SoilWise Platform

## 🚀 Overview

The AI Services package provides artificial intelligence and machine learning capabilities for the SoilWise platform. It includes crop advisory systems, predictive analytics, disease detection, and natural language processing for agricultural decision-making.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  AI Services Package                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Crop Advisory │  │   Disease       │  │   Weather   │ │
│  │   Engine        │  │   Detection     │  │   Prediction│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   LLM           │  │   Vector        │  │   Image     │ │
│  │   Integration   │  │   Database      │  │   Analysis  │ │
│  │   (LangChain)   │  │   (ChromaDB)    │  │   (OpenCV)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   ML Pipeline   │  │   Model         │  │   Data      │ │
│  │   (Training)    │  │   Inference     │  │   Processing│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### AI/ML Core
- **LangChain** - AI agent framework and workflow orchestration
- **Ollama** - Local LLM inference engine
- **ChromaDB** - Vector database for embeddings
- **Hugging Face Transformers** - Pre-trained model integration
- **scikit-learn** - Traditional ML algorithms
- **TensorFlow Lite** - Edge AI inference

### Data Processing
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **OpenCV** - Computer vision and image processing
- **Pillow** - Image processing library
- **Matplotlib** - Data visualization

### Agriculture-Specific
- **AgML** - Agricultural machine learning models
- **PlantNet** - Plant identification APIs
- **Weather APIs** - Meteorological data integration
- **Soil Science Libraries** - Soil analysis algorithms

## 📁 Project Structure

```
src/
├── services/             # Core AI services
│   ├── advisoryService.ts   # Crop advisory engine
│   ├── diseaseService.ts    # Disease detection
│   ├── weatherService.ts    # Weather prediction
│   ├── yieldService.ts      # Yield prediction
│   └── nlpService.ts        # Natural language processing
├── models/               # ML models and schemas
│   ├── cropModel.ts         # Crop growth models
│   ├── diseaseModel.ts      # Disease detection models
│   ├── weatherModel.ts      # Weather prediction models
│   └── yieldModel.ts        # Yield prediction models
├── agents/               # LangChain agents
│   ├── farmAdvisor.ts       # Farm advisory agent
│   ├── cropExpert.ts        # Crop specialist agent
│   ├── pestExpert.ts        # Pest management agent
│   └── weatherAgent.ts      # Weather analysis agent
├── pipelines/            # ML pipelines
│   ├── training.ts          # Model training pipeline
│   ├── inference.ts         # Model inference pipeline
│   ├── preprocessing.ts     # Data preprocessing
│   └── evaluation.ts        # Model evaluation
├── utils/                # Utility functions
│   ├── dataProcessing.ts    # Data processing utilities
│   ├── imageProcessing.ts   # Image processing utilities
│   ├── vectorUtils.ts       # Vector database utilities
│   └── modelUtils.ts        # Model management utilities
├── config/               # Configuration files
│   ├── models.ts            # Model configurations
│   ├── agents.ts            # Agent configurations
│   └── database.ts          # Database configurations
├── types/                # TypeScript types
│   ├── models.ts            # Model types
│   ├── agents.ts            # Agent types
│   └── api.ts               # API types
└── server.ts             # AI services server
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- Python 3.9+ (for ML models)
- Docker (for containerized deployment)

### Installation

1. **Navigate to the AI services directory:**
```bash
cd packages/ai-services
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

4. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize models and database:**
```bash
npm run setup:models
npm run setup:vectordb
```

6. **Start the AI services:**
```bash
npm run dev
```

The AI services will be available at `http://localhost:8082`

### Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Build TypeScript
npm run start           # Start production server
npm run test            # Run tests
npm run lint            # Lint code
npm run setup:models    # Download and setup ML models
npm run setup:vectordb  # Initialize vector database
npm run train:models    # Train custom models
npm run evaluate:models # Evaluate model performance
```

## 🌱 Crop Advisory Engine

### Advisory Service
```typescript
// Crop advisory service with LangChain integration
export class CropAdvisoryService {
  private llm: Ollama;
  private vectorStore: ChromaDB;
  private advisoryChain: LLMChain;

  constructor(config: AIConfig) {
    this.llm = new Ollama({
      baseUrl: config.ollamaUrl,
      model: config.advisoryModel
    });
    
    this.vectorStore = new ChromaDB({
      url: config.chromaUrl,
      collectionName: 'agricultural_knowledge'
    });
    
    this.setupAdvisoryChain();
  }

  private setupAdvisoryChain() {
    const advisoryTemplate = `
      You are an expert agricultural advisor. Based on the following information, provide specific, actionable advice for the farmer.

      Current Conditions:
      - Crop: {cropType}
      - Growth Stage: {growthStage}
      - Soil Type: {soilType}
      - Recent Weather: {weatherSummary}

      Sensor Data (Last 24 hours):
      - Temperature: {avgTemperature}°C
      - Humidity: {avgHumidity}%
      - Soil Moisture: {avgSoilMoisture}%
      - Soil pH: {soilPH}
      - Nutrients: {nutrients}

      Historical Context:
      {historicalContext}

      Relevant Knowledge:
      {relevantKnowledge}

      Provide advice on:
      1. Irrigation recommendations
      2. Fertilization needs
      3. Pest/disease risk assessment
      4. Optimal timing for next actions
      5. Any immediate concerns

      Make your advice specific, actionable, and consider the current season and local conditions.
    `;

    this.advisoryChain = new LLMChain({
      llm: this.llm,
      prompt: new PromptTemplate({
        template: advisoryTemplate,
        inputVariables: [
          'cropType', 'growthStage', 'soilType', 'weatherSummary',
          'avgTemperature', 'avgHumidity', 'avgSoilMoisture', 'soilPH',
          'nutrients', 'historicalContext', 'relevantKnowledge'
        ]
      })
    });
  }

  async generateAdvice(request: AdvisoryRequest): Promise<AdvisoryResponse> {
    try {
      // Gather contextual information
      const context = await this.gatherContext(request);
      
      // Retrieve relevant knowledge from vector store
      const relevantKnowledge = await this.retrieveRelevantKnowledge(request);
      
      // Generate advice using LLM
      const advice = await this.advisoryChain.call({
        ...context,
        relevantKnowledge
      });

      // Post-process and structure the response
      return this.structureAdvice(advice.text, request);
    } catch (error) {
      logger.error('Error generating crop advice:', error);
      throw new Error('Failed to generate crop advice');
    }
  }

  private async gatherContext(request: AdvisoryRequest): Promise<AdvisoryContext> {
    const sensorData = await this.aggregateSensorData(request.farmId);
    const weatherData = await this.getWeatherData(request.location);
    const historicalData = await this.getHistoricalData(request.farmId);

    return {
      cropType: request.cropType,
      growthStage: request.growthStage,
      soilType: request.soilType,
      weatherSummary: this.summarizeWeather(weatherData),
      avgTemperature: sensorData.avgTemperature,
      avgHumidity: sensorData.avgHumidity,
      avgSoilMoisture: sensorData.avgSoilMoisture,
      soilPH: sensorData.soilPH,
      nutrients: JSON.stringify(sensorData.nutrients),
      historicalContext: this.summarizeHistory(historicalData)
    };
  }

  private async retrieveRelevantKnowledge(request: AdvisoryRequest): Promise<string> {
    const query = `${request.cropType} ${request.growthStage} ${request.soilType} farming advice`;
    
    const results = await this.vectorStore.similaritySearch(query, 5);
    
    return results.map(doc => doc.pageContent).join('\n\n');
  }

  private structureAdvice(rawAdvice: string, request: AdvisoryRequest): AdvisoryResponse {
    // Parse and structure the LLM response
    const sections = this.parseAdviceSections(rawAdvice);
    
    return {
      id: generateId(),
      farmId: request.farmId,
      cropType: request.cropType,
      timestamp: new Date(),
      irrigation: sections.irrigation,
      fertilization: sections.fertilization,
      pestDisease: sections.pestDisease,
      timing: sections.timing,
      concerns: sections.concerns,
      confidence: this.calculateConfidence(sections),
      sources: ['LLM Analysis', 'Historical Data', 'Sensor Data'],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }
}
```

## 🦠 Disease Detection Service

### Disease Detection
```typescript
// Disease detection using computer vision and ML
export class DiseaseDetectionService {
  private diseaseModel: any;
  private cv: any;
  private vectorStore: ChromaDB;

  constructor(config: AIConfig) {
    this.cv = require('opencv4nodejs');
    this.loadDiseaseModel(config.diseaseModelPath);
    this.vectorStore = new ChromaDB({
      url: config.chromaUrl,
      collectionName: 'disease_knowledge'
    });
  }

  private async loadDiseaseModel(modelPath: string) {
    // Load TensorFlow Lite model for disease detection
    this.diseaseModel = await tf.loadLayersModel(modelPath);
  }

  async detectDiseases(imageBuffer: Buffer, cropType: string): Promise<DiseaseDetection> {
    try {
      // Preprocess image
      const preprocessedImage = await this.preprocessImage(imageBuffer);
      
      // Run disease detection model
      const predictions = await this.runDiseaseModel(preprocessedImage);
      
      // Post-process predictions
      const detections = this.postProcessPredictions(predictions, cropType);
      
      // Get treatment recommendations
      const recommendations = await this.getTreatmentRecommendations(detections);
      
      return {
        detections,
        recommendations,
        confidence: this.calculateOverallConfidence(detections),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Disease detection error:', error);
      throw new Error('Failed to detect diseases');
    }
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<tf.Tensor> {
    // Decode image
    const image = this.cv.imdecode(imageBuffer);
    
    // Resize to model input size
    const resized = image.resize(224, 224);
    
    // Convert to RGB
    const rgb = resized.cvtColor(this.cv.COLOR_BGR2RGB);
    
    // Normalize pixel values
    const normalized = rgb.convertTo(this.cv.CV_32F, 1.0 / 255.0);
    
    // Convert to tensor
    const tensor = tf.tensor(normalized.getData(), [1, 224, 224, 3]);
    
    return tensor;
  }

  private async runDiseaseModel(image: tf.Tensor): Promise<tf.Tensor> {
    const predictions = await this.diseaseModel.predict(image);
    return predictions;
  }

  private postProcessPredictions(predictions: tf.Tensor, cropType: string): DiseaseDetection[] {
    const probabilities = predictions.dataSync();
    const detections: DiseaseDetection[] = [];
    
    // Get disease class mappings for crop type
    const classMapping = this.getDiseaseClassMapping(cropType);
    
    // Extract top predictions
    const topPredictions = this.getTopPredictions(probabilities, 5);
    
    for (const prediction of topPredictions) {
      if (prediction.confidence > 0.3) { // Threshold for detection
        detections.push({
          disease: classMapping[prediction.classId],
          confidence: prediction.confidence,
          severity: this.calculateSeverity(prediction.confidence),
          affectedArea: this.estimateAffectedArea(prediction),
          stage: this.determineStage(prediction)
        });
      }
    }
    
    return detections;
  }

  private async getTreatmentRecommendations(detections: DiseaseDetection[]): Promise<TreatmentRecommendation[]> {
    const recommendations: TreatmentRecommendation[] = [];
    
    for (const detection of detections) {
      // Query vector store for treatment information
      const query = `${detection.disease} treatment prevention control`;
      const results = await this.vectorStore.similaritySearch(query, 3);
      
      // Generate structured recommendations
      const treatment = this.generateTreatmentPlan(detection, results);
      recommendations.push(treatment);
    }
    
    return recommendations;
  }

  private generateTreatmentPlan(detection: DiseaseDetection, knowledgeBase: any[]): TreatmentRecommendation {
    return {
      disease: detection.disease,
      urgency: this.calculateUrgency(detection),
      treatments: [
        {
          type: 'chemical',
          products: this.recommendChemicalTreatments(detection, knowledgeBase),
          timing: this.getOptimalTiming(detection),
          dosage: this.calculateDosage(detection)
        },
        {
          type: 'biological',
          products: this.recommendBiologicalTreatments(detection, knowledgeBase),
          timing: this.getOptimalTiming(detection),
          application: this.getBiologicalApplication(detection)
        },
        {
          type: 'cultural',
          practices: this.recommendCulturalPractices(detection, knowledgeBase),
          timeline: this.getCulturalTimeline(detection)
        }
      ],
      prevention: this.getPreventionMeasures(detection, knowledgeBase),
      monitoring: this.getMonitoringPlan(detection)
    };
  }
}
```

## 🌤️ Weather Prediction Service

### Weather Analysis
```typescript
// Weather prediction and analysis service
export class WeatherService {
  private weatherModel: any;
  private apiClients: Map<string, any> = new Map();

  constructor(config: WeatherConfig) {
    this.setupWeatherAPIs(config);
    this.loadWeatherModel(config.modelPath);
  }

  private setupWeatherAPIs(config: WeatherConfig) {
    // Setup multiple weather data sources
    this.apiClients.set('openweather', new OpenWeatherAPI(config.openWeatherKey));
    this.apiClients.set('weatherapi', new WeatherAPI(config.weatherApiKey));
    this.apiClients.set('darksky', new DarkSkyAPI(config.darkSkyKey));
  }

  async getWeatherPrediction(location: Coordinates, days: number = 7): Promise<WeatherPrediction> {
    try {
      // Gather data from multiple sources
      const weatherData = await this.aggregateWeatherData(location, days);
      
      // Run custom prediction model
      const customPrediction = await this.runCustomModel(weatherData);
      
      // Combine predictions
      const prediction = this.combineAndValidatePredictions(weatherData, customPrediction);
      
      return {
        location,
        days,
        forecast: prediction.forecast,
        confidence: prediction.confidence,
        risks: await this.assessAgricultureRisks(prediction),
        recommendations: await this.generateWeatherRecommendations(prediction),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Weather prediction error:', error);
      throw new Error('Failed to get weather prediction');
    }
  }

  private async aggregateWeatherData(location: Coordinates, days: number): Promise<WeatherData> {
    const promises = Array.from(this.apiClients.entries()).map(([source, client]) =>
      client.getForecast(location, days).catch(error => {
        logger.warn(`Weather API ${source} failed:`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    const validResults = results.filter(result => result !== null);

    if (validResults.length === 0) {
      throw new Error('No weather data available');
    }

    return this.mergeWeatherData(validResults);
  }

  private async runCustomModel(weatherData: WeatherData): Promise<CustomPrediction> {
    // Use ML model to refine predictions based on local conditions
    const features = this.extractFeatures(weatherData);
    const prediction = await this.weatherModel.predict(features);
    
    return {
      temperature: prediction.temperature,
      precipitation: prediction.precipitation,
      humidity: prediction.humidity,
      windSpeed: prediction.windSpeed,
      pressure: prediction.pressure,
      confidence: prediction.confidence
    };
  }

  private async assessAgricultureRisks(prediction: WeatherPrediction): Promise<WeatherRisk[]> {
    const risks: WeatherRisk[] = [];

    // Check for various agricultural risks
    if (prediction.forecast.some(day => day.precipitation > 50)) {
      risks.push({
        type: 'heavy_rain',
        probability: this.calculateRainRisk(prediction),
        impact: 'high',
        description: 'Heavy rainfall may cause flooding and soil erosion',
        recommendations: ['Improve drainage', 'Delay planting', 'Protect crops']
      });
    }

    if (prediction.forecast.some(day => day.temperature > 35)) {
      risks.push({
        type: 'heat_stress',
        probability: this.calculateHeatRisk(prediction),
        impact: 'medium',
        description: 'High temperatures may stress crops',
        recommendations: ['Increase irrigation', 'Provide shade', 'Adjust planting schedule']
      });
    }

    if (prediction.forecast.some(day => day.temperature < 5)) {
      risks.push({
        type: 'frost',
        probability: this.calculateFrostRisk(prediction),
        impact: 'high',
        description: 'Frost may damage sensitive crops',
        recommendations: ['Use frost protection', 'Harvest early', 'Cover crops']
      });
    }

    return risks;
  }

  private async generateWeatherRecommendations(prediction: WeatherPrediction): Promise<WeatherRecommendation[]> {
    const recommendations: WeatherRecommendation[] = [];

    // Irrigation recommendations
    const irrigationAdvice = this.generateIrrigationAdvice(prediction);
    if (irrigationAdvice) {
      recommendations.push(irrigationAdvice);
    }

    // Planting recommendations
    const plantingAdvice = this.generatePlantingAdvice(prediction);
    if (plantingAdvice) {
      recommendations.push(plantingAdvice);
    }

    // Spraying recommendations
    const sprayingAdvice = this.generateSprayingAdvice(prediction);
    if (sprayingAdvice) {
      recommendations.push(sprayingAdvice);
    }

    // Harvesting recommendations
    const harvestingAdvice = this.generateHarvestingAdvice(prediction);
    if (harvestingAdvice) {
      recommendations.push(harvestingAdvice);
    }

    return recommendations;
  }

  private generateIrrigationAdvice(prediction: WeatherPrediction): WeatherRecommendation | null {
    const totalRainfall = prediction.forecast.reduce((sum, day) => sum + day.precipitation, 0);
    const avgTemperature = prediction.forecast.reduce((sum, day) => sum + day.temperature, 0) / prediction.forecast.length;

    if (totalRainfall < 10 && avgTemperature > 25) {
      return {
        type: 'irrigation',
        priority: 'high',
        description: 'Low rainfall and high temperatures predicted',
        action: 'Increase irrigation frequency',
        timing: 'Next 2-3 days',
        duration: '7 days'
      };
    }

    if (totalRainfall > 50) {
      return {
        type: 'irrigation',
        priority: 'low',
        description: 'Heavy rainfall predicted',
        action: 'Reduce or stop irrigation',
        timing: 'Before rain starts',
        duration: '3-5 days'
      };
    }

    return null;
  }
}
```

## 📊 Yield Prediction Service

### Yield Prediction
```typescript
// Yield prediction using ML models
export class YieldPredictionService {
  private yieldModel: any;
  private featureExtractor: FeatureExtractor;

  constructor(config: AIConfig) {
    this.loadYieldModel(config.yieldModelPath);
    this.featureExtractor = new FeatureExtractor();
  }

  async predictYield(request: YieldPredictionRequest): Promise<YieldPrediction> {
    try {
      // Extract features from various data sources
      const features = await this.extractFeatures(request);
      
      // Run yield prediction model
      const prediction = await this.yieldModel.predict(features);
      
      // Post-process and validate prediction
      const processedPrediction = this.postProcessPrediction(prediction, request);
      
      return {
        farmId: request.farmId,
        cropType: request.cropType,
        plantingDate: request.plantingDate,
        expectedHarvestDate: this.calculateHarvestDate(request),
        predictedYield: processedPrediction.yield,
        yieldRange: processedPrediction.range,
        confidence: processedPrediction.confidence,
        factors: this.identifyKeyFactors(features, prediction),
        recommendations: await this.generateYieldRecommendations(processedPrediction),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Yield prediction error:', error);
      throw new Error('Failed to predict yield');
    }
  }

  private async extractFeatures(request: YieldPredictionRequest): Promise<YieldFeatures> {
    return {
      // Environmental features
      climate: await this.extractClimateFeatures(request.location),
      soil: await this.extractSoilFeatures(request.farmId),
      weather: await this.extractWeatherFeatures(request.location, request.plantingDate),
      
      // Crop features
      variety: this.extractVarietyFeatures(request.cropType, request.variety),
      plantingDensity: request.plantingDensity,
      plantingDate: this.encodePlantingDate(request.plantingDate),
      
      // Management features
      irrigation: await this.extractIrrigationFeatures(request.farmId),
      fertilization: await this.extractFertilizationFeatures(request.farmId),
      pestControl: await this.extractPestControlFeatures(request.farmId),
      
      // Historical features
      historical: await this.extractHistoricalFeatures(request.farmId, request.cropType),
      
      // Satellite/Remote sensing features
      vegetation: await this.extractVegetationIndices(request.location),
      
      // Economic features
      market: await this.extractMarketFeatures(request.cropType, request.location)
    };
  }

  private async generateYieldRecommendations(prediction: YieldPrediction): Promise<YieldRecommendation[]> {
    const recommendations: YieldRecommendation[] = [];

    // Analyze prediction confidence
    if (prediction.confidence < 0.7) {
      recommendations.push({
        type: 'data_collection',
        priority: 'high',
        description: 'Prediction confidence is low',
        action: 'Collect more field data and monitor crop conditions closely',
        expectedImprovement: 'Increase prediction accuracy by 15-20%'
      });
    }

    // Analyze yield potential
    if (prediction.predictedYield < prediction.yieldRange.potential * 0.8) {
      recommendations.push({
        type: 'yield_optimization',
        priority: 'medium',
        description: 'Yield is below potential',
        action: 'Optimize fertilization and irrigation practices',
        expectedImprovement: `Increase yield by ${(prediction.yieldRange.potential - prediction.predictedYield).toFixed(1)} tons/ha`
      });
    }

    // Factor-based recommendations
    const limitingFactors = this.identifyLimitingFactors(prediction.factors);
    for (const factor of limitingFactors) {
      recommendations.push(this.generateFactorRecommendation(factor));
    }

    return recommendations;
  }

  private identifyKeyFactors(features: YieldFeatures, prediction: any): YieldFactor[] {
    // Use SHAP values or similar to identify key factors
    const factors: YieldFactor[] = [];

    // Mock implementation - in real scenario, use model interpretability
    factors.push({
      name: 'Soil Fertility',
      impact: 0.25,
      value: features.soil.fertility,
      optimal: 0.8,
      description: 'Soil nutrient levels significantly affect yield'
    });

    factors.push({
      name: 'Water Availability',
      impact: 0.20,
      value: features.irrigation.efficiency,
      optimal: 0.9,
      description: 'Water stress during critical growth periods'
    });

    factors.push({
      name: 'Temperature',
      impact: 0.18,
      value: features.weather.temperature,
      optimal: 25,
      description: 'Temperature affects crop development rate'
    });

    return factors.sort((a, b) => b.impact - a.impact);
  }
}
```

## 🤖 LangChain Agents

### Farm Advisor Agent
```typescript
// LangChain agent for comprehensive farm advisory
export class FarmAdvisorAgent {
  private llm: ChatOllama;
  private tools: Tool[];
  private agent: AgentExecutor;

  constructor(config: AgentConfig) {
    this.llm = new ChatOllama({
      baseUrl: config.ollamaUrl,
      model: config.advisorModel,
      temperature: 0.7
    });

    this.setupTools();
    this.setupAgent();
  }

  private setupTools() {
    this.tools = [
      new SensorDataTool(),
      new WeatherTool(),
      new DiseaseDetectionTool(),
      new YieldPredictionTool(),
      new MarketDataTool(),
      new KnowledgeBaseTool()
    ];
  }

  private setupAgent() {
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an expert agricultural advisor with decades of experience in farming. 
      You help farmers make informed decisions about their crops, soil, and farming practices.

      You have access to the following tools:
      {tools}

      When a farmer asks for advice, you should:
      1. Gather relevant data using the available tools
      2. Analyze the information comprehensively
      3. Provide specific, actionable recommendations
      4. Explain the reasoning behind your advice
      5. Consider economic factors and practical constraints

      Current conversation:
      {chat_history}

      Human: {input}
      Assistant: I'll help you with that. Let me gather some relevant information first.

      {agent_scratchpad}
    `);

    this.agent = AgentExecutor.fromAgentAndTools({
      agent: new ConversationalAgent({
        llmChain: new LLMChain({
          llm: this.llm,
          prompt
        }),
        allowedTools: this.tools.map(tool => tool.name)
      }),
      tools: this.tools,
      verbose: true,
      maxIterations: 5
    });
  }

  async getAdvice(query: string, context: FarmContext): Promise<AdvisorResponse> {
    try {
      const response = await this.agent.call({
        input: query,
        chat_history: context.chatHistory || [],
        farm_context: JSON.stringify(context)
      });

      return {
        advice: response.output,
        confidence: this.calculateConfidence(response),
        sources: this.extractSources(response),
        followUpQuestions: this.generateFollowUpQuestions(response),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Farm advisor error:', error);
      throw new Error('Failed to get farm advice');
    }
  }
}

// Custom tools for the farm advisor agent
class SensorDataTool extends Tool {
  name = 'sensor_data';
  description = 'Get current and historical sensor data for a farm';

  async _call(input: string): Promise<string> {
    try {
      const { farmId, hours } = JSON.parse(input);
      const sensorData = await sensorService.getSensorData(farmId, hours);
      return JSON.stringify(sensorData);
    } catch (error) {
      return `Error retrieving sensor data: ${error.message}`;
    }
  }
}

class WeatherTool extends Tool {
  name = 'weather_forecast';
  description = 'Get weather forecast and analysis for a location';

  async _call(input: string): Promise<string> {
    try {
      const { location, days } = JSON.parse(input);
      const weather = await weatherService.getWeatherPrediction(location, days);
      return JSON.stringify(weather);
    } catch (error) {
      return `Error retrieving weather data: ${error.message}`;
    }
  }
}

class DiseaseDetectionTool extends Tool {
  name = 'disease_detection';
  description = 'Analyze plant images for disease detection';

  async _call(input: string): Promise<string> {
    try {
      const { imageUrl, cropType } = JSON.parse(input);
      const imageBuffer = await this.downloadImage(imageUrl);
      const detection = await diseaseService.detectDiseases(imageBuffer, cropType);
      return JSON.stringify(detection);
    } catch (error) {
      return `Error detecting diseases: ${error.message}`;
    }
  }

  private async downloadImage(url: string): Promise<Buffer> {
    // Implementation to download image from URL
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
PORT=8082
NODE_ENV=development

# LLM Configuration
OLLAMA_URL=http://localhost:11434
ADVISORY_MODEL=agricultural-advisor:latest
DISEASE_MODEL=crop-disease-detector:latest

# Vector Database
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION_PREFIX=soilwise

# Python ML Services
PYTHON_SERVICE_URL=http://localhost:8083
ML_MODELS_PATH=./models

# External APIs
OPENWEATHER_API_KEY=your-openweather-key
WEATHER_API_KEY=your-weather-api-key
PLANTNET_API_KEY=your-plantnet-key

# Model Configuration
ENABLE_CUSTOM_MODELS=true
MODEL_CACHE_SIZE=1000
INFERENCE_TIMEOUT=30000

# Data Processing
BATCH_SIZE=32
MAX_IMAGE_SIZE=5242880
VECTOR_DIMENSIONS=384
```

### Model Configuration
```typescript
// AI model configurations
export const modelConfigs = {
  advisory: {
    model: 'agricultural-advisor:latest',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    frequencyPenalty: 0.1
  },
  disease: {
    modelPath: './models/disease-detection.tflite',
    inputSize: [224, 224, 3],
    classThreshold: 0.3,
    nmsThreshold: 0.5
  },
  yield: {
    modelPath: './models/yield-prediction.pkl',
    features: [
      'temperature_avg', 'precipitation_sum', 'humidity_avg',
      'soil_moisture', 'soil_ph', 'soil_nitrogen', 'soil_phosphorus',
      'plant_density', 'planting_date_julian', 'variety_encoded'
    ],
    scalerPath: './models/yield-scaler.pkl'
  },
  weather: {
    modelPath: './models/weather-lstm.h5',
    sequenceLength: 30,
    features: ['temperature', 'humidity', 'pressure', 'wind_speed'],
    predictionDays: 7
  }
};
```

## 🧪 Testing

### Unit Tests
```typescript
// AI service tests
describe('CropAdvisoryService', () => {
  let service: CropAdvisoryService;
  
  beforeEach(() => {
    service = new CropAdvisoryService(testConfig);
  });

  it('should generate crop advice', async () => {
    const request: AdvisoryRequest = {
      farmId: 'test-farm',
      cropType: 'wheat',
      growthStage: 'flowering',
      location: { lat: 40.7128, lng: -74.0060 }
    };

    const advice = await service.generateAdvice(request);
    
    expect(advice).toBeDefined();
    expect(advice.irrigation).toBeDefined();
    expect(advice.fertilization).toBeDefined();
    expect(advice.confidence).toBeGreaterThan(0.5);
  });

  it('should handle missing sensor data gracefully', async () => {
    const request: AdvisoryRequest = {
      farmId: 'empty-farm',
      cropType: 'corn',
      growthStage: 'vegetative',
      location: { lat: 40.7128, lng: -74.0060 }
    };

    const advice = await service.generateAdvice(request);
    
    expect(advice).toBeDefined();
    expect(advice.confidence).toBeLessThan(0.8); // Lower confidence due to missing data
  });
});

describe('DiseaseDetectionService', () => {
  let service: DiseaseDetectionService;
  
  beforeEach(() => {
    service = new DiseaseDetectionService(testConfig);
  });

  it('should detect diseases in plant images', async () => {
    const imageBuffer = fs.readFileSync('./test/images/diseased-leaf.jpg');
    
    const detection = await service.detectDiseases(imageBuffer, 'tomato');
    
    expect(detection.detections).toBeDefined();
    expect(detection.detections.length).toBeGreaterThan(0);
    expect(detection.confidence).toBeGreaterThan(0.5);
  });

  it('should provide treatment recommendations', async () => {
    const imageBuffer = fs.readFileSync('./test/images/fungal-infection.jpg');
    
    const detection = await service.detectDiseases(imageBuffer, 'wheat');
    
    expect(detection.recommendations).toBeDefined();
    expect(detection.recommendations.length).toBeGreaterThan(0);
    expect(detection.recommendations[0].treatments).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// Integration tests for AI services
describe('AI Services Integration', () => {
  it('should integrate with external APIs', async () => {
    const weatherService = new WeatherService(testConfig);
    const location = { lat: 40.7128, lng: -74.0060 };
    
    const weather = await weatherService.getWeatherPrediction(location, 7);
    
    expect(weather.forecast).toBeDefined();
    expect(weather.forecast.length).toBe(7);
  });

  it('should process end-to-end advisory request', async () => {
    const request: AdvisoryRequest = {
      farmId: 'integration-test-farm',
      cropType: 'corn',
      growthStage: 'reproductive',
      location: { lat: 40.7128, lng: -74.0060 }
    };

    // This should trigger the full pipeline
    const advice = await advisoryService.generateAdvice(request);
    
    expect(advice).toBeDefined();
    expect(advice.irrigation).toBeDefined();
    expect(advice.fertilization).toBeDefined();
    expect(advice.pestDisease).toBeDefined();
  });
});
```

## 🚀 Performance Optimization

### Model Optimization
```typescript
// Model optimization for edge deployment
export class ModelOptimizer {
  static async optimizeForEdge(modelPath: string): Promise<string> {
    // Convert to TensorFlow Lite for edge deployment
    const model = await tf.loadLayersModel(modelPath);
    
    // Quantize model to reduce size
    const quantizedModel = await tf.quantization.quantize(model, {
      quantizationBytes: 2 // 16-bit quantization
    });
    
    // Save optimized model
    const optimizedPath = modelPath.replace('.h5', '-optimized.tflite');
    await quantizedModel.save(`file://${optimizedPath}`);
    
    return optimizedPath;
  }

  static async benchmarkModel(modelPath: string, testData: any[]): Promise<BenchmarkResult> {
    const model = await tf.loadLayersModel(modelPath);
    const startTime = Date.now();
    
    // Run inference on test data
    const results = [];
    for (const data of testData) {
      const prediction = await model.predict(data);
      results.push(prediction);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    return {
      averageInferenceTime: totalTime / testData.length,
      throughput: testData.length / (totalTime / 1000),
      memoryUsage: process.memoryUsage().heapUsed,
      accuracy: this.calculateAccuracy(results, testData)
    };
  }
}
```

### Caching Strategy
```typescript
// Intelligent caching for AI responses
export class AICache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttl: number = 24 * 60 * 60 * 1000; // 24 hours

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set(key: string, value: any, customTtl?: number): Promise<void> {
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl: customTtl || this.ttl
    };
    
    this.cache.set(key, entry);
    
    // Implement cache size limit
    if (this.cache.size > 1000) {
      this.evictOldest();
    }
  }

  private evictOldest(): void {
    const oldest = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    
    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }

  generateKey(request: any): string {
    return crypto.createHash('md5')
      .update(JSON.stringify(request))
      .digest('hex');
  }
}
```

## 🤝 Contributing

1. Follow the main project's [Contributing Guidelines](../../CONTRIBUTING.md)
2. Add comprehensive tests for new AI features
3. Document model requirements and dependencies
4. Consider edge deployment constraints
5. Validate AI outputs with domain experts

## 📚 Additional Resources

- [LangChain Documentation](https://js.langchain.com/docs)
- [Ollama Documentation](https://ollama.ai/docs)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [TensorFlow Lite Documentation](https://www.tensorflow.org/lite)
- [Agricultural AI Research Papers](https://arxiv.org/list/cs.AI/recent)
- [Main Project Documentation](../../docs/README.md)
