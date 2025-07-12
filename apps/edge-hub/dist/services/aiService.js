"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class AIService {
    constructor() {
        this.isConnected = false;
        this.isReady = false;
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8082';
        this.apiKey = process.env.AI_API_KEY;
    }
    async initialize() {
        try {
            await this.checkConnection();
            this.isReady = true;
            logger_1.logger.info('AI Service initialized successfully');
        }
        catch (error) {
            this.isReady = false;
            logger_1.logger.error('Failed to initialize AI Service:', error);
            throw error;
        }
    }
    async checkConnection() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/health`, {
                timeout: 5000,
                headers: this.getHeaders()
            });
            if (response.status === 200) {
                this.isConnected = true;
                logger_1.logger.info('AI Service connection established');
            }
            else {
                throw new Error(`AI Service returned status: ${response.status}`);
            }
        }
        catch (error) {
            this.isConnected = false;
            logger_1.logger.error('AI Service connection failed:', error);
            throw error;
        }
    }
    async getAdvisory(sensorData, farmData) {
        try {
            const request = {
                type: 'advisory',
                data: {
                    sensors: sensorData,
                    farm: farmData,
                    timestamp: new Date()
                }
            };
            const response = await axios_1.default.post(`${this.baseUrl}/advisory`, request, {
                headers: this.getHeaders(),
                timeout: 30000
            });
            return {
                success: true,
                result: response.data,
                confidence: response.data.confidence,
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting advisory:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
    async getPrediction(sensorData, predictionType) {
        try {
            const request = {
                type: 'prediction',
                data: {
                    sensors: sensorData,
                    predictionType,
                    timestamp: new Date()
                }
            };
            const response = await axios_1.default.post(`${this.baseUrl}/prediction`, request, {
                headers: this.getHeaders(),
                timeout: 30000
            });
            return {
                success: true,
                result: response.data,
                confidence: response.data.confidence,
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting prediction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
    async analyzeData(data, analysisType) {
        try {
            const request = {
                type: 'analysis',
                data: {
                    dataset: data,
                    analysisType,
                    timestamp: new Date()
                }
            };
            const response = await axios_1.default.post(`${this.baseUrl}/analysis`, request, {
                headers: this.getHeaders(),
                timeout: 30000
            });
            return {
                success: true,
                result: response.data,
                confidence: response.data.confidence,
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error('Error analyzing data:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
    async processVoiceQuery(audioData, context) {
        try {
            const formData = new FormData();
            formData.append('audio', new Blob([audioData]), 'audio.wav');
            if (context) {
                formData.append('context', JSON.stringify(context));
            }
            const response = await axios_1.default.post(`${this.baseUrl}/voice/process`, formData, {
                headers: {
                    ...this.getHeaders(),
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            });
            return {
                success: true,
                result: response.data,
                confidence: response.data.confidence,
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error('Error processing voice query:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
    async generateReport(data, reportType) {
        try {
            const request = {
                type: 'report',
                data: {
                    dataset: data,
                    reportType,
                    timestamp: new Date()
                }
            };
            const response = await axios_1.default.post(`${this.baseUrl}/report`, request, {
                headers: this.getHeaders(),
                timeout: 60000
            });
            return {
                success: true,
                result: response.data,
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating report:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
    async getCropRecommendations(soilData, weatherData) {
        try {
            const request = {
                type: 'crop_recommendation',
                data: {
                    soil: soilData,
                    weather: weatherData,
                    timestamp: new Date()
                }
            };
            const response = await axios_1.default.post(`${this.baseUrl}/crop/recommend`, request, {
                headers: this.getHeaders(),
                timeout: 30000
            });
            return {
                success: true,
                result: response.data,
                confidence: response.data.confidence,
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting crop recommendations:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'SoilWise-EdgeHub/1.0'
        };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }
    get connected() {
        return this.isConnected;
    }
    async shutdown() {
        this.isConnected = false;
        this.isReady = false;
        logger_1.logger.info('AI Service shutdown');
    }
    async cleanup() {
        await this.shutdown();
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map