#!/bin/bash
# Complete Deployment Script for Legal Connect (Single Ubuntu Instance)
# Frontend + Backend on one t3.micro instance
# Run: chmod +x deploy.sh && ./deploy.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/carnage999-max/legal-connect.git"
APP_DIR="/home/ubuntu/legal-connect"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOG_DIR="/var/log/legal-connect"
USER="ubuntu"

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_step() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

error_exit() {
    print_error "$1"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error_exit "This script must be run as root (use sudo)"
fi

# Start deployment
print_header "Legal Connect - Full Stack Deployment"
echo "Instance Type: Single Ubuntu (t3.micro)"
echo "Apps: Next.js Frontend + Django Backend"
echo ""

# Step 1: System Update
print_step "Step 1: Updating system packages"
apt update > /dev/null 2>&1
apt upgrade -y > /dev/null 2>&1
print_success "System updated"

# Step 2: Install Base Dependencies
print_step "Step 2: Installing base dependencies"
apt install -y curl wget git build-essential openssl libssl-dev libffi-dev > /dev/null 2>&1
print_success "Base dependencies installed"

# Step 3: Install Node.js
print_step "Step 3: Installing Node.js 18.x"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - > /dev/null 2>&1
apt install -y nodejs > /dev/null 2>&1
NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION installed"

# Step 4: Install Python
print_step "Step 4: Installing Python 3.9+"
apt install -y python3.9 python3.9-venv python3.9-dev python3-pip > /dev/null 2>&1
PYTHON_VERSION=$(python3.9 --version 2>&1)
print_success "$PYTHON_VERSION installed"

# Step 5: Install Nginx
print_step "Step 5: Installing Nginx"
apt install -y nginx > /dev/null 2>&1
systemctl enable nginx > /dev/null 2>&1
print_success "Nginx installed and enabled"

# Step 6: Install Supervisor
print_step "Step 6: Installing Supervisor"
apt install -y supervisor > /dev/null 2>&1
systemctl enable supervisor > /dev/null 2>&1
print_success "Supervisor installed and enabled"

# Step 7: Install PM2
print_step "Step 7: Installing PM2"
npm install -g pm2 > /dev/null 2>&1
print_success "PM2 installed"

# Step 8: Clone Repository
print_step "Step 8: Cloning repository"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin main > /dev/null 2>&1
    print_success "Repository updated"
else
    git clone "$REPO_URL" "$APP_DIR" > /dev/null 2>&1
    print_success "Repository cloned"
fi

# Step 9: Create Log Directory
print_step "Step 9: Creating log directory"
mkdir -p "$LOG_DIR"
chown -R $USER:$USER "$LOG_DIR"
chmod 755 "$LOG_DIR"
print_success "Log directory created"

# ==========================================
# BACKEND SETUP
# ==========================================
print_header "Backend Setup (Django)"

# Step 10: Setup Python Virtual Environment
print_step "Step 10: Creating Python virtual environment"
cd "$BACKEND_DIR"
python3.9 -m venv env > /dev/null 2>&1
source env/bin/activate
print_success "Virtual environment created"

# Step 11: Install Backend Dependencies
print_step "Step 11: Installing backend dependencies"
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
pip install gunicorn whitenoise > /dev/null 2>&1
print_success "Backend dependencies installed"

# Step 12: Create Backend Environment File
print_step "Step 12: Creating backend environment file"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    SECRET_KEY=$(openssl rand -base64 32)
    cat > "$BACKEND_DIR/.env" << EOF
DEBUG=False
ALLOWED_HOSTS=legalconnect.com,www.legalconnect.com,api.legalconnect.com,localhost,127.0.0.1
SECRET_KEY=$SECRET_KEY

DATABASE_URL=sqlite:///db.sqlite3

DOMAIN=legalconnect.com
SECURE_DOMAIN=https://legalconnect.com
API_DOMAIN=https://api.legalconnect.com

SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

CORS_ALLOWED_ORIGINS=https://legalconnect.com,https://www.legalconnect.com,https://api.legalconnect.com
CORS_ALLOW_CREDENTIALS=True

FRONTEND_URL=https://legalconnect.com
INTAKE_URL=https://legalconnect.com/intake

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

USE_S3=False

LOG_LEVEL=INFO
EOF
    chown $USER:$USER "$BACKEND_DIR/.env"
    chmod 600 "$BACKEND_DIR/.env"
    print_success "Backend environment file created"
else
    print_success "Backend environment file already exists"
fi

# Step 13: Create Media and Staticfiles Directories
print_step "Step 13: Creating media and staticfiles directories"
mkdir -p "$BACKEND_DIR/media" "$BACKEND_DIR/staticfiles" "$BACKEND_DIR/logs"
chown -R $USER:$USER "$BACKEND_DIR/media" "$BACKEND_DIR/staticfiles" "$BACKEND_DIR/logs"
print_success "Directories created"

# Step 14: Run Django Migrations
print_step "Step 14: Running Django migrations"
source "$BACKEND_DIR/env/bin/activate"
cd "$BACKEND_DIR"
python manage.py migrate > /dev/null 2>&1
python manage.py collectstatic --noinput > /dev/null 2>&1
print_success "Migrations completed"

# Step 15: Setup Supervisor for Backend
print_step "Step 15: Configuring Supervisor for backend"
cat > /etc/supervisor/conf.d/legal-connect.conf << 'SUPERVISOR_EOF'
[program:legal-connect-backend]
directory=/home/ubuntu/legal-connect/backend
command=/home/ubuntu/legal-connect/backend/env/bin/gunicorn \
    --workers 2 \
    --worker-class sync \
    --bind 127.0.0.1:8000 \
    --timeout 60 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    legal_connect.wsgi:application

user=ubuntu
autostart=true
autorestart=true
startsecs=10
stopasgroup=true
killasgroup=true

stderr_logfile=/var/log/legal-connect/backend.err.log
stderr_logfile_maxbytes=10MB
stderr_logfile_backups=5
stdout_logfile=/var/log/legal-connect/backend.out.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5

environment=PATH="/home/ubuntu/legal-connect/backend/env/bin",HOME="/home/ubuntu",PYTHONUNBUFFERED="1"

stopsignal=QUIT
stopwaitsecs=10

[group:legal-connect]
programs=legal-connect-backend
priority=999
SUPERVISOR_EOF

supervisorctl reread > /dev/null 2>&1
supervisorctl update > /dev/null 2>&1
supervisorctl start legal-connect-backend > /dev/null 2>&1
sleep 2
print_success "Supervisor configured and backend started"

# ==========================================
# FRONTEND SETUP
# ==========================================
print_header "Frontend Setup (Next.js)"

# Step 16: Install Frontend Dependencies
print_step "Step 16: Installing frontend dependencies"
cd "$FRONTEND_DIR"
npm install > /dev/null 2>&1
print_success "Frontend dependencies installed"

# Step 17: Build Frontend
print_step "Step 17: Building Next.js application"
npm run build > /dev/null 2>&1
print_success "Frontend build completed"

# Step 18: Create Frontend Environment File
print_step "Step 18: Creating frontend environment file"
if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
    cat > "$FRONTEND_DIR/.env.local" << EOF
NEXT_PUBLIC_API_URL=https://api.legalconnect.com
NEXT_PUBLIC_DOMAIN=legalconnect.com
NEXT_PUBLIC_FRONTEND_URL=https://legalconnect.com
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Legal Connect
NEXT_PUBLIC_ENABLE_INTAKE_FORM=true
NEXT_PUBLIC_ENABLE_MESSAGING=true
NEXT_PUBLIC_ENABLE_DOCUMENT_UPLOAD=true
EOF
    chown $USER:$USER "$FRONTEND_DIR/.env.local"
    chmod 600 "$FRONTEND_DIR/.env.local"
    print_success "Frontend environment file created"
else
    print_success "Frontend environment file already exists"
fi

# Step 19: Setup PM2 Ecosystem
print_step "Step 19: Configuring PM2"
cat > "$FRONTEND_DIR/ecosystem.config.js" << 'PM2_EOF'
module.exports = {
  apps: [{
    name: 'legal-connect-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/legal-connect/frontend',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '500M',
    error_file: '/var/log/legal-connect/pm2-error.log',
    out_file: '/var/log/legal-connect/pm2-out.log',
    watch: false,
    ignore_watch: ['node_modules', '.next'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
PM2_EOF

chown $USER:$USER "$FRONTEND_DIR/ecosystem.config.js"

# Start frontend with PM2
cd "$FRONTEND_DIR"
sudo -u $USER pm2 start ecosystem.config.js > /dev/null 2>&1
sudo -u $USER pm2 save > /dev/null 2>&1
print_success "PM2 configured and frontend started"

# ==========================================
# NGINX CONFIGURATION
# ==========================================
print_header "Nginx Configuration"

# Step 20: Backup original Nginx config
print_step "Step 20: Configuring Nginx"
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Create main Nginx config
cat > /etc/nginx/nginx.conf << 'NGINX_EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;

    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

    upstream frontend_app {
        server 127.0.0.1:3000;
    }

    upstream backend_app {
        server 127.0.0.1:8000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        listen [::]:80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name legalconnect.com www.legalconnect.com api.legalconnect.com;

        # SSL - Update paths after setting up Let's Encrypt
        ssl_certificate /etc/letsencrypt/live/legalconnect.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/legalconnect.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Backend API
        location ~ ^/(api|admin|static|media)/ {
            limit_req zone=auth_limit burst=5 nodelay;
            proxy_pass http://backend_app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Frontend
        location / {
            limit_req zone=general_limit burst=20 nodelay;
            proxy_pass http://frontend_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static assets
        location /_next/static {
            proxy_cache_valid 365d;
            proxy_pass http://frontend_app;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
NGINX_EOF

# Test Nginx config
nginx -t > /dev/null 2>&1 || error_exit "Nginx configuration test failed"
print_success "Nginx configured"

# Step 21: Start Nginx
print_step "Step 21: Starting Nginx"
systemctl restart nginx
sleep 2
print_success "Nginx started"

# ==========================================
# SSL SETUP WITH LET'S ENCRYPT
# ==========================================
print_header "SSL Setup (Let's Encrypt)"

print_step "Step 22: Installing Certbot for SSL"
apt install -y certbot python3-certbot-nginx > /dev/null 2>&1
print_success "Certbot installed"

print_step "Step 23: Setting up SSL certificates"
echo ""
echo -e "${YELLOW}⚠️  MANUAL STEP REQUIRED${NC}"
echo "Run the following command to set up SSL:"
echo ""
echo -e "${BLUE}sudo certbot certonly --nginx -d legalconnect.com -d www.legalconnect.com -d api.legalconnect.com${NC}"
echo ""
echo "After SSL setup, update the Nginx config with your certificate paths."
echo ""

# ==========================================
# VERIFICATION
# ==========================================
print_header "Deployment Verification"

print_step "Checking services status..."
sleep 2

# Check Supervisor
supervisorctl status legal-connect-backend > /dev/null 2>&1 && print_success "Backend (Supervisor) - Running" || print_error "Backend (Supervisor) - Failed"

# Check PM2
sudo -u $USER pm2 list | grep legal-connect-frontend > /dev/null 2>&1 && print_success "Frontend (PM2) - Running" || print_error "Frontend (PM2) - Failed"

# Check Nginx
systemctl status nginx | grep active > /dev/null 2>&1 && print_success "Nginx - Running" || print_error "Nginx - Failed"

# ==========================================
# FINAL SUMMARY
# ==========================================
print_header "Deployment Complete!"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Legal Connect is deployed and running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "📍 Access Points:"
echo "  - Frontend:  https://legalconnect.com"
echo "  - API:       https://api.legalconnect.com"
echo "  - Admin:     https://api.legalconnect.com/admin"
echo ""
echo "📊 Services:"
echo "  - Frontend:  PM2 (port 3000, proxied via Nginx)"
echo "  - Backend:   Gunicorn (port 8000, proxied via Nginx)"
echo "  - Web Server: Nginx (ports 80, 443)"
echo ""
echo "📋 Useful Commands:"
echo "  Backend logs:"
echo "    $ tail -f /var/log/legal-connect/backend.err.log"
echo "    $ sudo supervisorctl status"
echo ""
echo "  Frontend logs:"
echo "    $ sudo -u ubuntu pm2 logs legal-connect-frontend"
echo ""
echo "  Nginx:"
echo "    $ sudo systemctl restart nginx"
echo "    $ sudo tail -f /var/log/nginx/error.log"
echo ""
echo "🔐 SSL Certificate:"
echo "  Run after SSL is set up:"
echo "    $ sudo certbot certonly --nginx -d legalconnect.com -d www.legalconnect.com"
echo ""
echo "⚙️  Environment Files:"
echo "  - Backend:  $BACKEND_DIR/.env"
echo "  - Frontend: $FRONTEND_DIR/.env.local"
echo ""
echo "📦 Application Directory:"
echo "  $APP_DIR"
echo ""
echo "🚀 To redeploy (pull latest code):"
echo "  $ cd $APP_DIR && git pull origin main"
echo "  $ cd frontend && npm run build && pm2 reload ecosystem.config.js"
echo "  $ cd ../backend && source env/bin/activate && python manage.py migrate && supervisorctl restart legal-connect-backend"
echo ""
