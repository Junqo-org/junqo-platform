#!/bin/bash

# Script to generate self-signed certificates for testing
# This creates certificates that work for localhost and common test domains

CERT_DIR="${1:-./ssl_certs}"
CERT_PATH="/live/junqo.fr"
OPTIONS_SSL_NGINX="./tools/options-ssl-nginx.conf"
DOMAIN="${2:-localhost}"

echo "🔐 Generating self-signed certificates for testing..."
echo "📁 Certificate directory: $CERT_DIR"
echo "📁 Certificate path: $CERT_PATH"
echo "🌐 Domain: $DOMAIN"

# Create directory if it doesn't exist
mkdir -p "$CERT_DIR$CERT_PATH"

# Copy SSL options file
cp "$OPTIONS_SSL_NGINX" "$CERT_DIR/options-ssl-nginx.conf"

# Generate SSL DH parameters if they don't exist
if [ ! -f "$CERT_DIR/ssl-dhparams.pem" ]; then
    echo "🔑 Generating SSL DH parameters..."
    openssl dhparam -out "$CERT_DIR/ssl-dhparams.pem" 2048
    chmod 644 "$CERT_DIR/ssl-dhparams.pem"
fi

# Generate private key
openssl genrsa -out "$CERT_DIR$CERT_PATH/privkey.pem" 2048

# Generate certificate signing request
openssl req -new -key "$CERT_DIR$CERT_PATH/privkey.pem" -out "$CERT_DIR$CERT_PATH/cert.csr" -subj "/C=FR/ST=Ile-de-France/L=Paris/O=Junqo/OU=Development/CN=$DOMAIN/emailAddress=dev@junqo.fr"

# Generate self-signed certificate
openssl x509 -req -in "$CERT_DIR$CERT_PATH/cert.csr" -signkey "$CERT_DIR$CERT_PATH/privkey.pem" -out "$CERT_DIR$CERT_PATH/fullchain.pem" -days 365 -extensions v3_req -extfile <(
cat << EOF
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = localhost
DNS.3 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
)

# Clean up CSR
rm "$CERT_DIR$CERT_PATH/cert.csr"

# Set appropriate permissions
chmod 600 "$CERT_DIR$CERT_PATH/privkey.pem"
chmod 644 "$CERT_DIR$CERT_PATH/fullchain.pem"

echo "✅ Self-signed certificates generated successfully!"
echo "📄 Private key: $CERT_DIR$CERT_PATH/privkey.pem"
echo "📄 Certificate: $CERT_DIR$CERT_PATH/fullchain.pem"
echo ""
echo "ℹ️  These certificates are for testing purposes only."
echo "⚠️  Browsers will show security warnings for self-signed certificates."
