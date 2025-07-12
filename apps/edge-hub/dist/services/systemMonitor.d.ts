import { EventEmitter } from 'events';
import { LocalDatabase } from '../database/localDatabase';
export interface SystemMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        temperature?: number;
        cores: number;
        load: number[];
    };
    memory: {
        total: number;
        used: number;
        free: number;
        usage: number;
    };
    disk: {
        total: number;
        used: number;
        free: number;
        usage: number;
    };
    network: {
        interfaces: NetworkInterface[];
        connectivity: boolean;
    };
    services: {
        [serviceName: string]: ServiceStatus;
    };
    system: {
        uptime: number;
        platform: string;
        arch: string;
        hostname: string;
        loadAverage: number[];
    };
}
export interface NetworkInterface {
    name: string;
    address: string;
    netmask: string;
    family: string;
    mac: string;
    internal: boolean;
    cidr: string;
    status: 'up' | 'down';
}
export interface ServiceStatus {
    name: string;
    status: 'running' | 'stopped' | 'error' | 'unknown';
    pid?: number;
    uptime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    lastCheck: Date;
    error?: string;
}
export interface HealthThresholds {
    cpu: {
        warning: number;
        critical: number;
    };
    memory: {
        warning: number;
        critical: number;
    };
    disk: {
        warning: number;
        critical: number;
    };
    temperature: {
        warning: number;
        critical: number;
    };
}
export interface HealthAlert {
    type: 'cpu' | 'memory' | 'disk' | 'temperature' | 'service' | 'network';
    level: 'warning' | 'critical';
    message: string;
    value: number;
    threshold: number;
    timestamp: Date;
    resolved: boolean;
}
export declare class SystemMonitor extends EventEmitter {
    private database;
    private thresholds;
    private isRunning;
    private monitorInterval;
    private alertHistory;
    private services;
    constructor(database: LocalDatabase, thresholds?: Partial<HealthThresholds>);
    start(): Promise<void>;
    stop(): Promise<void>;
    private collectMetrics;
    private getCPUMetrics;
    private getMemoryMetrics;
    private getDiskMetrics;
    private parseSize;
    private getNetworkMetrics;
    private checkInterfaceStatus;
    private checkConnectivity;
    private getServiceMetrics;
    private checkServiceStatus;
    private getSystemMetrics;
    private checkThresholds;
    private createAlert;
    private processAlert;
    private resolveInactiveAlerts;
    private storeMetrics;
    getLatestMetrics(): Promise<SystemMetrics | null>;
    getMetricsHistory(hours?: number): Promise<SystemMetrics[]>;
    getThresholds(): HealthThresholds;
    updateThresholds(thresholds: Partial<HealthThresholds>): void;
    addService(serviceName: string): void;
    removeService(serviceName: string): void;
    isActive(): boolean;
    getSystemInfo(): Promise<any>;
}
//# sourceMappingURL=systemMonitor.d.ts.map