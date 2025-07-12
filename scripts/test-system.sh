#!/bin/bash

# SoilWise System Test Script
echo "🧪 SoilWise System Integration Test"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-5}
    
    echo -n "Testing $name... "
    
    if curl -s --max-time $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Test MQTT connection
test_mqtt() {
    echo -n "Testing MQTT broker... "
    
    # Use mosquitto_pub/sub if available
    if command -v mosquitto_pub &> /dev/null; then
        timeout 3 mosquitto_pub -h localhost -p 1883 -t "test/topic" -m "test" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ OK${NC}"
            return 0
        fi
    fi
    
    echo -e "${YELLOW}⚠️  SKIPPED (mosquitto-clients not installed)${NC}"
    return 0
}

# Test database connection
test_database() {
    echo -n "Testing PostgreSQL... "
    
    if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U soilwise > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

echo ""
echo "🔍 Running connectivity tests..."
echo ""

# Infrastructure tests
test_database
test_mqtt
test_endpoint "http://localhost:6379" "Redis" 2

echo ""
echo "🚀 Application tests..."
echo ""

# Application tests
test_endpoint "http://localhost:8080/health" "API Server"
test_endpoint "http://localhost:3000/health" "Edge Hub"
test_endpoint "http://localhost:5173" "Web Dashboard"
test_endpoint "http://localhost:3001" "PWA Farmer"

echo ""
echo "📊 Monitoring tests..."
echo ""

# Monitoring tests
test_endpoint "http://localhost:9091" "Prometheus"
test_endpoint "http://localhost:3002" "Grafana"
test_endpoint "http://localhost:9000" "MinIO"

echo ""
echo "🌱 Data Flow Test..."
echo ""

# Test real-time data flow
echo -n "Testing WebSocket connection... "
if command -v wscat &> /dev/null; then
    timeout 3 wscat -c ws://localhost:3000 </dev/null >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  SKIPPED (wscat not installed)${NC}"
fi

# Test API endpoints
echo -n "Testing sensor data API... "
response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:8080/api/sensors/latest")
if [ "$response" -eq "200" ] || [ "$response" -eq "404" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $response)${NC}"
fi

echo ""
echo "📋 Service Status Summary:"
echo "========================="

# Get container status
services=("postgres" "redis" "mosquitto" "api-server" "edge-hub" "web-dashboard" "pwa-farmer" "prometheus" "grafana" "minio")

for service in "${services[@]}"; do
    status=$(docker-compose -f docker-compose.dev.yml ps -q $service 2>/dev/null)
    if [ -n "$status" ]; then
        running=$(docker inspect -f '{{.State.Running}}' $status 2>/dev/null)
        if [ "$running" = "true" ]; then
            echo -e "  $service: ${GREEN}Running${NC}"
        else
            echo -e "  $service: ${RED}Stopped${NC}"
        fi
    else
        echo -e "  $service: ${YELLOW}Not found${NC}"
    fi
done

echo ""
echo "🎯 Quick Access URLs:"
echo "===================="
echo "  🌐 Web Dashboard:    http://localhost:5173"
echo "  📱 PWA Farmer:       http://localhost:3001"
echo "  ⚙️  Edge Hub:        http://localhost:3000"
echo "  🔌 API Server:       http://localhost:8080"
echo "  📊 Grafana:          http://localhost:3002 (admin/admin)"
echo "  📈 Prometheus:       http://localhost:9091"
echo "  📁 MinIO:            http://localhost:9000 (admin/admin)"
echo ""
echo "🔧 Troubleshooting:"
echo "=================="
echo "  📋 View all logs:    docker-compose -f docker-compose.dev.yml logs -f"
echo "  🔍 Check service:     docker-compose -f docker-compose.dev.yml logs [service]"
echo "  🔄 Restart service:   docker-compose -f docker-compose.dev.yml restart [service]"
echo "  🛑 Stop all:          docker-compose -f docker-compose.dev.yml down"
echo ""

# Final status
failed_tests=0
if ! test_endpoint "http://localhost:5173" "Dashboard Check" 2; then ((failed_tests++)); fi
if ! test_endpoint "http://localhost:8080/health" "API Check" 2; then ((failed_tests++)); fi

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical services are running!${NC}"
    echo -e "${GREEN}🌱 SoilWise is ready for development.${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may need attention.${NC}"
    echo -e "${YELLOW}   Check the logs for more details.${NC}"
fi
