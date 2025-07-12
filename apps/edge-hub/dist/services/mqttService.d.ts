import { LocalDatabase } from '../database/localDatabase';
import { SensorData } from './sensorManager';
export declare class MQTTService {
    private client;
    private database;
    isConnected: boolean;
    private reconnectInterval;
    constructor(database: LocalDatabase);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private subscribeToTopics;
    private handleMessage;
    private handleSensorData;
    private handleCommand;
    private handleAlert;
    private handleSync;
    publishSensorData(sensorData: SensorData): Promise<void>;
    publishAlert(alert: any): Promise<void>;
    publish(topic: string, message: string | Buffer): void;
    on(event: string, callback: (...args: any[]) => void): void;
    private calibrateSensor;
    private updateConfig;
    private restartService;
    private performFullSync;
    private performIncrementalSync;
    get connected(): boolean;
}
//# sourceMappingURL=mqttService.d.ts.map