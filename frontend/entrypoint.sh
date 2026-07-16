#!/bin/sh
# frontend/entrypoint.sh

LE_DIR="/etc/letsencrypt/live/teamapple.my.id"
SSL_DIR="/etc/nginx/ssl"

mkdir -p "$SSL_DIR"

update_links() {
    if [ -f "$LE_DIR/fullchain.pem" ] && [ -f "$LE_DIR/privkey.pem" ]; then
        echo "Let's Encrypt certificates found. Using them..."
        ln -sf "$LE_DIR/fullchain.pem" "$SSL_DIR/ssl-cert.crt"
        ln -sf "$LE_DIR/privkey.pem" "$SSL_DIR/ssl-key.key"
    else
        echo "Let's Encrypt certificates not found. Using fallback self-signed certificates..."
        ln -sf /etc/ssl/certs/nginx-selfsigned.crt "$SSL_DIR/ssl-cert.crt"
        ln -sf /etc/ssl/private/nginx-selfsigned.key "$SSL_DIR/ssl-key.key"
    fi
}

# Run initial symlink update
update_links

# Check if we should update-links or run full entrypoint
if [ "$1" = "update-links" ]; then
    update_links
    exit 0
fi

# Start background reload loop (checks and reloads every 24 hours)
(
    while true; do
        sleep 24h
        echo "Daily certificate check and Nginx reload..."
        update_links
        nginx -s reload
    done
) &

# Execute the main container CMD (usually starting nginx)
echo "Starting Nginx..."
exec "$@"
