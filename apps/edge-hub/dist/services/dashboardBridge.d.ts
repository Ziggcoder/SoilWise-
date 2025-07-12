import { EventEmitter } from 'events';
import { Server } from 'socket.io';
import { LocalDatabase } from '../database/localDatabase';
import { MQTTService } from './mqttService';
import { SensorManager } from './sensorManager';
export interface DashboardClient {
    id: string;
    userId: string;
    farmIds: string[];
    permissions: string[];
    connectedAt: Date;
    lastSeen: Date;
}
export interface RealTimeUpdate {
    type: 'sensor_data' | 'alert' | 'device_status' | 'system_health';
    data: any;
    timestamp: Date;
    farmId?: string;
    sensorId?: string;
}
export declare class DashboardBridge extends EventEmitter {
    private io;
    private database;
    private mqttService;
    private sensorManager;
    private connectedClients;
    private subscriptions;
    private isRunning;
    constructor(io: Server, database: LocalDatabase, mqttService: MQTTService, sensorManager: SensorManager);
    start(): Promise<void>;
    stop(): Promise<void>;
    private setupSocketHandlers;
    private handleClientAuth;
    private handleFarmSubscription;
    private handleSensorSubscription;
    private handleDashboardQuery;
    private handleDeviceCommand;
    private handleClientDisconnect;
    private setupDataStreams;
    private broadcastSensorUpdate;
    private broadcastAlert;
    private broadcastSystemStatus;
    private handleMQTTMessage;
    private getSensorData;
    private getAlerts;
    private getFarmStatus;
    private getSystemHealth;
    private hasAccess;
    private getActiveSensors;
    private getActiveAlerts;
    private validateAuthToken;
    private startHealthMonitoring;
    getStatus(): any;
    disconnectClient(clientId: string): void;
    broadcastToFarm(farmId: string, message: any): void;
    broadcastToAll(message: any): void;
}
//# sourceMappingURL=dashboardBridge.d.ts.map