import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { Document } from 'langchain/document'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { logger } from '../utils/logger'

export interface AgricultureContext {
  location: {
    lat: number
    lng: number
    region: string
    climate: string
  }
  soil: {
    type: string
    ph: number
    nutrients: Record<string, number>
    moisture: number
    temperature: number
  }
  weather: {
    current: any
    forecast: any[]
  }
  crops: {
    type: string
    stage: string
    plantingDate: Date
    expectedHarvest: Date
  }[]
  sensors: {
    id: string
    type: string
    readings: any[]
  }[]
}

export interface Recommendation {
  id: string
  type: 'irrigation' | 'fertilization' | 'pest_control' | 'harvest' | 'planting'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  actions: string[]
  reasoning: string
  confidence: number
  timestamp: Date
  validUntil: Date
}

export class AIAdvisoryEngine {
  private llm: ChatOllama
  private vectorStore: Chroma | null = null
  private qaChain: RetrievalQAChain | null = null
  private textSplitter: RecursiveCharacterTextSplitter
  private knowledgeBase: Document[]
  private isInitialized = false

  constructor() {
    this.llm = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3',
      temperature: 0.1,
      // maxTokens: 1000,  // Remove this, it's not a valid property
    })

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    this.knowledgeBase = []
  }

  private async queryWithChain(query: string): Promise<{ text: string }> {
    if (this.qaChain) {
      const result = await this.qaChain.call({ query })
      return { text: result.text || result.output || 'No response' }
    } else {
      // Fallback to direct LLM call if qaChain is not available
      const result = await this.llm.invoke(query)
      return { text: result.content as string }
    }
  }

  async initialize() {
    try {
      // Try to initialize vector store, but don't fail if ChromaDB is not available
      try {
        this.vectorStore = await Chroma.fromExistingCollection(
          new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY || 'dummy-key',
            modelName: 'text-embedding-ada-002',
          }),
          {
            collectionName: 'agriculture_knowledge',
            url: process.env.CHROMADB_URL || 'http://localhost:8000',
          }
        )
        logger.info('ChromaDB vector store initialized successfully')
      } catch (error) {
        logger.warn('ChromaDB not available, running without vector store:', error instanceof Error ? error.message : String(error))
        this.vectorStore = null
      }

      // Create retrieval chain if vector store is available
      if (this.vectorStore) {
        try {
          this.qaChain = RetrievalQAChain.fromLLM(
            this.llm as any,  // Cast to any to avoid type issues
            this.vectorStore.asRetriever() as any  // Cast to any to avoid type issues
          )
          logger.info('QA chain initialized successfully')
        } catch (error) {
          logger.warn('Failed to create retrieval chain, will use direct LLM calls:', error instanceof Error ? error.message : String(error))
          this.qaChain = null
        }
      }

      // Load knowledge base
      await this.loadKnowledgeBase()

      this.isInitialized = true
      logger.info('AI Advisory Engine initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize AI Advisory Engine:', error)
      throw error
    }
  }

  async loadKnowledgeBase() {
    // Load agriculture knowledge from various sources
    const knowledgeSources = [
      {
        source: 'crop_management',
        content: `
        # Crop Management Best Practices
        
        ## Soil Health
        - Optimal pH ranges: 6.0-7.5 for most crops
        - Soil moisture: 50-70% field capacity
        - Organic matter: 3-5% for healthy soil
        
        ## Irrigation
        - Water deeply but less frequently
        - Monitor soil moisture at root depth
        - Adjust based on weather conditions
        
        ## Nutrient Management
        - N-P-K ratios vary by crop and growth stage
        - Apply fertilizers based on soil tests
        - Consider organic alternatives
        `
      },
      {
        source: 'pest_management',
        content: `
        # Integrated Pest Management
        
        ## Early Detection
        - Regular field monitoring
        - Use of pheromone traps
        - Beneficial insect identification
        
        ## Prevention
        - Crop rotation
        - Companion planting
        - Resistant varieties
        
        ## Treatment
        - Biological controls first
        - Targeted pesticide application
        - Proper timing and weather conditions
        `
      },
      {
        source: 'weather_adaptation',
        content: `
        # Weather-Based Farming
        
        ## Temperature Management
        - Frost protection measures
        - Heat stress mitigation
        - Optimal planting windows
        
        ## Precipitation Management
        - Drainage systems
        - Water conservation
        - Drought-resistant practices
        
        ## Seasonal Planning
        - Crop selection based on climate
        - Timing of field operations
        - Risk management strategies
        `
      }
    ]

    for (const source of knowledgeSources) {
      const docs = await this.textSplitter.splitDocuments([
        new Document({
          pageContent: source.content,
          metadata: { source: source.source }
        })
      ])
      this.knowledgeBase.push(...docs)
    }

    // Add documents to vector store
    if (this.vectorStore) {
      await this.vectorStore.addDocuments(this.knowledgeBase)
    }
    logger.info(`Loaded ${this.knowledgeBase.length} knowledge base documents`)
  }

  async generateRecommendations(context: AgricultureContext): Promise<Recommendation[]> {
    if (!this.isInitialized) {
      throw new Error('AI Advisory Engine not initialized')
    }

    const recommendations: Recommendation[] = []

    // Generate different types of recommendations
    const irrigationRec = await this.generateIrrigationRecommendation(context)
    if (irrigationRec) recommendations.push(irrigationRec)

    const fertilizationRec = await this.generateFertilizationRecommendation(context)
    if (fertilizationRec) recommendations.push(fertilizationRec)

    const pestControlRec = await this.generatePestControlRecommendation(context)
    if (pestControlRec) recommendations.push(pestControlRec)

    const harvestRec = await this.generateHarvestRecommendation(context)
    if (harvestRec) recommendations.push(harvestRec)

    return recommendations.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority))
  }

  private async generateIrrigationRecommendation(context: AgricultureContext): Promise<Recommendation | null> {
    const soilMoisture = context.soil.moisture
    const weather = context.weather.current
    const forecast = context.weather.forecast.slice(0, 3) // Next 3 days

    const query = `
    Based on the following conditions, should I irrigate my crops?
    - Soil moisture: ${soilMoisture}%
    - Current weather: ${JSON.stringify(weather)}
    - 3-day forecast: ${JSON.stringify(forecast)}
    - Crops: ${context.crops.map(c => `${c.type} (${c.stage})`).join(', ')}
    
    Provide specific irrigation recommendations with reasoning.
    `

    try {
      const response = await this.queryWithChain(query)
      
      // Parse AI response and determine priority
      const needsIrrigation = this.parseIrrigationNeed(response.text, soilMoisture)
      
      if (needsIrrigation.should) {
        return {
          id: `irrigation_${Date.now()}`,
          type: 'irrigation',
          priority: needsIrrigation.priority,
          title: 'Irrigation Recommendation',
          description: needsIrrigation.description,
          actions: needsIrrigation.actions,
          reasoning: response.text,
          confidence: needsIrrigation.confidence,
          timestamp: new Date(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      }
    } catch (error) {
      logger.error('Error generating irrigation recommendation:', error)
    }

    return null
  }

  private async generateFertilizationRecommendation(context: AgricultureContext): Promise<Recommendation | null> {
    const nutrients = context.soil.nutrients
    const crops = context.crops

    const query = `
    Based on soil nutrient levels and crop requirements, what fertilization is needed?
    - Soil nutrients: ${JSON.stringify(nutrients)}
    - Crops: ${crops.map(c => `${c.type} at ${c.stage} stage`).join(', ')}
    - Soil pH: ${context.soil.ph}
    
    Provide specific fertilization recommendations with NPK ratios and timing.
    `

    try {
      const response = await this.queryWithChain(query)
      
      const needsFertilization = this.parseFertilizationNeed(response.text, nutrients)
      
      if (needsFertilization.should) {
        return {
          id: `fertilization_${Date.now()}`,
          type: 'fertilization',
          priority: needsFertilization.priority,
          title: 'Fertilization Recommendation',
          description: needsFertilization.description,
          actions: needsFertilization.actions,
          reasoning: response.text,
          confidence: needsFertilization.confidence,
          timestamp: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      }
    } catch (error) {
      logger.error('Error generating fertilization recommendation:', error)
    }

    return null
  }

  private async generatePestControlRecommendation(context: AgricultureContext): Promise<Recommendation | null> {
    const weather = context.weather.current
    const crops = context.crops

    const query = `
    Based on current conditions, what pest control measures should be taken?
    - Weather: ${JSON.stringify(weather)}
    - Crops: ${crops.map(c => `${c.type} at ${c.stage} stage`).join(', ')}
    - Season: ${this.getCurrentSeason()}
    
    Provide pest prevention and control recommendations.
    `

    try {
      const response = await this.queryWithChain(query)
      
      const needsPestControl = this.parsePestControlNeed(response.text, weather)
      
      if (needsPestControl.should) {
        return {
          id: `pest_control_${Date.now()}`,
          type: 'pest_control',
          priority: needsPestControl.priority,
          title: 'Pest Control Recommendation',
          description: needsPestControl.description,
          actions: needsPestControl.actions,
          reasoning: response.text,
          confidence: needsPestControl.confidence,
          timestamp: new Date(),
          validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
        }
      }
    } catch (error) {
      logger.error('Error generating pest control recommendation:', error)
    }

    return null
  }

  private async generateHarvestRecommendation(context: AgricultureContext): Promise<Recommendation | null> {
    const crops = context.crops.filter(c => c.stage === 'mature' || c.stage === 'ripening')
    
    if (crops.length === 0) return null

    const query = `
    Based on crop maturity and weather conditions, when should I harvest?
    - Mature crops: ${crops.map(c => `${c.type} planted on ${c.plantingDate.toISOString().split('T')[0]}`).join(', ')}
    - Weather forecast: ${JSON.stringify(context.weather.forecast.slice(0, 7))}
    
    Provide harvest timing recommendations.
    `

    try {
      const response = await this.queryWithChain(query)
      
      const needsHarvest = this.parseHarvestNeed(response.text, crops)
      
      if (needsHarvest.should) {
        return {
          id: `harvest_${Date.now()}`,
          type: 'harvest',
          priority: needsHarvest.priority,
          title: 'Harvest Recommendation',
          description: needsHarvest.description,
          actions: needsHarvest.actions,
          reasoning: response.text,
          confidence: needsHarvest.confidence,
          timestamp: new Date(),
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
        }
      }
    } catch (error) {
      logger.error('Error generating harvest recommendation:', error)
    }

    return null
  }

  // Helper methods for parsing AI responses
  private parseIrrigationNeed(response: string, soilMoisture: number) {
    const should = soilMoisture < 30 || response.toLowerCase().includes('irrigate')
    const priority = soilMoisture < 20 ? 'urgent' : soilMoisture < 30 ? 'high' : 'medium'
    
    return {
      should,
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      description: `Soil moisture is at ${soilMoisture}%. ${should ? 'Irrigation recommended.' : 'No irrigation needed.'}`,
      actions: should ? ['Check irrigation system', 'Apply water to root zone', 'Monitor soil moisture'] : [],
      confidence: 0.85
    }
  }

  private parseFertilizationNeed(response: string, nutrients: Record<string, number>) {
    const lowNutrients = Object.entries(nutrients).filter(([_, value]) => value < 50)
    const should = lowNutrients.length > 0 || response.toLowerCase().includes('fertilize')
    
    return {
      should,
      priority: lowNutrients.length > 2 ? 'high' : 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      description: `Nutrient analysis shows ${lowNutrients.map(([nutrient]) => nutrient).join(', ')} levels are low.`,
      actions: should ? ['Soil test', 'Apply balanced fertilizer', 'Monitor plant health'] : [],
      confidence: 0.8
    }
  }

  private parsePestControlNeed(response: string, weather: any) {
    const riskFactors = [
      weather.humidity > 70,
      weather.temperature > 25,
      response.toLowerCase().includes('pest')
    ].filter(Boolean)
    
    const should = riskFactors.length > 1
    
    return {
      should,
      priority: riskFactors.length > 2 ? 'high' : 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      description: `Weather conditions ${should ? 'favor' : 'do not favor'} pest development.`,
      actions: should ? ['Scout fields', 'Check trap cards', 'Apply preventive measures'] : [],
      confidence: 0.75
    }
  }

  private parseHarvestNeed(response: string, crops: any[]) {
    const should = crops.length > 0 && response.toLowerCase().includes('harvest')
    
    return {
      should,
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      description: `${crops.length} crop(s) ready for harvest evaluation.`,
      actions: should ? ['Check crop maturity', 'Prepare harvest equipment', 'Plan harvest schedule'] : [],
      confidence: 0.8
    }
  }

  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'urgent': return 4
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 0
    }
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  async cleanup() {
    // Cleanup resources
    this.isInitialized = false
    logger.info('AI Advisory Engine cleaned up')
  }
}
