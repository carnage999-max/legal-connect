# Deploying Legal Connect to the se7en server

Two containers, same pattern as `no-limit-flix` and `liberty-social`:

| App | Folder | Container | Host port (loopback) | Public host |
| --- | --- | --- | --- | --- |
| Django API (gunicorn) | `backend/` | `legal-connect-backend` | 8010 | `api.legalconnectapp.com` |
| Next.js site | `frontend/` | `legal-connect-frontend` | 3010 | `legalconnectapp.com`, `www` |

Both join the external `shared-net` network. Ports 3010 and 8010 were picked to avoid the
ones used by the other compose files in this workspace; confirm they are free on the server:

```bash
sudo ss -ltnp | grep -E ':(3010|8010)\b' || echo "both free"
```

## 1. One-time server setup

```bash
# static folder the API container writes to and nginx serves (container runs as uid 1000)
sudo mkdir -p /mnt/data/static/legal-connect
sudo chown 1000:1000 /mnt/data/static/legal-connect

# database: create a role and database in the shared Postgres (adjust the container name)
docker exec -it <postgres-container> psql -U postgres -c "CREATE ROLE legal_connect LOGIN PASSWORD '<choose-a-password>';"
docker exec -it <postgres-container> psql -U postgres -c "CREATE DATABASE legal_connect OWNER legal_connect;"
```

## 2. Configure and start

```bash
cd /srv/apps/legal-connect/backend
cp .env.example .env      # fill in SECRET_KEY, DB_PASSWORD, RESEND_API_KEY, Stripe, AWS ...
docker compose up -d --build
docker compose logs -f     # watch the migrations, then "Listening at: http://0.0.0.0:8000"

cd ../frontend
cp .env.example .env
docker compose up -d --build
```

`DB_HOST` and `REDIS_URL` in `backend/.env.example` assume the shared Postgres and Redis
containers are reachable on `shared-net` as `postgres` and `redis`. Change them if the
containers are named differently. Generate `SECRET_KEY` with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

Create the first admin user:

```bash
docker exec -it legal-connect-backend python manage.py createsuperuser
```

## 3. nginx and TLS

```bash
sudo cp deploy/nginx/legalconnectapp.com     /etc/nginx/sites-available/legalconnectapp.com
sudo cp deploy/nginx/api.legalconnectapp.com /etc/nginx/sites-available/api.legalconnectapp.com
sudo ln -s /etc/nginx/sites-available/legalconnectapp.com     /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.legalconnectapp.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d legalconnectapp.com -d www.legalconnectapp.com
sudo certbot --nginx -d api.legalconnectapp.com
```

DNS must point `legalconnectapp.com`, `www` and `api` at the se7en server first. They currently
point at the old AWS host (`54.224.190.122` appears in the old nginx files).

## 4. Updating

```bash
git pull
docker compose up -d --build     # in backend/ and/or frontend/
```

## Notes

- `NEXT_PUBLIC_API_BASE_URL` is baked into the browser bundle at build time. Changing it
  needs `docker compose up -d --build`, not just a restart.
- The old AWS/Ubuntu files at the repo root (`deploy*.sh`, `nginx*.conf`, `supervisor-*`,
  `gunicorn-*.service`, `ecosystem.config.js`) are no longer used by this setup.
