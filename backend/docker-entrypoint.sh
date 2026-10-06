#!/bin/sh
# Applies migrations, collects static files for nginx, then starts gunicorn.
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "collectstatic failed (is the static volume writable by uid 1000?). Continuing."

echo "Starting gunicorn..."
exec gunicorn legal_connect.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers "${WEB_CONCURRENCY:-3}" \
    --timeout "${GUNICORN_TIMEOUT:-60}" \
    --access-logfile - \
    --error-logfile -
