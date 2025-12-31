#!/bin/bash
# Frontend Deployment Script for AWS EC2 (t3.micro)
# Run this script on the frontend EC2 instance after basic setup

set -e

echo "================================"
echo "Legal Connect Frontend Deployment"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit on error
trap 'echo -e "${RED}Error occurred in deployment${NC}"; exit 1' ERR

# 1. Update system
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
sudo yum update -y > /dev/null 2>&1

# 2. Install Node.js
echo -e "${YELLOW}[2/10] Installing Node.js...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - > /dev/null 2>&1
sudo yum install -y nodejs > /dev/null 2>&1

# 3. Install Nginx
echo -e "${YELLOW}[3/10] Installing Nginx...${NC}"
sudo amazon-linux-extras install -y nginx1.12 > /dev/null 2>&1

# 4. Install PM2
echo -e "${YELLOW}[4/10] Installing PM2...${NC}"
sudo npm install -g pm2 > /dev/null 2>&1

# 5. Clone repository
echo -e "${YELLOW}[5/10] Cloning repository...${NC}"
cd /home/ec2-user
if [ -d "legal-connect" ]; then
    cd legal-connect
    git pull origin main
    cd ..
else
    git clone https://github.com/carnage999-max/legal-connect.git
fi

# 6. Setup frontend
echo -e "${YELLOW}[6/10] Installing frontend dependencies...${NC}"
cd legal-connect/frontend
npm install > /dev/null 2>&1

# 7. Build frontend
echo -e "${YELLOW}[7/10] Building frontend...${NC}"
npm run build > /dev/null 2>&1

# 8. Create environment file
echo -e "${YELLOW}[8/10] Creating environment file...${NC}"
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.legalconnect.com
NODE_ENV=production
EOF

# 9. Setup PM2
echo -e "${YELLOW}[9/10] Setting up PM2...${NC}"
mkdir -p logs

# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'legal-connect-frontend',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', '.next']
  }]
};
EOF

# Start with PM2
pm2 delete legal-connect-frontend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup -u ec2-user --hp /home/ec2-user | sudo bash

# 10. Configure Nginx
echo -e "${YELLOW}[10/10] Configuring Nginx...${NC}"

# Download nginx config (assuming it's in the repo or provided separately)
if [ -f "../../frontend-nginx.conf" ]; then
    sudo cp ../../frontend-nginx.conf /etc/nginx/nginx.conf
else
    echo -e "${YELLOW}Warning: frontend-nginx.conf not found, using default config${NC}"
fi

# Test Nginx config
sudo nginx -t 2>/dev/null || {
    echo -e "${RED}Nginx configuration error${NC}"
    exit 1
}

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl restart nginx

# Verify services
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check status
echo "Service Status:"
echo "PM2 Applications:"
pm2 list
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager
echo ""
echo -e "${GREEN}Frontend is running on port 8080${NC}"
echo -e "${GREEN}Next.js app is running on port 3000 (proxied through Nginx)${NC}"
echo ""
echo "Logs:"
echo "- PM2: pm2 logs legal-connect-frontend"
echo "- Nginx Access: sudo tail -f /var/log/nginx/access.log"
echo "- Nginx Error: sudo tail -f /var/log/nginx/error.log"
