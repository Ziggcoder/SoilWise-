# Web Dashboard - SoilWise Platform

## 🚀 Overview

The Web Dashboard is a React-based single-page application that provides a comprehensive interface for managing farms, monitoring sensor data, and accessing AI-powered agricultural insights. It serves as the main control center for the SoilWise platform.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Web Dashboard (React SPA)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Dashboard     │  │   Sensor        │  │   Farm      │ │
│  │   Components    │  │   Management    │  │   Management│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Charts &      │  │   Real-time     │  │   AI        │ │
│  │   Analytics     │  │   Data          │  │   Advisory  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   State         │  │   API           │  │   WebSocket │ │
│  │   Management    │  │   Services      │  │   Client    │ │
│  │   (Redux)       │  │   (Axios)       │  │   (Socket.io)│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

- **React 18** - UI library with hooks and concurrent features
- **TypeScript** - Static typing for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Chart.js** - Data visualization
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Headless UI** - Unstyled, accessible UI components

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   │   ├── SensorGrid.tsx
│   │   ├── WeatherWidget.tsx
│   │   ├── AlertPanel.tsx
│   │   └── FarmOverview.tsx
│   ├── charts/          # Chart components
│   │   ├── TimeSeriesChart.tsx
│   │   ├── HeatmapChart.tsx
│   │   ├── GaugeChart.tsx
│   │   └── BarChart.tsx
│   ├── forms/           # Form components
│   │   ├── SensorForm.tsx
│   │   ├── FarmForm.tsx
│   │   └── AlertForm.tsx
│   ├── layout/          # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   └── ui/              # Basic UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── pages/               # Page components
│   ├── Dashboard.tsx
│   ├── Sensors.tsx
│   ├── Farms.tsx
│   ├── Analytics.tsx
│   ├── Alerts.tsx
│   └── Settings.tsx
├── hooks/               # Custom React hooks
│   ├── useWebSocket.ts
│   ├── useSensorData.ts
│   ├── useFarms.ts
│   └── useAuth.ts
├── services/            # API and external services
│   ├── api.ts           # API client configuration
│   ├── sensorService.ts # Sensor-related API calls
│   ├── farmService.ts   # Farm-related API calls
│   ├── alertService.ts  # Alert-related API calls
│   └── websocket.ts     # WebSocket service
├── store/               # Redux store configuration
│   ├── index.ts         # Store setup
│   ├── slices/          # Redux slices
│   │   ├── sensorSlice.ts
│   │   ├── farmSlice.ts
│   │   ├── alertSlice.ts
│   │   └── authSlice.ts
│   └── selectors/       # Redux selectors
│       ├── sensorSelectors.ts
│       └── farmSelectors.ts
├── utils/               # Utility functions
│   ├── formatters.ts    # Data formatting utilities
│   ├── validators.ts    # Form validation
│   ├── constants.ts     # Application constants
│   └── helpers.ts       # General helpers
├── types/               # TypeScript type definitions
│   ├── sensor.ts
│   ├── farm.ts
│   ├── alert.ts
│   └── api.ts
├── styles/              # Global styles
│   ├── globals.css
│   └── components.css
├── App.tsx              # Main app component
├── main.tsx            # Entry point
└── vite-env.d.ts       # Vite type definitions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Development Setup

1. **Navigate to the web dashboard directory:**
```bash
cd apps/web-dashboard
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

The dashboard will be available at `http://localhost:3005`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run lint         # Lint code
npm run type-check   # Run TypeScript type checking
```

## 🎨 UI Components

### Dashboard Layout
```jsx
// Main layout component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};
```

### Sensor Grid
```jsx
// Sensor grid component
const SensorGrid = () => {
  const { sensors, loading } = useSensorData();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sensors.map(sensor => (
        <SensorCard key={sensor.id} sensor={sensor} />
      ))}
    </div>
  );
};
```

### Real-time Chart
```jsx
// Time series chart component
const TimeSeriesChart = ({ data, title }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            }
          }
        }
      }
    });
    
    return () => chart.destroy();
  }, [data]);
  
  return <canvas ref={chartRef} />;
};
```

## 📊 Data Management

### State Management with Redux
```typescript
// Sensor slice
const sensorSlice = createSlice({
  name: 'sensors',
  initialState: {
    sensors: [],
    loading: false,
    error: null
  },
  reducers: {
    setSensors: (state, action) => {
      state.sensors = action.payload;
    },
    addSensor: (state, action) => {
      state.sensors.push(action.payload);
    },
    updateSensor: (state, action) => {
      const index = state.sensors.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sensors[index] = action.payload;
      }
    }
  }
});
```

### API Services
```typescript
// Sensor service
export const sensorService = {
  async getAllSensors() {
    const response = await api.get('/sensors');
    return response.data;
  },
  
  async getSensorById(id: string) {
    const response = await api.get(`/sensors/${id}`);
    return response.data;
  },
  
  async createSensor(sensor: CreateSensorDto) {
    const response = await api.post('/sensors', sensor);
    return response.data;
  }
};
```

### Real-time Data with WebSocket
```typescript
// WebSocket hook
export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const newSocket = io('http://localhost:8081');
    
    newSocket.on('sensor_data', (data) => {
      dispatch(updateSensorData(data));
    });
    
    newSocket.on('alert_created', (alert) => {
      dispatch(addAlert(alert));
    });
    
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, [dispatch]);
  
  return socket;
};
```

## 🎯 Key Features

### 1. Real-time Dashboard
- **Live sensor data** with auto-refresh
- **Interactive charts** with zoom and pan
- **Alert notifications** with sound and visual indicators
- **Multi-farm view** with farm switching

### 2. Sensor Management
- **Add/edit sensors** with form validation
- **Sensor calibration** and configuration
- **Historical data** visualization
- **Sensor health monitoring**

### 3. Farm Management
- **Farm setup** with location mapping
- **Crop planning** and rotation tracking
- **Irrigation scheduling**
- **Harvest planning** and tracking

### 4. Analytics & Insights
- **Trend analysis** with statistical insights
- **Comparative analytics** across farms
- **Predictive modeling** for yield optimization
- **Report generation** with export options

### 5. Alert System
- **Configurable thresholds** for all sensors
- **Multiple notification channels** (web, email, SMS)
- **Alert history** and acknowledgment
- **Escalation rules** for critical alerts

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:8081
VITE_WS_URL=ws://localhost:8081

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE_CONTROL=true
VITE_ENABLE_OFFLINE_MODE=true

# External Services
VITE_MAPS_API_KEY=your-maps-api-key
VITE_WEATHER_API_KEY=your-weather-api-key

# Development
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

## 📱 Responsive Design

### Mobile-First Approach
```jsx
// Responsive grid layout
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {sensors.map(sensor => (
    <SensorCard key={sensor.id} sensor={sensor} />
  ))}
</div>
```

### Breakpoint Usage
- **xs**: 0-640px (Mobile)
- **sm**: 641-768px (Large Mobile)
- **md**: 769-1024px (Tablet)
- **lg**: 1025-1280px (Desktop)
- **xl**: 1281px+ (Large Desktop)

## 🧪 Testing

### Unit Tests with Vitest
```typescript
// Component test example
describe('SensorCard', () => {
  it('renders sensor data correctly', () => {
    const sensor = {
      id: 'sensor-1',
      name: 'Soil Moisture',
      value: 45.5,
      unit: '%'
    };
    
    render(<SensorCard sensor={sensor} />);
    
    expect(screen.getByText('Soil Moisture')).toBeInTheDocument();
    expect(screen.getByText('45.5%')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// API integration test
describe('Sensor API Integration', () => {
  it('fetches sensor data successfully', async () => {
    const sensors = await sensorService.getAllSensors();
    expect(sensors).toBeDefined();
    expect(Array.isArray(sensors)).toBe(true);
  });
});
```

### E2E Tests with Cypress
```typescript
// E2E test example
describe('Dashboard', () => {
  it('displays sensor data on dashboard', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy=sensor-grid]').should('be.visible');
    cy.get('[data-cy=sensor-card]').should('have.length.greaterThan', 0);
  });
});
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sensors = lazy(() => import('./pages/Sensors'));
const Farms = lazy(() => import('./pages/Farms'));

// Component lazy loading
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/sensors" element={<Sensors />} />
    <Route path="/farms" element={<Farms />} />
  </Routes>
</Suspense>
```

### Memoization
```typescript
// Memoized components
const SensorCard = memo(({ sensor }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3>{sensor.name}</h3>
      <p>{sensor.value}{sensor.unit}</p>
    </div>
  );
});

// Memoized selectors
const selectSensorsByFarm = createSelector(
  [selectAllSensors, (state, farmId) => farmId],
  (sensors, farmId) => sensors.filter(s => s.farmId === farmId)
);
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check bundle size
npm run bundle-size
```

## 🛠️ Development Guidelines

### Component Structure
```typescript
// Standard component structure
interface Props {
  sensor: Sensor;
  onUpdate?: (sensor: Sensor) => void;
}

const SensorCard: React.FC<Props> = ({ sensor, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = useCallback((updatedSensor: Sensor) => {
    onUpdate?.(updatedSensor);
    setIsEditing(false);
  }, [onUpdate]);
  
  return (
    <div className="sensor-card">
      {/* Component content */}
    </div>
  );
};

export default SensorCard;
```

### Custom Hooks
```typescript
// Custom hook for sensor data
export const useSensorData = (farmId?: string) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        setLoading(true);
        const data = await sensorService.getAllSensors(farmId);
        setSensors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSensors();
  }, [farmId]);
  
  return { sensors, loading, error };
};
```

## 🎨 UI/UX Design System

### Color Palette
```css
/* Primary colors */
--primary-50: #f0f9ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Secondary colors */
--secondary-50: #f8fafc;
--secondary-500: #64748b;
--secondary-600: #475569;

/* Status colors */
--success-500: #10b981;
--warning-500: #f59e0b;
--error-500: #ef4444;
```

### Typography
```css
/* Font families */
--font-sans: 'Inter', sans-serif;
--font-mono: 'Fira Code', monospace;

/* Font sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
```

### Spacing
```css
/* Spacing scale */
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;
```

## 🔒 Security Considerations

### Input Validation
```typescript
// Form validation with React Hook Form
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  value: yup.number().required('Value is required').positive(),
  unit: yup.string().required('Unit is required')
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema)
});
```

### XSS Prevention
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input);
};
```

### CSRF Protection
```typescript
// CSRF token handling
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: {
    'X-CSRF-Token': getCsrfToken()
  }
});
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment-specific Builds
```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

## 📊 Analytics and Monitoring

### Performance Monitoring
```typescript
// Performance tracking
const trackPerformance = (metric: string, value: number) => {
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metric,
      value: value
    });
  }
};

// Component performance
const SensorCard = ({ sensor }) => {
  useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      trackPerformance('sensor_card_render', end - start);
    };
  }, []);
  
  return <div>...</div>;
};
```

### Error Boundary
```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

## 🤝 Contributing

1. Follow the main project's [Contributing Guidelines](../../CONTRIBUTING.md)
2. Use TypeScript for all new components
3. Follow the established component structure
4. Add tests for new features
5. Update documentation for significant changes
6. Use semantic commit messages

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide)
- [Main Project Documentation](../../docs/README.md)
