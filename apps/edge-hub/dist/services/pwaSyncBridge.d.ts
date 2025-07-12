import { EventEmitter } from 'events';
import { LocalDatabase } from '../database/localDatabase';
import { MQTTService } from './mqttService';
export interface PWASyncData {
    farms: any[];
    fields: any[];
    observations: any[];
    sensorReadings: any[];
    tasks: any[];
    photos: any[];
    notes: any[];
}
export interface SyncRequest {
    type: 'full' | 'incremental';
    lastSync?: Date;
    deviceId: string;
    userId: string;
}
export interface SyncResponse {
    success: boolean;
    data?: PWASyncData;
    conflicts?: any[];
    error?: string;
    timestamp: Date;
}
export declare class PWASyncBridge extends EventEmitter {
    private database;
    private mqttService;
    private isRunning;
    private syncInterval;
    private connectedDevices;
    constructor(database: LocalDatabase, mqttService: MQTTService);
    start(): Promise<void>;
    stop(): Promise<void>;
    private setupMQTTHandlers;
    private handleSyncRequest;
    private processSyncRequest;
    private processFullSync;
    private processIncrementalSync;
    private handleDeviceConnect;
    private handleDeviceDisconnect;
    private startPeriodicSync;
    private broadcastUpdates;
    receiveDataFromPWA(deviceId: string, data: any): Promise<void>;
    private processPWAFields;
    private processPWAObservations;
    private processPWAPhotos;
    private processPWATasks;
    getSyncStatus(): any;
    forceSyncDevice(deviceId: string): Promise<void>;
}
//# sourceMappingURL=pwaSyncBridge.d.ts.map