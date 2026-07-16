#!/bin/bash
# scripts/ssl-init.sh
# Script to initialize Let's Encrypt SSL certificates for Kasirin POS

set -e

DOMAINS=("teamapple.my.id" "www.teamapple.my.id" "pgadmin.teamapple.my.id")
EMAIL="admin@kasirin.com"

echo "==================================="
echo "🔒 Let's Encrypt SSL Initializer"
echo "==================================="
echo ""

# Check if docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running or docker command is not available."
    exit 1
fi

# Check if containers are active
if [ -z "$(docker compose ps --services --filter status=running)" ]; then
    echo "⚠️  Kasirin containers are not running. Starting them up in the background first..."
    docker compose up -d
    echo "Waiting for Nginx to boot up..."
    sleep 5
fi

echo "Requesting SSL certificate for: ${DOMAINS[*]}..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    $(printf -- "-d %s " "${DOMAINS[@]}") \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive

echo ""
echo "🔄 Reloading Nginx in frontend container to apply the new certificates..."
docker compose exec frontend /entrypoint.sh update-links
docker compose exec frontend nginx -s reload

echo ""
echo "==================================="
echo "✅ Let's Encrypt SSL Setup Complete!"
echo "==================================="
