#!/bin/bash

###############################################################################
# Legal Connect Backend - EC2 Deployment Setup Script
# 
# Usage: 
#   1. SSH into EC2: ssh -i your-key.pem ubuntu@<EC2_IP>
#   2. Run: curl -O https://raw.githubusercontent.com/carnage999-max/legal-connect/main/setup-backend.sh
#   3. Execute: bash setup-backend.sh
#
# This script will:
#   - Update system packages
#   - Install Python 3.11, Node.js, Nginx
#   - Create application directory and service files
#   - Configure environment variables
#   - Ready the system for backend deployment
#
###############################################################################

set -e  # Exit on any error

echo "=========================================="
echo "Legal Connect - Backend EC2 Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root. Use: sudo bash setup-backend.sh"
   exit 1
fi

print_status "Starting system updates..."
apt-get update
apt-get upgrade -y

print_status "Installing system dependencies..."
apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    build-essential \
    nginx \
    curl \
    wget \
    git \
    supervisor \
    certbot \
    python3-certbot-nginx \
    postgresql-client \
    libpq-dev

print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

print_status "Creating application directories..."
mkdir -p /home/ubuntu/legal-connect
mkdir -p /data
mkdir -p /var/log/legal-connect

# Set proper permissions
chown -R ubuntu:ubuntu /home/ubuntu/legal-connect
chown -R ubuntu:ubuntu /data
chown -R ubuntu:ubuntu /var/log/legal-connect

print_status "Creating system service files..."

# Create Gunicorn service file
cat > /etc/systemd/system/gunicorn-legal-connect.service << 'EOF'
[Unit]
Description=Gunicorn application server for Legal Connect Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/legal-connect/backend
Environment="PATH=/home/ubuntu/legal-connect/backend/venv/bin"
ExecStart=/home/ubuntu/legal-connect/backend/venv/bin/gunicorn \
    --workers 2 \
    --worker-class sync \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --timeout 30 \
    --bind 127.0.0.1:8000 \
    --log-level info \
    --access-logfile /var/log/legal-connect/gunicorn-access.log \
    --error-logfile /var/log/legal-connect/gunicorn-error.log \
    legal_connect.wsgi:application

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

chmod 644 /etc/systemd/system/gunicorn-legal-connect.service

print_status "Creating Nginx configuration template..."

cat > /etc/nginx/sites-available/legal-connect << 'EOF'
upstream legal_connect_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name 54.224.190.122 www.legalconnectapp.com api.legalconnectapp.com;
    client_max_body_size 100M;

    access_log /var/log/nginx/legal-connect-access.log;
    error_log /var/log/nginx/legal-connect-error.log;

    # Proxy to Gunicorn
    location / {
        proxy_pass http://legal_connect_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve static files
    location /static/ {
        alias /home/ubuntu/legal-connect/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Serve media files
    location /media/ {
        alias /home/ubuntu/legal-connect/backend/media/;
        expires 7d;
    }

    # Health check endpoint
    location /health/ {
        access_log off;
        proxy_pass http://legal_connect_backend;
    }
}

# HTTPS configuration (uncomment after SSL setup)
# server {
#     listen 443 ssl http2;
#     server_name <YOUR_DOMAIN>;
#     
#     ssl_certificate /etc/letsencrypt/live/<YOUR_DOMAIN>/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/<YOUR_DOMAIN>/privkey.pem;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#     
#     # (rest of configuration same as above)
# }

# Redirect HTTP to HTTPS (uncomment after SSL setup)
# server {
#     listen 80;
#     server_name <YOUR_DOMAIN>;
#     return 301 https://$server_name$request_uri;
# }
EOF

# Create symlink to enable site
ln -sf /etc/nginx/sites-available/legal-connect /etc/nginx/sites-enabled/legal-connect

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

print_status "Enabling and restarting Nginx..."
systemctl enable nginx
systemctl restart nginx

print_status "Creating environment template (.env.example)..."

cat > /home/ubuntu/legal-connect/.env.example << 'EOF'
# Legal Connect Backend Production Environment Variables

# Security Settings
DEBUG=False
SECRET_KEY=your-production-secret-key-here-generate-with-django

# Database Configuration (using SQLite on t2.micro)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=/data/db.sqlite3

# Allowed Hosts (comma-separated)
ALLOWED_HOSTS=<EC2_INSTANCE_IP>,api.yourdomain.com,localhost

# CORS Configuration (comma-separated)
CORS_ALLOWED_ORIGINS=https://legal-connect-prod.vercel.app,https://yourdomain.com

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Email Configuration (for verification/notifications)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# AWS Configuration (for media storage - optional)
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=

# Application Settings
LOG_LEVEL=INFO
ENVIRONMENT=production
EOF

chown ubuntu:ubuntu /home/ubuntu/legal-connect/.env.example

print_status "Creating deployment checklist..."

cat > /home/ubuntu/legal-connect/DEPLOYMENT_CHECKLIST.md << 'EOF'
# Legal Connect Backend - Deployment Checklist

## Pre-Deployment

- [ ] EC2 instance created and running (t2.micro, Ubuntu 22.04)
- [ ] Security group configured with ports 80, 443, 8000 open
- [ ] PEM key saved securely
- [ ] SSH access verified: `ssh -i your-key.pem ubuntu@<EC2_IP>`
- [ ] This setup script executed successfully
- [ ] Repository cloned to `/home/ubuntu/legal-connect`

## Configuration

- [ ] `.env` file created with production values:
  ```bash
  cp .env.example .env
  nano .env  # Edit with your values
  ```

- [ ] `SECRET_KEY` generated:
  ```bash
  python3.11 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```

- [ ] `ALLOWED_HOSTS` includes EC2 IP address

- [ ] `CORS_ALLOWED_ORIGINS` includes Vercel frontend URL

## Installation & Migrations

- [ ] Python virtual environment created:
  ```bash
  cd /home/ubuntu/legal-connect/backend
  python3.11 -m venv venv
  source venv/bin/activate
  ```

- [ ] Dependencies installed:
  ```bash
  pip install -r requirements.txt
  ```

- [ ] Migrations run:
  ```bash
  python manage.py migrate
  ```

- [ ] Static files collected:
  ```bash
  python manage.py collectstatic --noinput
  ```

- [ ] Superuser created (optional but recommended):
  ```bash
  python manage.py createsuperuser
  ```

## Service Configuration

- [ ] Gunicorn service enabled:
  ```bash
  sudo systemctl enable gunicorn-legal-connect
  sudo systemctl start gunicorn-legal-connect
  sudo systemctl status gunicorn-legal-connect
  ```

- [ ] Nginx configuration updated:
  ```bash
  # Edit /etc/nginx/sites-available/legal-connect
  # Replace <EC2_INSTANCE_IP> with actual IP
  sudo systemctl restart nginx
  ```

- [ ] API health check passing:
  ```bash
  curl http://<EC2_IP>/api/v1/health/
  ```

## SSL/TLS Setup (Recommended)

- [ ] Domain pointed to EC2 IP (via Route53 or DNS provider)
- [ ] SSL certificate issued:
  ```bash
  sudo certbot certonly --nginx -d your-domain.com
  ```
- [ ] Nginx HTTPS configuration enabled
- [ ] Firewall updated for HTTPS (port 443)

## Monitoring & Logs

- [ ] Gunicorn logs accessible:
  ```bash
  tail -f /var/log/legal-connect/gunicorn-error.log
  ```

- [ ] Nginx logs accessible:
  ```bash
  tail -f /var/log/nginx/legal-connect-error.log
  ```

- [ ] Database file permissions correct:
  ```bash
  ls -la /data/db.sqlite3
  ```

## Frontend Configuration

- [ ] Vercel environment variable set:
  ```
  NEXT_PUBLIC_API_BASE_URL=http://<EC2_INSTANCE_IP>:8000
  OR
  NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
  ```

- [ ] Frontend deployed and tested
- [ ] API calls working from frontend

## Mobile App Configuration

- [ ] iOS app configured with backend URL
- [ ] Android app configured with backend URL
- [ ] Apps built and ready for App Store submission

## Backup Strategy

- [ ] Database backup script created in `/data/backup.sh`
- [ ] Cron job for daily backups scheduled
- [ ] Backup retention policy defined (e.g., 7 days)

## Post-Deployment Testing

- [ ] Auth endpoints working: `/api/v1/auth/token/`
- [ ] Matter creation working: `POST /api/v1/matters/`
- [ ] Conflict check working: `/api/v1/conflicts/check/`
- [ ] Attorney search working: `/api/v1/attorneys/`
- [ ] Frontend → Backend connectivity verified
- [ ] Mobile app → Backend connectivity tested

## Security Verification

- [ ] DEBUG set to False
- [ ] SECRET_KEY is unique and secure
- [ ] ALLOWED_HOSTS doesn't include wildcards
- [ ] CORS_ALLOWED_ORIGINS restricted to known domains
- [ ] HTTPS enabled (if using domain)
- [ ] SSL certificate valid and not expired

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Notes**: _____________
EOF

chown ubuntu:ubuntu /home/ubuntu/legal-connect/DEPLOYMENT_CHECKLIST.md

print_status "Creating database backup script..."

cat > /data/backup.sh << 'EOF'
#!/bin/bash
# Daily backup script for Legal Connect database

BACKUP_DIR="/data/backups"
DB_FILE="/data/db.sqlite3"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sqlite3"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Copy database with compression
cp $DB_FILE $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sqlite3.gz" -mtime +7 -delete

echo "Database backup completed: $BACKUP_FILE.gz"

# Optional: Upload to S3
# aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/legal-connect/
EOF

chmod +x /data/backup.sh
chown ubuntu:ubuntu /data/backup.sh

print_status "Setting up automated backups..."

# Create cron job for daily backups (runs at 2 AM)
cat > /tmp/crontab.txt << 'EOF'
0 2 * * * /data/backup.sh >> /var/log/legal-connect/backup.log 2>&1
EOF

crontab -u ubuntu /tmp/crontab.txt
rm /tmp/crontab.txt

print_status "Creating health check endpoint..."

cat > /home/ubuntu/legal-connect/backend/apps/health/views.py << 'EOF'
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'healthy',
        'message': 'Legal Connect Backend is running',
        'version': '1.0.0'
    })
EOF

mkdir -p /home/ubuntu/legal-connect/backend/apps/health
chown -R ubuntu:ubuntu /home/ubuntu/legal-connect/backend/apps/health

print_status "System setup complete!"
print_warning "Next Steps:"
echo "1. SSH into instance: ssh -i your-key.pem ubuntu@<EC2_INSTANCE_IP>"
echo "2. Clone repository: cd /home/ubuntu && git clone https://github.com/carnage999-max/legal-connect.git"
echo "3. Setup backend environment (see DEPLOYMENT_CHECKLIST.md)"
echo "4. Update Nginx config with your EC2 IP"
echo "5. Start services: sudo systemctl start gunicorn-legal-connect"
echo ""
print_status "Configuration files created:"
echo "  - /etc/systemd/system/gunicorn-legal-connect.service"
echo "  - /etc/nginx/sites-available/legal-connect"
echo "  - /home/ubuntu/legal-connect/.env.example"
echo "  - /data/backup.sh (automated daily backups)"
echo ""
print_status "Logs will be available at:"
echo "  - /var/log/legal-connect/gunicorn-error.log"
echo "  - /var/log/nginx/legal-connect-error.log"

echo ""
echo "=========================================="
echo "Setup completed successfully!"
echo "=========================================="
