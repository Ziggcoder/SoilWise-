import { Express } from 'express';
import { LocalDatabase } from '../database/localDatabase';
import { SensorManager } from '../services/sensorManager';
import { AIService } from '../services/aiService';
import { VoiceService } from '../services/voiceService';
import { SyncService } from '../services/syncService';
export interface Services {
    database: LocalDatabase;
    sensorManager: SensorManager;
    aiService: AIService;
    voiceService: VoiceService;
    syncService: SyncService;
}
export declare function setupRoutes(app: Express, services: Services): void;
//# sourceMappingURL=index.d.ts.map