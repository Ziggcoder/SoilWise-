import { EventEmitter } from 'events';
export interface CaptureOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png';
    deviceId?: string;
}
export interface CaptureResult {
    id: string;
    deviceId: string;
    imageData: Buffer;
    metadata: {
        timestamp: Date;
        width: number;
        height: number;
        format: string;
        size: number;
        location?: {
            lat: number;
            lng: number;
        };
    };
    analysis?: {
        objects: Array<{
            label: string;
            confidence: number;
            bbox: [number, number, number, number];
        }>;
        diseases: Array<{
            type: string;
            confidence: number;
            severity: 'low' | 'medium' | 'high';
        }>;
        cropHealth: {
            overall: number;
            leafColor: string;
            growthStage: string;
        };
    };
}
export declare class CameraService extends EventEmitter {
    private config;
    private devices;
    private isInitialized;
    private captureQueue;
    private processingQueue;
    constructor();
    initialize(): Promise<void>;
    private detectCameras;
    private initializeDevices;
    private initializeDevice;
    private loadVisionModels;
    capturePhoto(options?: CaptureOptions): Promise<CaptureResult>;
    private performCapture;
    private captureFromDevice;
    private shouldAnalyzeImage;
    private analyzeImage;
    private detectObjects;
    private detectDiseases;
    private analyzeCropHealth;
    private getDefaultDevice;
    private processQueue;
    getDevices(): Promise<Array<{
        id: string;
        name: string;
        status: string;
    }>>;
    testDevice(deviceId: string): Promise<boolean>;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=cameraService.d.ts.map