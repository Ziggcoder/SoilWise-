import { AIService } from './aiService';
export interface VoiceConfig {
    speechToText: {
        engine: 'whisper' | 'google' | 'azure';
        apiKey?: string;
        model?: string;
    };
    textToSpeech: {
        engine: 'coqui' | 'google' | 'azure';
        apiKey?: string;
        voice?: string;
    };
    language: string;
    wakeWord: string;
}
export interface VoiceQuery {
    id: string;
    audioData: Buffer;
    transcript?: string;
    response?: string;
    timestamp: Date;
    confidence?: number;
}
export declare class VoiceService {
    private aiService;
    private config;
    isReady: boolean;
    private isInitialized;
    private isListening;
    constructor(aiService: AIService, config?: Partial<VoiceConfig>);
    initialize(): Promise<void>;
    startListening(): Promise<void>;
    stopListening(): Promise<void>;
    processVoiceQuery(audioData: Buffer): Promise<VoiceQuery>;
    private initializeSpeechToText;
    private initializeTextToSpeech;
    private initializeWakeWordDetection;
    private initializeWhisper;
    private initializeGoogleSTT;
    private initializeAzureSTT;
    private initializeCoqui;
    private initializeGoogleTTS;
    private initializeAzureTTS;
    private startAudioCapture;
    private stopAudioCapture;
    private speechToText;
    private textToSpeech;
    private whisperSTT;
    private googleSTT;
    private azureSTT;
    private coquiTTS;
    private googleTTS;
    private azureTTS;
    private playAudioResponse;
    private generateTextResponse;
    private generateQueryId;
    get initialized(): boolean;
    get listening(): boolean;
    processVoiceInput(audioData: Buffer): Promise<string>;
    shutdown(): Promise<void>;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=voiceService.d.ts.map