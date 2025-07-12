import { SensorData } from '../services/sensorManager';
export interface Alert {
    id?: number;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    sensorId?: string;
    farmId?: string;
    resolved: boolean;
    synced: boolean;
}
export interface Farm {
    id?: number;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    size: number;
    cropType: string;
    ownerId: string;
    created: Date;
    synced: boolean;
}
export declare class LocalDatabase {
    private knex;
    private _isConnected;
    constructor();
    initialize(): Promise<void>;
    private createTables;
    insertSensorData(data: SensorData | any): Promise<number>;
    getSensorData(sensorId?: string, limit?: number): Promise<SensorData[]>;
    getUnsyncedSensorData(limit?: number): Promise<any[]>;
    getUnsyncedAlerts(limit?: number): Promise<any[]>;
    getUnsyncedFarms(limit?: number): Promise<any[]>;
    markSensorDataSynced(ids: number[]): Promise<void>;
    markAlertsSynced(ids: number[]): Promise<void>;
    markFarmsSynced(ids: number[]): Promise<void>;
    insertAlert(alert: Alert): Promise<number>;
    getAlerts(limit?: number): Promise<Alert[]>;
    setConfiguration(key: string, value: any): Promise<void>;
    getConfiguration(key: string): Promise<any>;
    getSyncStatus(): Promise<any>;
    saveSyncStatus(status: any): Promise<void>;
    getFields(): Promise<any[]>;
    getFarmsModifiedSince(since: Date): Promise<Farm[]>;
    getFieldsModifiedSince(since: Date): Promise<any[]>;
    getSensorDataSince(since: Date): Promise<SensorData[]>;
    getFieldById(id: number): Promise<any>;
    updateField(id: number, field: any): Promise<void>;
    insertField(field: any): Promise<number>;
    insertObservation(observation: any): Promise<number>;
    insertPhoto(photo: any): Promise<number>;
    insertTask(task: any): Promise<number>;
    close(): Promise<void>;
    get isConnected(): boolean;
    getFarms(ownerId?: string): Promise<any[]>;
    insertFarm(farm: any): Promise<string>;
    updateConfigurations(configs: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=localDatabase.d.ts.map