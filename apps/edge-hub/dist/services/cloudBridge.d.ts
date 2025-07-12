import { EventEmitter } from 'events';
import { LocalDatabase } from '../database/localDatabase';
export interface CloudConfig {
    endpoint: string;
    apiKey?: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    syncInterval: number;
    batchSize: number;
}
export interface CloudSyncStatus {
    lastSync: Date | null;
    isOnline: boolean;
    isSyncing: boolean;
    pendingUploads: number;
    failedUploads: number;
    totalSynced: number;
    lastError?: string;
}
export interface SyncBatch {
    type: 'sensor_data' | 'alerts' | 'farms' | 'configurations';
    data: any[];
    timestamp: Date;
}
export declare class CloudBridge extends EventEmitter {
    private database;
    private config;
    private apiClient;
    private status;
    private syncInterval;
    private isRunning;
    constructor(database: LocalDatabase, config?: Partial<CloudConfig>);
    start(): Promise<void>;
    stop(): Promise<void>;
    private setupInterceptors;
    private checkConnectivity;
    private startPeriodicSync;
    performSync(): Promise<void>;
    private uploadSensorData;
    private uploadAlerts;
    private uploadFarmData;
    private uploadBatch;
    private downloadConfigurations;
    private downloadUpdates;
    private processUpdate;
    private getUploadEndpoint;
    private retryOperation;
    private loadSyncStatus;
    private saveSyncStatus;
    forcefulSync(): Promise<void>;
    testConnectivity(): Promise<boolean>;
    getStatus(): CloudSyncStatus;
    sendAlert(alert: any): Promise<void>;
    getConfiguration(key: string): Promise<any>;
    updateConfiguration(key: string, value: any): Promise<void>;
}
//# sourceMappingURL=cloudBridge.d.ts.map