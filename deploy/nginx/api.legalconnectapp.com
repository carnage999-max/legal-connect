# /etc/nginx/sites-available/api.legalconnectapp.com  (Django API, gunicorn on :8010)
# Start with this HTTP-only block, then run:
#   sudo certbot --nginx -d api.legalconnectapp.com
server {
    server_name api.legalconnectapp.com;
    client_max_body_size 50M;

    # Django admin assets (collected by the container into this host folder)
    location /static/ {
        alias /mnt/data/static/legal-connect/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://localhost:8010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    listen 80;
}
