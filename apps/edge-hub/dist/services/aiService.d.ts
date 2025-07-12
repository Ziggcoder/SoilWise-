export interface AIRequest {
    type: 'advisory' | 'prediction' | 'analysis';
    data: any;
    context?: any;
}
export interface AIResponse {
    success: boolean;
    result?: any;
    error?: string;
    confidence?: number;
    timestamp: Date;
}
export declare class AIService {
    private baseUrl;
    private apiKey;
    private isConnected;
    isReady: boolean;
    constructor();
    initialize(): Promise<void>;
    checkConnection(): Promise<void>;
    getAdvisory(sensorData: any[], farmData: any): Promise<AIResponse>;
    getPrediction(sensorData: any[], predictionType: string): Promise<AIResponse>;
    analyzeData(data: any[], analysisType: string): Promise<AIResponse>;
    processVoiceQuery(audioData: Buffer, context?: any): Promise<AIResponse>;
    generateReport(data: any[], reportType: string): Promise<AIResponse>;
    getCropRecommendations(soilData: any, weatherData: any): Promise<AIResponse>;
    private getHeaders;
    get connected(): boolean;
    shutdown(): Promise<void>;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=aiService.d.ts.map