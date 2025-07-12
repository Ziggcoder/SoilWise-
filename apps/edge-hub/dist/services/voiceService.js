"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceService = void 0;
const logger_1 = require("../utils/logger");
class VoiceService {
    constructor(aiService, config) {
        this.isReady = false;
        this.isInitialized = false;
        this.isListening = false;
        this.aiService = aiService;
        this.config = {
            speechToText: {
                engine: 'whisper',
                model: 'base'
            },
            textToSpeech: {
                engine: 'coqui',
                voice: 'jenny'
            },
            language: 'en-US',
            wakeWord: 'hey soilwise',
            ...config
        };
    }
    async initialize() {
        try {
            await this.initializeSpeechToText();
            await this.initializeTextToSpeech();
            await this.initializeWakeWordDetection();
            this.isInitialized = true;
            logger_1.logger.info('Voice Service initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Voice Service:', error);
            throw error;
        }
    }
    async startListening() {
        if (!this.isInitialized) {
            throw new Error('Voice Service not initialized');
        }
        try {
            this.isListening = true;
            logger_1.logger.info('Voice Service started listening');
            await this.startAudioCapture();
        }
        catch (error) {
            logger_1.logger.error('Failed to start voice listening:', error);
            throw error;
        }
    }
    async stopListening() {
        this.isListening = false;
        await this.stopAudioCapture();
        logger_1.logger.info('Voice Service stopped listening');
    }
    async processVoiceQuery(audioData) {
        const queryId = this.generateQueryId();
        const query = {
            id: queryId,
            audioData,
            timestamp: new Date()
        };
        try {
            const transcript = await this.speechToText(audioData);
            query.transcript = transcript;
            if (!transcript) {
                throw new Error('Failed to transcribe audio');
            }
            logger_1.logger.info(`Voice query transcribed: "${transcript}"`);
            const aiResponse = await this.aiService.processVoiceQuery(audioData, {
                transcript,
                timestamp: query.timestamp
            });
            if (!aiResponse.success) {
                throw new Error(`AI processing failed: ${aiResponse.error}`);
            }
            const textResponse = this.generateTextResponse(aiResponse);
            query.response = textResponse;
            query.confidence = aiResponse.confidence || 0;
            const audioResponse = await this.textToSpeech(textResponse);
            await this.playAudioResponse(audioResponse);
            logger_1.logger.info(`Voice query processed: "${textResponse}"`);
            return query;
        }
        catch (error) {
            logger_1.logger.error('Error processing voice query:', error);
            query.response = 'I apologize, but I encountered an error processing your request.';
            const errorAudio = await this.textToSpeech(query.response);
            await this.playAudioResponse(errorAudio);
            return query;
        }
    }
    async initializeSpeechToText() {
        logger_1.logger.info(`Initializing Speech-to-Text with ${this.config.speechToText.engine}`);
        switch (this.config.speechToText.engine) {
            case 'whisper':
                await this.initializeWhisper();
                break;
            case 'google':
                await this.initializeGoogleSTT();
                break;
            case 'azure':
                await this.initializeAzureSTT();
                break;
            default:
                throw new Error(`Unsupported STT engine: ${this.config.speechToText.engine}`);
        }
    }
    async initializeTextToSpeech() {
        logger_1.logger.info(`Initializing Text-to-Speech with ${this.config.textToSpeech.engine}`);
        switch (this.config.textToSpeech.engine) {
            case 'coqui':
                await this.initializeCoqui();
                break;
            case 'google':
                await this.initializeGoogleTTS();
                break;
            case 'azure':
                await this.initializeAzureTTS();
                break;
            default:
                throw new Error(`Unsupported TTS engine: ${this.config.textToSpeech.engine}`);
        }
    }
    async initializeWakeWordDetection() {
        logger_1.logger.info(`Initializing wake word detection for: "${this.config.wakeWord}"`);
    }
    async initializeWhisper() {
        logger_1.logger.info('Whisper STT initialized');
    }
    async initializeGoogleSTT() {
        logger_1.logger.info('Google STT initialized');
    }
    async initializeAzureSTT() {
        logger_1.logger.info('Azure STT initialized');
    }
    async initializeCoqui() {
        logger_1.logger.info('Coqui TTS initialized');
    }
    async initializeGoogleTTS() {
        logger_1.logger.info('Google TTS initialized');
    }
    async initializeAzureTTS() {
        logger_1.logger.info('Azure TTS initialized');
    }
    async startAudioCapture() {
        logger_1.logger.info('Audio capture started');
    }
    async stopAudioCapture() {
        logger_1.logger.info('Audio capture stopped');
    }
    async speechToText(audioData) {
        try {
            switch (this.config.speechToText.engine) {
                case 'whisper':
                    return await this.whisperSTT(audioData);
                case 'google':
                    return await this.googleSTT(audioData);
                case 'azure':
                    return await this.azureSTT(audioData);
                default:
                    throw new Error(`Unsupported STT engine: ${this.config.speechToText.engine}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Speech-to-text conversion failed:', error);
            throw error;
        }
    }
    async textToSpeech(text) {
        try {
            switch (this.config.textToSpeech.engine) {
                case 'coqui':
                    return await this.coquiTTS(text);
                case 'google':
                    return await this.googleTTS(text);
                case 'azure':
                    return await this.azureTTS(text);
                default:
                    throw new Error(`Unsupported TTS engine: ${this.config.textToSpeech.engine}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Text-to-speech conversion failed:', error);
            throw error;
        }
    }
    async whisperSTT(audioData) {
        return 'Sample transcription from Whisper';
    }
    async googleSTT(audioData) {
        return 'Sample transcription from Google';
    }
    async azureSTT(audioData) {
        return 'Sample transcription from Azure';
    }
    async coquiTTS(text) {
        return Buffer.from('Sample audio from Coqui');
    }
    async googleTTS(text) {
        return Buffer.from('Sample audio from Google');
    }
    async azureTTS(text) {
        return Buffer.from('Sample audio from Azure');
    }
    async playAudioResponse(audioData) {
        logger_1.logger.info('Playing audio response');
    }
    generateTextResponse(aiResponse) {
        if (!aiResponse.result) {
            return 'I apologize, but I couldn\'t process your request.';
        }
        if (aiResponse.result.type === 'advisory') {
            return `Based on your sensor data, here's my recommendation: ${aiResponse.result.advisory}`;
        }
        else if (aiResponse.result.type === 'query') {
            return aiResponse.result.answer;
        }
        else {
            return 'I understand your request and have processed it successfully.';
        }
    }
    generateQueryId() {
        return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    get initialized() {
        return this.isInitialized;
    }
    get listening() {
        return this.isListening;
    }
    async processVoiceInput(audioData) {
        if (!this.isInitialized) {
            throw new Error('Voice service not initialized');
        }
        try {
            const query = await this.processVoiceQuery(audioData);
            return query.response || 'I couldn\'t process your request.';
        }
        catch (error) {
            logger_1.logger.error('Error processing voice input:', error);
            throw error;
        }
    }
    async shutdown() {
        await this.stopListening();
        this.isInitialized = false;
        this.isReady = false;
        logger_1.logger.info('Voice Service shutdown');
    }
    async cleanup() {
        await this.shutdown();
    }
}
exports.VoiceService = VoiceService;
//# sourceMappingURL=voiceService.js.map