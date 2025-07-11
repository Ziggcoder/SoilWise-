# Contributing to SoilWise

🌾 Thank you for your interest in contributing to SoilWise! This document provides guidelines and information for contributing to our agriculture SaaS platform.

## 🤝 How to Contribute

### Ways to Contribute
- **Bug Reports** - Report bugs and issues
- **Feature Requests** - Suggest new features
- **Code Contributions** - Submit pull requests
- **Documentation** - Improve documentation
- **Testing** - Help with testing and QA
- **Hardware Integration** - Add sensor support
- **Translations** - Internationalization support

## 🚀 Getting Started

### 1. Development Setup
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/soilwise.git
cd soilwise

# Add upstream remote
git remote add upstream https://github.com/original-org/soilwise.git

# Install dependencies
npm install

# Start development
npm run dev
```

### 2. Development Environment
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Docker (if using containers)

### 3. Project Structure
```
soilwise/
├── apps/
│   ├── web-dashboard/     # React dashboard
│   ├── pwa-farmer/       # PWA application
│   ├── api-server/       # Node.js API
│   └── edge-hub/         # Edge computing
├── packages/
│   ├── ai-services/      # AI/ML services
│   └── voice-assistant/  # Voice processing
├── docs/                 # Documentation
├── scripts/             # Build and deployment scripts
└── tests/               # Test files
```

## 🐛 Reporting Bugs

### Before Reporting
1. Check if the bug has already been reported
2. Try to reproduce the issue
3. Test with the latest version
4. Check the troubleshooting guide

### Bug Report Template
```markdown
## Bug Report

**Environment:**
- OS: [e.g. Windows 11, Ubuntu 20.04]
- Node.js: [e.g. 18.15.0]
- Browser: [e.g. Chrome 108]

**Describe the bug:**
A clear description of what the bug is.

**To Reproduce:**
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior:**
What you expected to happen.

**Screenshots:**
If applicable, add screenshots.

**Logs:**
```
Paste relevant logs here
```

**Additional context:**
Any other context about the problem.
```

## 💡 Feature Requests

### Before Requesting
1. Check if the feature has already been requested
2. Consider if it fits the project's scope
3. Think about the implementation complexity

### Feature Request Template
```markdown
## Feature Request

**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like:**
A clear description of what you want to happen.

**Describe alternatives you've considered:**
Any alternative solutions or features you've considered.

**Additional context:**
Any other context or screenshots about the feature request.

**Implementation ideas:**
If you have ideas about how to implement this feature.
```

## 📝 Code Contributions

### Development Workflow

1. **Create a Branch**
```bash
git checkout -b feature/your-feature-name
git checkout -b bugfix/issue-number
git checkout -b docs/update-readme
```

2. **Make Changes**
- Follow the coding standards
- Write tests for new features
- Update documentation
- Keep commits focused and atomic

3. **Test Your Changes**
```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Test specific service
cd apps/api-server
npm run test
```

4. **Commit Your Changes**
```bash
git add .
git commit -m "feat(api): add sensor data validation"
```

5. **Push and Create PR**
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

### Commit Message Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Scopes:**
- `api`: API server changes
- `web`: Web dashboard changes
- `pwa`: PWA application changes
- `edge`: Edge hub changes
- `ai`: AI services changes
- `voice`: Voice assistant changes
- `docs`: Documentation changes

**Examples:**
```
feat(api): add sensor data validation
fix(web): resolve chart rendering issue
docs(readme): update installation instructions
test(edge): add unit tests for sensor manager
```

## 🎨 Code Style

### TypeScript/JavaScript
```typescript
// Use TypeScript for new code
interface SensorData {
  id: string
  type: 'temperature' | 'humidity' | 'soil_moisture'
  value: number
  unit: string
  timestamp: Date
}

// Use consistent naming
const sensorData: SensorData = {
  id: 'sensor_001',
  type: 'temperature',
  value: 25.5,
  unit: '°C',
  timestamp: new Date()
}

// Use async/await instead of promises
async function fetchSensorData(id: string): Promise<SensorData> {
  try {
    const response = await fetch(`/api/sensors/${id}`)
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch sensor data:', error)
    throw error
  }
}
```

### React Components
```tsx
// Use functional components with hooks
import React, { useState, useEffect } from 'react'

interface SensorCardProps {
  sensorId: string
  onDataUpdate?: (data: SensorData) => void
}

export const SensorCard: React.FC<SensorCardProps> = ({ 
  sensorId, 
  onDataUpdate 
}) => {
  const [data, setData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSensorData(sensorId)
      .then(setData)
      .finally(() => setLoading(false))
  }, [sensorId])

  if (loading) return <div>Loading...</div>
  if (!data) return <div>No data</div>

  return (
    <div className="sensor-card">
      <h3>{data.type}</h3>
      <p>{data.value} {data.unit}</p>
    </div>
  )
}
```

### CSS/Styling
```css
/* Use BEM naming convention */
.sensor-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.sensor-card__title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.sensor-card__value {
  font-size: 2rem;
  color: #007bff;
}

.sensor-card--loading {
  opacity: 0.6;
}
```

## 🧪 Testing

### Unit Tests
```typescript
// Use Jest for testing
import { validateSensorData } from './validators'

describe('validateSensorData', () => {
  it('should validate correct sensor data', () => {
    const data = {
      id: 'sensor_001',
      type: 'temperature',
      value: 25.5,
      unit: '°C',
      timestamp: new Date()
    }
    
    expect(validateSensorData(data)).toBe(true)
  })

  it('should reject invalid sensor data', () => {
    const data = {
      id: '',
      type: 'invalid_type',
      value: 'not_a_number',
      unit: '',
      timestamp: 'invalid_date'
    }
    
    expect(validateSensorData(data)).toBe(false)
  })
})
```

### Integration Tests
```typescript
// Test API endpoints
import request from 'supertest'
import app from '../src/app'

describe('Sensor API', () => {
  it('should get sensor data', async () => {
    const response = await request(app)
      .get('/api/v1/sensors/sensor_001')
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('id')
  })

  it('should create sensor data', async () => {
    const sensorData = {
      id: 'sensor_002',
      type: 'humidity',
      value: 60.5,
      unit: '%',
      timestamp: new Date()
    }

    const response = await request(app)
      .post('/api/v1/sensors')
      .send(sensorData)
      .expect(201)

    expect(response.body.success).toBe(true)
  })
})
```

### E2E Tests
```typescript
// Use Playwright for E2E testing
import { test, expect } from '@playwright/test'

test('dashboard loads sensor data', async ({ page }) => {
  await page.goto('http://localhost:3005')
  
  await expect(page.locator('h1')).toContainText('SoilWise Dashboard')
  await expect(page.locator('.sensor-card')).toBeVisible()
  
  const sensorValue = page.locator('.sensor-card__value')
  await expect(sensorValue).toContainText(/\d+(\.\d+)?/)
})
```

## 📚 Documentation

### Documentation Standards
- Use Markdown for documentation
- Include code examples
- Keep documentation up-to-date
- Use clear, concise language
- Include screenshots for UI features

### API Documentation
```typescript
/**
 * Get sensor data by ID
 * @param {string} sensorId - The sensor ID
 * @returns {Promise<SensorData>} The sensor data
 * @throws {Error} If sensor not found
 * 
 * @example
 * const data = await getSensorData('sensor_001')
 * console.log(data.value) // 25.5
 */
async function getSensorData(sensorId: string): Promise<SensorData> {
  // Implementation
}
```

### README Updates
- Keep installation instructions current
- Update feature lists
- Add new configuration options
- Include troubleshooting tips

## 🏗️ Architecture Guidelines

### Service Organization
- Keep services focused and single-purpose
- Use dependency injection
- Implement proper error handling
- Add logging and monitoring

### Database Design
- Use appropriate data types
- Add proper indexes
- Implement migrations
- Consider data retention policies

### API Design
- Follow REST conventions
- Use appropriate HTTP status codes
- Implement proper error responses
- Add request validation

## 🚀 Deployment

### Development Deployment
```bash
# Test your changes locally
npm run dev

# Build and test
npm run build
npm run test

# Test with Docker
docker-compose up -d
```

### Production Considerations
- Environment configuration
- Security best practices
- Performance optimization
- Monitoring and logging
- Backup strategies

## 📋 Pull Request Process

### Before Submitting
1. Test your changes thoroughly
2. Update documentation
3. Run linting and tests
4. Write meaningful commit messages
5. Keep PRs focused and small

### PR Template
```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)
```

### Review Process
1. **Automated Checks** - CI/CD pipeline runs tests
2. **Code Review** - Team members review code
3. **Testing** - Changes are tested in staging
4. **Approval** - Maintainers approve changes
5. **Merge** - Changes are merged to main branch

## 🛡️ Security

### Security Guidelines
- Never commit sensitive data
- Use environment variables for configuration
- Implement proper authentication
- Validate all user inputs
- Keep dependencies updated

### Reporting Security Issues
- Do not open public issues for security vulnerabilities
- Email security@soilwise.com
- Provide detailed information
- Allow time for investigation

## 📞 Community

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat (coming soon)
- **Email** - contribute@soilwise.com

### Code of Conduct
- Be respectful and inclusive
- Focus on what's best for the community
- Show empathy towards other contributors
- Use welcoming and inclusive language

## 🎯 Contribution Areas

### High Priority
- Hardware sensor integration
- Mobile PWA improvements
- AI model optimization
- Documentation updates
- Test coverage improvement

### Medium Priority
- UI/UX enhancements
- Performance optimizations
- Additional language support
- Third-party integrations

### Good First Issues
- Documentation fixes
- Simple bug fixes
- Code cleanup
- Test additions
- Translation updates

## 📈 Recognition

### Contributors
- All contributors are listed in CONTRIBUTORS.md
- Significant contributions are highlighted in releases
- Regular contributors may be invited to join the team

### Rewards
- Contributor badge on GitHub
- Early access to new features
- Invitation to contributor events
- Potential job opportunities

## 📞 Getting Help

### Development Help
- Check the Developer Guide
- Review existing code
- Ask questions in discussions
- Join community channels

### Stuck on Something?
- Review troubleshooting guide
- Check GitHub issues
- Ask in discussions
- Email contribute@soilwise.com

## 📅 Release Process

### Version Numbering
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

### Release Schedule
- **Major releases**: Quarterly
- **Minor releases**: Monthly
- **Patch releases**: As needed

Thank you for contributing to SoilWise! Your contributions help make agriculture more sustainable and efficient. 🌱
