import { LocalDatabase } from '../database/localDatabase';
export interface SensorData {
    sensorId: string;
    type: 'temperature' | 'humidity' | 'soil_moisture' | 'ph' | 'light';
    value: number;
    unit: string;
    timestamp: Date;
    location?: {
        lat: number;
        lng: number;
    };
}
export declare class SensorManager {
    private database;
    private serialPorts;
    private isRunning;
    private eventEmitter;
    constructor(database: LocalDatabase);
    start(): Promise<void>;
    stop(): Promise<void>;
    private initializeSerialPorts;
    private isSensorPort;
    private connectToSensor;
    private processSensorData;
    private parseSensorData;
    private storeSensorData;
    private startDataCollection;
    getSensorData(sensorId?: string, limit?: number): Promise<SensorData[]>;
    getLatestSensorData(sensorId: string): Promise<SensorData | null>;
    initialize(): Promise<void>;
    on(event: string, callback: (...args: any[]) => void): void;
    cleanup(): Promise<void>;
    get isActive(): boolean;
}
//# sourceMappingURL=sensorManager.d.ts.map