#!/bin/bash

# =============================================================================
# SoilWise Development Setup Script
# =============================================================================

set -e

echo "🌾 Setting up SoilWise Agriculture SaaS Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running on supported OS
check_os() {
    print_step "Checking operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_status "Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_status "macOS detected"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        print_status "Windows detected"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    print_step "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_status "Node.js version: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm version: $(npm --version)"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Install from https://docker.com/"
        print_warning "Some features will not be available without Docker"
    else
        print_status "Docker version: $(docker --version)"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_status "Git version: $(git --version)"
    
    # Check Python (for AI services)
    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 is not installed. AI services may not work properly."
    else
        print_status "Python version: $(python3 --version)"
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing workspace dependencies..."
    npm run build
    
    print_status "Dependencies installed successfully"
}

# Setup environment variables
setup_environment() {
    print_step "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        
        # Generate random secrets
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
        ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
        SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
        
        # Replace placeholder values
        sed -i.bak "s/your_jwt_secret_here/$JWT_SECRET/g" .env
        sed -i.bak "s/your_encryption_key_here/$ENCRYPTION_KEY/g" .env
        sed -i.bak "s/your_session_secret_here/$SESSION_SECRET/g" .env
        
        rm .env.bak 2>/dev/null || true
        
        print_status "Environment file created. Please edit .env to add your API keys."
    else
        print_status "Environment file already exists"
    fi
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    if command -v docker &> /dev/null; then
        print_status "Starting PostgreSQL database with Docker..."
        docker-compose up -d postgres
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        # Run migrations
        print_status "Running database migrations..."
        npm run migrate
        
        print_status "Database setup completed"
    else
        print_warning "Docker not available. Please setup PostgreSQL manually."
        print_warning "Connection string: postgresql://admin:password@localhost:5432/soilwise"
    fi
}

# Setup AI services
setup_ai_services() {
    print_step "Setting up AI services..."
    
    if command -v docker &> /dev/null; then
        print_status "Starting AI services with Docker..."
        
        # Start Ollama
        docker-compose up -d ollama
        
        # Wait for Ollama to be ready
        print_status "Waiting for Ollama to be ready..."
        sleep 20
        
        # Pull LLaMA model
        print_status "Pulling LLaMA3 model (this may take a while)..."
        docker-compose exec ollama ollama pull llama3:8b
        
        # Start ChromaDB
        docker-compose up -d chromadb
        
        print_status "AI services setup completed"
    else
        print_warning "Docker not available. Please setup AI services manually."
    fi
}

# Setup voice assistant
setup_voice_assistant() {
    print_step "Setting up voice assistant..."
    
    if command -v python3 &> /dev/null; then
        print_status "Installing Python dependencies for voice assistant..."
        
        # Install Whisper
        pip3 install --user openai-whisper
        
        # Install Coqui TTS
        pip3 install --user coqui-tts
        
        print_status "Voice assistant setup completed"
    else
        print_warning "Python 3 not available. Voice assistant features will be disabled."
    fi
}

# Create development certificates
create_certificates() {
    print_step "Creating development certificates..."
    
    if [ ! -d "certs" ]; then
        mkdir -p certs
        
        # Generate self-signed certificate
        openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=SoilWise/CN=localhost" 2>/dev/null || {
            print_warning "OpenSSL not available. HTTPS will not work in development."
        }
        
        if [ -f "certs/cert.pem" ]; then
            print_status "Development certificates created"
        fi
    else
        print_status "Development certificates already exist"
    fi
}

# Setup monitoring
setup_monitoring() {
    print_step "Setting up monitoring..."
    
    if command -v docker &> /dev/null; then
        print_status "Starting monitoring services..."
        docker-compose up -d prometheus grafana
        
        print_status "Monitoring setup completed"
        print_status "Prometheus: http://localhost:9090"
        print_status "Grafana: http://localhost:3002 (admin/admin)"
    else
        print_warning "Docker not available. Monitoring services will not be available."
    fi
}

# Start development servers
start_development() {
    print_step "Starting development servers..."
    
    print_status "Starting all services..."
    
    # Start backend services
    if command -v docker &> /dev/null; then
        docker-compose up -d postgres redis mqtt-broker
    fi
    
    # Start application servers
    npm run dev &
    
    print_status "Development servers started!"
    print_status ""
    print_status "🌐 Web Dashboard: http://localhost:3000"
    print_status "📱 PWA Farmer App: http://localhost:3001"
    print_status "⚙️  API Server: http://localhost:8080"
    print_status "🔍 API Documentation: http://localhost:8080/docs"
    print_status "📊 Monitoring: http://localhost:3002"
    print_status ""
    print_status "Press Ctrl+C to stop all services"
    
    wait
}

# Setup Raspberry Pi environment
setup_raspberry_pi() {
    print_step "Setting up Raspberry Pi environment..."
    
    if [ ! -f ".env.pi" ]; then
        print_status "Creating Raspberry Pi environment file..."
        cp .env.pi.example .env.pi
        print_status "Please edit .env.pi to configure your Raspberry Pi settings"
    fi
    
    # Install Pi-specific dependencies
    if command -v apt-get &> /dev/null; then
        print_status "Installing Raspberry Pi dependencies..."
        sudo apt-get update
        sudo apt-get install -y \
            python3-pip \
            python3-venv \
            portaudio19-dev \
            pulseaudio \
            alsa-utils \
            espeak \
            espeak-data \
            libespeak1 \
            libespeak-dev \
            festival \
            festvox-kallpc16k
    fi
    
    print_status "Raspberry Pi environment setup completed"
}

# Main execution
main() {
    echo "🌾 SoilWise Agriculture SaaS Platform Setup"
    echo "=========================================="
    echo ""
    
    check_os
    check_requirements
    
    # Parse command line arguments
    SETUP_PI=false
    SKIP_AI=false
    SKIP_VOICE=false
    SKIP_MONITORING=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --pi|--raspberry-pi)
                SETUP_PI=true
                shift
                ;;
            --skip-ai)
                SKIP_AI=true
                shift
                ;;
            --skip-voice)
                SKIP_VOICE=true
                shift
                ;;
            --skip-monitoring)
                SKIP_MONITORING=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --pi, --raspberry-pi    Setup for Raspberry Pi"
                echo "  --skip-ai              Skip AI services setup"
                echo "  --skip-voice           Skip voice assistant setup"
                echo "  --skip-monitoring      Skip monitoring setup"
                echo "  --help, -h             Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run setup steps
    install_dependencies
    setup_environment
    setup_database
    create_certificates
    
    if [ "$SETUP_PI" = true ]; then
        setup_raspberry_pi
    fi
    
    if [ "$SKIP_AI" = false ]; then
        setup_ai_services
    fi
    
    if [ "$SKIP_VOICE" = false ]; then
        setup_voice_assistant
    fi
    
    if [ "$SKIP_MONITORING" = false ]; then
        setup_monitoring
    fi
    
    echo ""
    print_status "✅ Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    print_status "1. Edit .env file to add your API keys"
    print_status "2. Run 'npm run dev' to start development servers"
    print_status "3. Visit http://localhost:3000 to see the dashboard"
    echo ""
    print_status "For Raspberry Pi deployment:"
    print_status "1. Edit .env.pi file with your configuration"
    print_status "2. Run 'npm run setup:pi' to configure the Pi"
    print_status "3. Run 'docker-compose -f docker-compose.pi.yml up -d' to start edge services"
    echo ""
    print_status "Documentation: https://docs.soilwise.com"
    print_status "Support: https://github.com/soilwise/platform/issues"
    echo ""
}

# Run main function
main "$@"
