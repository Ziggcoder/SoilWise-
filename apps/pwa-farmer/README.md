# PWA Farmer App - SoilWise Platform

## 🚀 Overview

The PWA Farmer App is an offline-first Progressive Web Application designed specifically for farmers working in remote areas with limited internet connectivity. It provides essential farming tools, sensor data access, and AI-powered recommendations that work seamlessly offline.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                PWA Farmer App (React PWA)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Field Data    │  │   Sensor        │  │   Camera &  │ │
│  │   Collection    │  │   Monitoring    │  │   Photos    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Offline       │  │   AI Advisory   │  │   Voice     │ │
│  │   Sync          │  │   (Cached)      │  │   Notes     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Service       │  │   Local         │  │   Background│ │
│  │   Worker        │  │   Storage       │  │   Sync      │ │
│  │   (Caching)     │  │   (IndexedDB)   │  │   (PWA)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📱 PWA Features

### Core PWA Capabilities
- **📱 App-like Experience** - Installable on mobile devices
- **🚫 Offline Functionality** - Works without internet connection
- **🔄 Background Sync** - Syncs data when connectivity returns
- **📸 Camera Integration** - Capture field photos and notes
- **🎙️ Voice Recording** - Record voice notes and observations
- **🔔 Push Notifications** - Receive alerts and reminders
- **📍 GPS Integration** - Location-based field mapping

### Offline-First Design
- **🗄️ Local Database** - SQLite/IndexedDB for data storage
- **🎯 Smart Caching** - Critical data cached for offline use
- **🔄 Conflict Resolution** - Handles data conflicts when syncing
- **📊 Offline Analytics** - Basic analytics work offline
- **🎨 Cached UI** - Complete UI cached for offline use

## 🔧 Technology Stack

- **React 18** - UI library with concurrent features
- **TypeScript** - Static typing for reliability
- **Vite** - Fast build tool and development server
- **PWA Plugin** - Service worker and manifest generation
- **Tailwind CSS** - Mobile-first CSS framework
- **React Query** - Server state management with offline support
- **Dexie.js** - IndexedDB wrapper for local storage
- **Workbox** - Service worker library for caching strategies
- **React Hook Form** - Form management with validation
- **React Router** - Client-side routing
- **Capacitor** - Optional native mobile app features

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── field/          # Field management components
│   │   ├── FieldMap.tsx
│   │   ├── FieldForm.tsx
│   │   ├── CropTracker.tsx
│   │   └── HarvestLog.tsx
│   ├── sensors/        # Sensor components
│   │   ├── SensorList.tsx
│   │   ├── SensorCard.tsx
│   │   └── SensorChart.tsx
│   ├── offline/        # Offline-specific components
│   │   ├── OfflineIndicator.tsx
│   │   ├── SyncStatus.tsx
│   │   └── ConflictResolver.tsx
│   ├── camera/         # Camera components
│   │   ├── CameraCapture.tsx
│   │   ├── PhotoGallery.tsx
│   │   └── PhotoAnnotation.tsx
│   └── ui/             # Basic UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Fields.tsx
│   ├── Sensors.tsx
│   ├── Photos.tsx
│   ├── Notes.tsx
│   └── Sync.tsx
├── hooks/              # Custom React hooks
│   ├── useOfflineSync.ts
│   ├── useCamera.ts
│   ├── useGPS.ts
│   └── useFieldData.ts
├── services/           # Services and utilities
│   ├── database.ts     # IndexedDB/SQLite setup
│   ├── syncService.ts  # Data synchronization
│   ├── cameraService.ts # Camera operations
│   ├── gpsService.ts   # GPS and location services
│   └── apiService.ts   # API client with offline support
├── workers/            # Service worker and web workers
│   ├── sw.ts           # Service worker
│   ├── syncWorker.ts   # Background sync worker
│   └── aiWorker.ts     # AI processing worker
├── store/              # State management
│   ├── offlineStore.ts # Offline data store
│   ├── syncStore.ts    # Sync state management
│   └── cacheStore.ts   # Cache management
├── utils/              # Utility functions
│   ├── offlineUtils.ts # Offline detection and handling
│   ├── syncUtils.ts    # Sync conflict resolution
│   └── storageUtils.ts # Local storage helpers
├── types/              # TypeScript types
│   ├── field.ts
│   ├── sensor.ts
│   ├── photo.ts
│   └── sync.ts
├── App.tsx             # Main app component
├── main.tsx           # Entry point
├── sw.ts              # Service worker
└── manifest.json      # PWA manifest
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Development Setup

1. **Navigate to the PWA app directory:**
```bash
cd apps/pwa-farmer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server:**
```bash
npm run dev
```

The PWA will be available at `http://localhost:5179`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
npm run sw:generate  # Generate service worker
```

## 📱 PWA Configuration

### Manifest Configuration
```json
{
  "name": "SoilWise Farmer",
  "short_name": "SoilWise",
  "description": "Offline-first farming assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "business"],
  "orientation": "portrait-primary"
}
```

### Service Worker
```typescript
// Service worker for caching and offline functionality
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache API responses
registerRoute(
  ({ request }) => request.url.includes('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          return `${request.url}?v=${Date.now()}`;
        },
      },
    ],
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      {
        cacheExpiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    ],
  })
);
```

## 🗄️ Offline Data Management

### IndexedDB Database Setup
```typescript
// Database schema using Dexie.js
import Dexie, { Table } from 'dexie';

export interface Field {
  id?: number;
  name: string;
  location: { lat: number; lng: number };
  size: number;
  cropType: string;
  plantingDate: Date;
  synced: boolean;
  lastModified: Date;
}

export interface SensorReading {
  id?: number;
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
  synced: boolean;
}

export interface Photo {
  id?: number;
  fieldId: number;
  imageData: string;
  caption: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
  synced: boolean;
}

class FarmerDatabase extends Dexie {
  fields!: Table<Field>;
  sensorReadings!: Table<SensorReading>;
  photos!: Table<Photo>;
  notes!: Table<Note>;

  constructor() {
    super('FarmerDatabase');
    this.version(1).stores({
      fields: '++id, name, cropType, synced, lastModified',
      sensorReadings: '++id, sensorId, timestamp, synced',
      photos: '++id, fieldId, timestamp, synced',
      notes: '++id, fieldId, timestamp, synced'
    });
  }
}

export const db = new FarmerDatabase();
```

### Sync Service
```typescript
// Background sync service
export class SyncService {
  private isOnline = navigator.onLine;
  private syncQueue: SyncItem[] = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async syncFieldData(field: Field) {
    if (this.isOnline) {
      try {
        const response = await api.post('/fields', field);
        await db.fields.update(field.id!, { synced: true });
        return response.data;
      } catch (error) {
        this.addToSyncQueue('field', field);
        throw error;
      }
    } else {
      this.addToSyncQueue('field', field);
    }
  }

  private addToSyncQueue(type: string, data: any) {
    this.syncQueue.push({ type, data, timestamp: Date.now() });
  }

  private async processSyncQueue() {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const item = this.syncQueue.shift();
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error('Sync failed:', error);
        // Re-add to queue for retry
        this.syncQueue.unshift(item);
        break;
      }
    }
  }
}
```

## 📸 Camera Integration

### Camera Capture Component
```typescript
// Camera capture with photo annotation
const CameraCapture: React.FC<Props> = ({ onCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataURL);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const savePhoto = async (caption: string) => {
    if (photoData) {
      const location = await getCurrentLocation();
      const photo: Photo = {
        fieldId: selectedField.id,
        imageData: photoData,
        caption,
        timestamp: new Date(),
        location,
        synced: false
      };
      
      await db.photos.add(photo);
      onCapture(photo);
    }
  };

  return (
    <div className="camera-capture">
      {isCapturing ? (
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline className="w-full" />
          <button
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4"
          >
            <Camera size={24} />
          </button>
        </div>
      ) : photoData ? (
        <PhotoAnnotation
          imageData={photoData}
          onSave={savePhoto}
          onRetake={() => setPhotoData(null)}
        />
      ) : (
        <button
          onClick={startCamera}
          className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg"
        >
          <Camera size={48} className="mx-auto mb-4" />
          <p>Tap to capture photo</p>
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
```

## 🎙️ Voice Notes

### Voice Recording Component
```typescript
// Voice recording with speech-to-text
const VoiceRecorder: React.FC<Props> = ({ onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start speech recognition
      startSpeechRecognition();
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };
      
      recognition.start();
    }
  };

  const saveNote = async () => {
    if (audioBlob && transcript) {
      const location = await getCurrentLocation();
      const note: Note = {
        fieldId: selectedField.id,
        audioData: await blobToBase64(audioBlob),
        transcript,
        timestamp: new Date(),
        location,
        synced: false
      };
      
      await db.notes.add(note);
      onSave(note);
    }
  };

  return (
    <div className="voice-recorder">
      <div className="text-center mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-8 rounded-full ${
            isRecording ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}
        >
          {isRecording ? <Square size={32} /> : <Mic size={32} />}
        </button>
      </div>
      
      {transcript && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Transcript:</p>
          <p>{transcript}</p>
        </div>
      )}
      
      {audioBlob && (
        <div className="mb-4">
          <audio controls className="w-full">
            <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
          </audio>
          <button
            onClick={saveNote}
            className="mt-2 w-full bg-green-500 text-white py-2 px-4 rounded"
          >
            Save Note
          </button>
        </div>
      )}
    </div>
  );
};
```

## 🗺️ GPS and Location Services

### GPS Service
```typescript
// GPS service for location tracking
export class GPSService {
  private watchId: number | null = null;
  private currentLocation: GeolocationPosition | null = null;

  async getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = position;
          resolve(position);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  startLocationTracking(callback: (position: GeolocationPosition) => void) {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocation = position;
          callback(position);
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    }
  }

  stopLocationTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

## 🔄 Offline Sync Strategies

### Conflict Resolution
```typescript
// Conflict resolution for offline sync
export class ConflictResolver {
  static resolveFieldConflict(local: Field, remote: Field): Field {
    // Last-write-wins strategy with some field-specific logic
    if (local.lastModified > remote.lastModified) {
      return {
        ...local,
        id: remote.id, // Keep server ID
        synced: true
      };
    }
    
    // Merge specific fields that don't conflict
    return {
      ...remote,
      // Keep local photos and notes if they're newer
      photos: local.photos?.length > remote.photos?.length ? local.photos : remote.photos,
      synced: true
    };
  }

  static async resolvePhotoConflict(local: Photo, remote: Photo): Promise<Photo> {
    // Photos are typically unique, so we keep both
    if (local.timestamp !== remote.timestamp) {
      // Different photos, keep both
      return local;
    }
    
    // Same photo, prefer the one with caption
    return local.caption ? local : remote;
  }

  static resolveSensorDataConflict(local: SensorReading, remote: SensorReading): SensorReading {
    // Sensor data is immutable, prefer server version
    return remote;
  }
}
```

### Background Sync
```typescript
// Background sync using service worker
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    const pendingItems = await db.getPendingSyncItems();
    
    for (const item of pendingItems) {
      switch (item.type) {
        case 'field':
          await syncField(item.data);
          break;
        case 'photo':
          await syncPhoto(item.data);
          break;
        case 'note':
          await syncNote(item.data);
          break;
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
```

## 🎯 Key Features

### 1. Field Management
- **Field Mapping** - GPS-based field boundary mapping
- **Crop Tracking** - Planting, growth, and harvest tracking
- **Photo Documentation** - Visual field condition records
- **Note Taking** - Voice and text notes with location tagging

### 2. Sensor Monitoring
- **Real-time Data** - Live sensor readings when online
- **Offline Viewing** - Cached sensor data for offline viewing
- **Historical Charts** - Trend analysis and historical data
- **Alert Management** - Offline alert storage and sync

### 3. Data Collection
- **Photo Capture** - High-quality field photos with metadata
- **Voice Recording** - Voice notes with speech-to-text
- **Manual Entry** - Form-based data entry with validation
- **GPS Tagging** - Automatic location tagging for all records

### 4. Offline Intelligence
- **Cached AI Advice** - Pre-downloaded AI recommendations
- **Offline Analytics** - Basic analytics without internet
- **Smart Caching** - Intelligent data caching strategies
- **Conflict Resolution** - Automatic conflict resolution on sync

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:8081
VITE_WS_URL=ws://localhost:8081

# PWA Configuration
VITE_PWA_NAME=SoilWise Farmer
VITE_PWA_SHORT_NAME=SoilWise
VITE_PWA_DESCRIPTION=Offline-first farming assistant

# Features
VITE_ENABLE_CAMERA=true
VITE_ENABLE_GPS=true
VITE_ENABLE_VOICE=true
VITE_ENABLE_OFFLINE_AI=true

# Sync Configuration
VITE_SYNC_INTERVAL=300000
VITE_MAX_OFFLINE_DAYS=7
VITE_MAX_PHOTO_SIZE=5242880
```

### Workbox Configuration
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.soilwise\.com\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ]
});
```

## 📱 Mobile-First Design

### Responsive Layout
```css
/* Mobile-first CSS */
.field-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .field-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .field-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Touch Interactions
```typescript
// Touch-friendly interactions
const TouchButton: React.FC<Props> = ({ children, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className={`touch-button ${isPressed ? 'pressed' : ''}`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      onClick={onPress}
    >
      {children}
    </button>
  );
};
```

## 🧪 Testing

### PWA Testing
```typescript
// PWA functionality tests
describe('PWA Features', () => {
  it('should work offline', async () => {
    // Simulate offline mode
    await page.setOfflineMode(true);
    
    // Navigate to app
    await page.goto('http://localhost:5179');
    
    // Verify app loads
    expect(await page.title()).toBe('SoilWise Farmer');
    expect(await page.isVisible('.offline-indicator')).toBe(true);
  });

  it('should cache data locally', async () => {
    const fieldData = { name: 'Test Field', size: 5 };
    
    // Add data while online
    await page.evaluate(async (data) => {
      await window.db.fields.add(data);
    }, fieldData);
    
    // Go offline
    await page.setOfflineMode(true);
    
    // Verify data is still accessible
    const storedData = await page.evaluate(() => 
      window.db.fields.toArray()
    );
    
    expect(storedData).toContainEqual(
      expect.objectContaining(fieldData)
    );
  });
});
```

### Service Worker Testing
```typescript
// Service worker tests
describe('Service Worker', () => {
  it('should cache resources', async () => {
    const cache = await caches.open('soilwise-cache');
    const response = await cache.match('/');
    expect(response).toBeTruthy();
  });

  it('should handle background sync', async () => {
    // Simulate background sync event
    const syncEvent = new SyncEvent('sync', { tag: 'background-sync' });
    await self.dispatchEvent(syncEvent);
    
    // Verify sync was processed
    const pendingItems = await db.getPendingSyncItems();
    expect(pendingItems.length).toBe(0);
  });
});
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Fields = lazy(() => import('./pages/Fields'));
const Photos = lazy(() => import('./pages/Photos'));

// Feature-based splitting
const CameraCapture = lazy(() => import('./components/camera/CameraCapture'));
```

### Image Optimization
```typescript
// Image compression for photos
const compressImage = async (file: File, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const maxSize = 1024;
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

## 🔒 Security

### Data Encryption
```typescript
// Encrypt sensitive data in local storage
import CryptoJS from 'crypto-js';

const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### Secure Storage
```typescript
// Secure local storage wrapper
class SecureStorage {
  private static key = 'user-encryption-key';
  
  static setItem(key: string, value: any): void {
    const encrypted = encryptData(JSON.stringify(value), this.key);
    localStorage.setItem(key, encrypted);
  }
  
  static getItem(key: string): any {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      const decrypted = decryptData(encrypted, this.key);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }
}
```

## 🤝 Contributing

1. Follow the main project's [Contributing Guidelines](../../CONTRIBUTING.md)
2. Test offline functionality thoroughly
3. Ensure PWA features work correctly
4. Add tests for new offline features
5. Update documentation for PWA-specific changes

## 📚 Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Main Project Documentation](../../docs/README.md)
