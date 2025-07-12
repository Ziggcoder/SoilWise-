# SoilWise Edge Hub Dockerfile
# Multi-stage build for production optimization

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite-dev \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    sqlite \
    dumb-init \
    tini \
    curl

# Create app user
RUN addgroup -g 1001 -S soilwise && \
    adduser -S soilwise -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=soilwise:soilwise /app/dist ./dist
COPY --from=builder --chown=soilwise:soilwise /app/node_modules ./node_modules
COPY --from=builder --chown=soilwise:soilwise /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/data /app/logs /app/uploads && \
    chown -R soilwise:soilwise /app

# Copy configuration files
COPY --chown=soilwise:soilwise config/ ./config/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/edge-hub.db
ENV LOG_LEVEL=info

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER soilwise

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/server.js"]

# Development stage (optional)
FROM node:18-alpine AS development

WORKDIR /app

# Install all dependencies including dev dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite-dev \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm ci

# Create directories
RUN mkdir -p /app/data /app/logs /app/uploads

# Set environment
ENV NODE_ENV=development
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start with nodemon for hot reload
CMD ["npm", "run", "dev"]
