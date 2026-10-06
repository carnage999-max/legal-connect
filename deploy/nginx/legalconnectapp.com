# /etc/nginx/sites-available/legalconnectapp.com  (frontend, Next.js on :3010)
# Start with this HTTP-only block, then run:
#   sudo certbot --nginx -d legalconnectapp.com -d www.legalconnectapp.com
# Certbot adds the 443 block and the http->https redirects, like nolimitflix.com.
server {
    server_name legalconnectapp.com www.legalconnectapp.com;
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    listen 80;
}
