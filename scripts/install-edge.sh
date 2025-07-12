#!/bin/bash

# SoilWise Edge Hub Installation Script for Raspberry Pi
# Run with: curl -fsSL https://raw.githubusercontent.com/soilwise/setup/main/install-edge.sh | bash

set -e

echo "🌱 SoilWise Edge Hub Installation Script"
echo "========================================"

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo; then
    echo "❌ This script is designed for Raspberry Pi only"
    exit 1
fi

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y \
    curl \
    git \
    docker.io \
    docker-compose \
    python3 \
    python3-pip \
    i2c-tools \
    wiringpi \
    mosquitto-clients \
    sqlite3 \
    nginx \
    ufw \
    fail2ban

# Enable I2C and SPI
echo "🔧 Enabling hardware interfaces..."
sudo raspi-config nonint do_i2c 0
sudo raspi-config nonint do_spi 0
sudo raspi-config nonint do_camera 0

# Add user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

# Create directory structure
echo "📁 Creating directory structure..."
sudo mkdir -p /opt/soilwise/{data,logs,config,ssl}
sudo chown -R $USER:$USER /opt/soilwise

# Download SoilWise Edge Hub
echo "⬇️ Downloading SoilWise Edge Hub..."
cd /opt/soilwise
git clone https://github.com/soilwise/edge-hub.git
cd edge-hub

# Install Node.js and dependencies
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo "📦 Installing application dependencies..."
npm ci --production

# Create configuration files
echo "⚙️ Creating configuration files..."

# Environment configuration
cat > /opt/soilwise/config/.env << EOF
NODE_ENV=production
DB_PATH=/opt/soilwise/data/edge-hub.db
MQTT_BROKER_URL=mqtt://localhost:1883
CLOUD_SYNC_ENDPOINT=https://api.soilwise.com
CLOUD_SYNC_INTERVAL=300000
LOG_LEVEL=info
LOG_FILE=/opt/soilwise/logs/edge-hub.log
EOF

# MQTT Configuration
cat > /opt/soilwise/config/mosquitto.conf << EOF
listener 1883
allow_anonymous false
password_file /opt/soilwise/config/mosquitto.passwd

# Persistence
persistence true
persistence_location /opt/soilwise/data/mosquitto/

# Logging
log_dest file /opt/soilwise/logs/mosquitto.log
log_type error
log_type warning
log_type notice
log_type information

# Security
max_inflight_messages 20
max_queued_messages 100
connection_messages true
log_timestamp true
EOF

# Create MQTT password file
echo "🔐 Setting up MQTT authentication..."
read -p "Enter MQTT username: " mqtt_user
read -s -p "Enter MQTT password: " mqtt_pass
echo
sudo mosquitto_passwd -c /opt/soilwise/config/mosquitto.passwd $mqtt_user

# Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/soilwise-edge.service > /dev/null << EOF
[Unit]
Description=SoilWise Edge Hub
After=network.target
Wants=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/soilwise/edge-hub
Environment=NODE_ENV=production
EnvironmentFile=/opt/soilwise/config/.env
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=soilwise-edge

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=/opt/soilwise/data /opt/soilwise/logs

[Install]
WantedBy=multi-user.target
EOF

# Create Mosquitto systemd service override
sudo mkdir -p /etc/systemd/system/mosquitto.service.d
sudo tee /etc/systemd/system/mosquitto.service.d/override.conf > /dev/null << EOF
[Service]
ExecStart=
ExecStart=/usr/sbin/mosquitto -c /opt/soilwise/config/mosquitto.conf
EOF

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 3000/tcp comment 'SoilWise Edge Hub'
sudo ufw allow 1883/tcp comment 'MQTT'
sudo ufw allow 3001/tcp comment 'PWA Farmer'

# Configure log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/soilwise << EOF
/opt/soilwise/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        systemctl reload soilwise-edge || true
    endscript
}
EOF

# Install monitoring tools
echo "📊 Installing monitoring tools..."
pip3 install --user psutil

# Setup automatic updates
echo "🔄 Setting up automatic updates..."
sudo tee /etc/cron.d/soilwise-update << EOF
# Update SoilWise Edge Hub every night at 2 AM
0 2 * * * $USER cd /opt/soilwise/edge-hub && git pull && npm ci --production && systemctl restart soilwise-edge
EOF

# Create backup script
echo "💾 Creating backup script..."
cat > /opt/soilwise/backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/opt/soilwise/backups"
DATE=\$(date +"%Y%m%d_%H%M%S")

mkdir -p \$BACKUP_DIR

# Backup database
sqlite3 /opt/soilwise/data/edge-hub.db ".backup \$BACKUP_DIR/edge-hub_\$DATE.db"

# Backup configuration
tar -czf \$BACKUP_DIR/config_\$DATE.tar.gz -C /opt/soilwise config/

# Clean old backups (keep last 7 days)
find \$BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

chmod +x /opt/soilwise/backup.sh

# Setup daily backup cron
echo "0 1 * * * $USER /opt/soilwise/backup.sh >> /opt/soilwise/logs/backup.log 2>&1" | sudo tee -a /etc/crontab

# Enable and start services
echo "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable mosquitto
sudo systemctl enable soilwise-edge
sudo systemctl start mosquitto
sudo systemctl start soilwise-edge

# Health check
echo "🏥 Performing health check..."
sleep 5

if systemctl is-active --quiet soilwise-edge; then
    echo "✅ SoilWise Edge Hub is running"
else
    echo "❌ SoilWise Edge Hub failed to start"
    echo "Check logs with: sudo journalctl -u soilwise-edge -f"
fi

if systemctl is-active --quiet mosquitto; then
    echo "✅ MQTT Broker is running"
else
    echo "❌ MQTT Broker failed to start"
    echo "Check logs with: sudo journalctl -u mosquitto -f"
fi

# Display connection information
echo ""
echo "🎉 Installation Complete!"
echo "========================="
echo "Edge Hub URL: http://$(hostname -I | awk '{print $1}'):3000"
echo "MQTT Broker: $(hostname -I | awk '{print $1}'):1883"
echo "PWA Farmer: http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "📚 Useful Commands:"
echo "  Status: sudo systemctl status soilwise-edge"
echo "  Logs:   sudo journalctl -u soilwise-edge -f"
echo "  Restart: sudo systemctl restart soilwise-edge"
echo "  Backup: /opt/soilwise/backup.sh"
echo ""
echo "🔧 Configuration:"
echo "  Edit: /opt/soilwise/config/.env"
echo "  Logs: /opt/soilwise/logs/"
echo "  Data: /opt/soilwise/data/"
echo ""
echo "⚠️ Please reboot the system to ensure all changes take effect:"
echo "  sudo reboot"
