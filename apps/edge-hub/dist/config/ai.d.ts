export interface AIConfig {
    ollama: {
        baseUrl: string;
        model: string;
        temperature: number;
        maxTokens: number;
        timeout: number;
    };
    whisper: {
        modelPath: string;
        modelSize: 'tiny' | 'base' | 'small' | 'medium' | 'large';
        language: string;
        device: 'cpu' | 'gpu';
    };
    coqui: {
        modelPath: string;
        voiceModel: string;
        language: string;
        speakingRate: number;
        pitch: number;
    };
    chromadb: {
        host: string;
        port: number;
        collectionName: string;
        embeddingModel: string;
    };
    features: {
        enableVoice: boolean;
        enableRecommendations: boolean;
        enableImageAnalysis: boolean;
        enableOfflineInference: boolean;
    };
}
export declare const getAIConfig: () => AIConfig;
export interface CameraConfig {
    devices: Array<{
        id: string;
        name: string;
        resolution: string;
        fps: number;
        format: string;
    }>;
    capture: {
        autoFocus: boolean;
        autoWhiteBalance: boolean;
        exposure: number;
        quality: number;
    };
    processing: {
        enableObjectDetection: boolean;
        enablePlantDisease: boolean;
        enableCropAnalysis: boolean;
        modelPath: string;
    };
}
export declare const getCameraConfig: () => CameraConfig;
//# sourceMappingURL=ai.d.ts.map