import { LocalDatabase } from '../database/localDatabase';
export interface SyncConfig {
    cloudEndpoint: string;
    apiKey?: string;
    syncInterval: number;
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
}
export interface SyncStatus {
    lastSync: Date | null;
    isSync: boolean;
    pendingItems: number;
    failedItems: number;
    totalSynced: number;
}
export declare class SyncService {
    private database;
    private config;
    private status;
    private syncInterval;
    private isRunning;
    isOnline: boolean;
    constructor(database: LocalDatabase, config?: Partial<SyncConfig>);
    start(): Promise<void>;
    stop(): Promise<void>;
    performSync(): Promise<void>;
    private performInitialSync;
    private startPeriodicSync;
    private syncSensorData;
    private syncAlerts;
    private syncFarmData;
    private syncConfigurations;
    private uploadSensorDataBatch;
    private uploadAlertsBatch;
    private uploadFarmDataBatch;
    private downloadConfigurations;
    private makeRequest;
    private createBatches;
    private loadSyncStatus;
    private saveSyncStatus;
    forceSyncNow(): Promise<void>;
    getSyncStatus(): SyncStatus;
    updateSyncConfig(config: Partial<SyncConfig>): Promise<void>;
    get running(): boolean;
}
//# sourceMappingURL=syncService.d.ts.map