#!/bin/bash
# Backend Deployment Script for AWS EC2 (t3.micro)
# Run this script on the backend EC2 instance after basic setup

set -e

echo "================================"
echo "Legal Connect Backend Deployment"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit on error
trap 'echo -e "${RED}Error occurred in deployment${NC}"; exit 1' ERR

# 1. Update system
echo -e "${YELLOW}[1/12] Updating system packages...${NC}"
sudo yum update -y > /dev/null 2>&1
sudo yum install -y git curl python3 python3-pip postgresql > /dev/null 2>&1

# 2. Install Nginx
echo -e "${YELLOW}[2/12] Installing Nginx...${NC}"
sudo amazon-linux-extras install -y nginx1.12 > /dev/null 2>&1

# 3. Install Supervisor
echo -e "${YELLOW}[3/12] Installing Supervisor...${NC}"
sudo pip3 install supervisor > /dev/null 2>&1

# 4. Clone repository
echo -e "${YELLOW}[4/12] Cloning repository...${NC}"
cd /home/ec2-user
if [ -d "legal-connect" ]; then
    cd legal-connect
    git pull origin main
    cd ..
else
    git clone https://github.com/carnage999-max/legal-connect.git
fi

# 5. Create virtual environment
echo -e "${YELLOW}[5/12] Creating Python virtual environment...${NC}"
cd legal-connect/backend
python3 -m venv env
source env/bin/activate

# 6. Install dependencies
echo -e "${YELLOW}[6/12] Installing Python dependencies...${NC}"
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
pip install gunicorn whitenoise > /dev/null 2>&1

# 7. Create environment file
echo -e "${YELLOW}[7/12] Creating environment file...${NC}"
cat > .env << 'EOF'
DEBUG=False
ALLOWED_HOSTS=*
DATABASE_URL=sqlite:///db.sqlite3
SECRET_KEY=your-secret-key-change-this-in-production
CORS_ALLOWED_ORIGINS=https://legalconnect.com,https://www.legalconnect.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
EOF

echo -e "${YELLOW}Please update .env with your SECRET_KEY and actual CORS origins${NC}"

# 8. Create media and staticfiles directories
echo -e "${YELLOW}[8/12] Creating directories...${NC}"
mkdir -p logs media staticfiles

# 9. Run migrations
echo -e "${YELLOW}[9/12] Running database migrations...${NC}"
source env/bin/activate
python manage.py migrate > /dev/null 2>&1
python manage.py collectstatic --noinput > /dev/null 2>&1

# 10. Configure Supervisor
echo -e "${YELLOW}[10/12] Configuring Supervisor...${NC}"
sudo mkdir -p /var/log/legal-connect
sudo chown ec2-user:ec2-user /var/log/legal-connect

# Create supervisor config
cat > supervisor-config.conf << 'EOF'
[program:legal-connect-backend]
directory=/home/ec2-user/legal-connect/backend
command=/home/ec2-user/legal-connect/backend/env/bin/gunicorn \
    --workers 2 \
    --worker-class sync \
    --bind 127.0.0.1:8000 \
    --timeout 60 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    legal_connect.wsgi:application
user=ec2-user
autostart=true
autorestart=true
stderr_logfile=/var/log/legal-connect/backend.err.log
stdout_logfile=/var/log/legal-connect/backend.out.log
environment=PATH="/home/ec2-user/legal-connect/backend/env/bin",HOME="/home/ec2-user"
EOF

sudo cp supervisor-config.conf /etc/supervisord.conf.d/legal-connect.conf

# Start supervisor
sudo systemctl enable supervisord
sudo systemctl start supervisord
sudo supervisorctl reread
sudo supervisorctl update

# 11. Configure Nginx
echo -e "${YELLOW}[11/12] Configuring Nginx...${NC}"

# Download nginx config (assuming it's in the repo or provided separately)
if [ -f "../../backend-nginx.conf" ]; then
    sudo cp ../../backend-nginx.conf /etc/nginx/nginx.conf
else
    echo -e "${YELLOW}Warning: backend-nginx.conf not found, using default config${NC}"
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

# 12. Verification
echo -e "${YELLOW}[12/12] Verifying deployment...${NC}"
sleep 2

# Verify services
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check Django is running
echo "Testing Django application..."
source env/bin/activate
python manage.py check > /dev/null 2>&1 && echo -e "${GREEN}✓ Django check passed${NC}" || echo -e "${RED}✗ Django check failed${NC}"

echo ""
echo "Service Status:"
echo "Supervisor Status:"
sudo supervisorctl status legal-connect-backend
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager
echo ""
echo -e "${GREEN}Backend API is running on port 8081${NC}"
echo -e "${GREEN}Gunicorn app is running on port 8000 (proxied through Nginx)${NC}"
echo ""
echo "Logs:"
echo "- Supervisor: sudo tail -f /var/log/legal-connect/backend.err.log"
echo "- Gunicorn: tail -f logs/access.log"
echo "- Nginx Access: sudo tail -f /var/log/nginx/api_access.log"
echo "- Nginx Error: sudo tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update .env file with your actual SECRET_KEY and settings${NC}"
echo "File location: /home/ec2-user/legal-connect/backend/.env"
