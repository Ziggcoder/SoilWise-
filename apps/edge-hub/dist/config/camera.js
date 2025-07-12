"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCameraConfig = void 0;
const getCameraConfig = () => {
    return {
        enabled: process.env.CAMERA_ENABLED === 'true',
        device: process.env.CAMERA_DEVICE || '/dev/video0',
        resolution: {
            width: parseInt(process.env.CAMERA_WIDTH || '1920'),
            height: parseInt(process.env.CAMERA_HEIGHT || '1080')
        },
        frameRate: parseInt(process.env.CAMERA_FPS || '30'),
        format: process.env.CAMERA_FORMAT || 'MJPEG',
        captureInterval: parseInt(process.env.CAMERA_INTERVAL || '300000'),
        storageDir: process.env.CAMERA_STORAGE || './data/photos',
        maxFiles: parseInt(process.env.CAMERA_MAX_FILES || '1000'),
        aiAnalysis: process.env.CAMERA_AI_ANALYSIS !== 'false'
    };
};
exports.getCameraConfig = getCameraConfig;
//# sourceMappingURL=camera.js.map