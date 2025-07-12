export interface CameraConfig {
    enabled: boolean;
    device: string;
    resolution: {
        width: number;
        height: number;
    };
    frameRate: number;
    format: string;
    captureInterval: number;
    storageDir: string;
    maxFiles: number;
    aiAnalysis: boolean;
}
export declare const getCameraConfig: () => CameraConfig;
//# sourceMappingURL=camera.d.ts.map