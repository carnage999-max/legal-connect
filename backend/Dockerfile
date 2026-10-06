FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# psycopg2-binary and Pillow ship wheels, so only runtime tools are needed.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# The app writes logs/django.log and collects static files here.
RUN useradd -m -u 1000 appuser \
    && mkdir -p /app/logs /app/staticfiles \
    && chmod +x /app/docker-entrypoint.sh \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Any HTTP answer (even a 404 or 400) means gunicorn is up.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -s -o /dev/null http://localhost:8000/api/schema/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
