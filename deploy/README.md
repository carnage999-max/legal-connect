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
# folders the API container writes to (it runs as uid 1000):
#   static = Django admin assets, served by nginx
#   media  = uploaded files, kept on this server (no S3)
sudo mkdir -p /mnt/data/static/legal-connect /mnt/data/media/legal-connect
sudo chown 1000:1000 /mnt/data/static/legal-connect /mnt/data/media/legal-connect

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

## 4. Stripe

Card details are entered in Stripe's own fields and never reach our servers. The API creates a
PaymentIntent and the browser confirms it with Stripe. A payment is marked paid only by Stripe's
webhook, so the webhook must be set up before payments will complete.

1. In the Stripe dashboard, create a webhook endpoint:
   `https://api.legalconnectapp.com/api/v1/payments/webhook/`
2. Subscribe it to: `payment_intent.succeeded`, `payment_intent.payment_failed`,
   `payment_intent.canceled`, `charge.refunded`.
3. Copy its signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in `backend/.env`, along with
   `STRIPE_SECRET_KEY` and `STRIPE_PUBLIC_KEY`, then `docker compose up -d` in `backend/`.

The browser gets the publishable key from `GET /api/v1/payments/config/`, so the frontend needs no
Stripe variable. Test first with `sk_test_` / `pk_test_` keys and card `4242 4242 4242 4242`.

## 5. Updating

```bash
git pull
docker compose up -d --build     # in backend/ and/or frontend/
```

## Uploaded files

Files are stored on the server in `/mnt/data/media/legal-connect` (mounted at `/app/media`), like
`liberty-social`. Back this folder up with the database. nginx serves only `/media/avatars/`
publicly; legal documents, ID and license scans and message attachments return 404 from nginx
and are delivered by the API through signed links that expire after an hour.

## Notes

- `NEXT_PUBLIC_API_BASE_URL` is baked into the browser bundle at build time. Changing it
  needs `docker compose up -d --build`, not just a restart.
- The old AWS/Ubuntu files at the repo root (`deploy*.sh`, `nginx*.conf`, `supervisor-*`,
  `gunicorn-*.service`, `ecosystem.config.js`) are no longer used by this setup.
