import { EventEmitter } from 'events';
export interface SensorReading {
    sensor_id: string;
    farm_id: string;
    type: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'nitrogen' | 'phosphorus' | 'potassium';
    value: number;
    unit: string;
    timestamp: Date;
    location: {
        lat: number;
        lng: number;
    };
    quality: 'high' | 'medium' | 'low';
    battery_level?: number;
}
export interface SimulatedDevice {
    id: string;
    name: string;
    type: string;
    location: {
        lat: number;
        lng: number;
    };
    sensors: string[];
    isActive: boolean;
    batteryLevel: number;
    signalStrength: number;
}
export declare class DataSimulator extends EventEmitter {
    private devices;
    private intervals;
    private isRunning;
    constructor();
    private initializeDevices;
    start(): void;
    stop(): void;
    private generateDeviceData;
    private generateSensorReading;
    private getBaseValues;
    private getRealisticVariation;
    private getSeasonalMultiplier;
    private getDailyMultiplier;
    private getDataQuality;
    private updateDeviceStatus;
    private getFarmIdFromDevice;
    private startAlertSimulation;
    private generateAlert;
    triggerAlert(type: string, farmId: string): void;
    getDeviceStatus(): SimulatedDevice[];
    isActive(): boolean;
}
//# sourceMappingURL=dataSimulator.d.ts.map