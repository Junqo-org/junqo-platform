#!/bin/bash

# Script to generate self-signed certificates for testing
# This creates certificates that work for localhost and common test domains

CERT_DIR="${1:-./ssl_certs}"
DOMAIN="${2:-localhost}"

echo "🔐 Generating self-signed certificates for testing..."
echo "📁 Certificate directory: $CERT_DIR"
echo "🌐 Domain: $DOMAIN"

# Create directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Generate private key
openssl genrsa -out "$CERT_DIR/privkey.pem" 2048

# Generate certificate signing request
openssl req -new -key "$CERT_DIR/privkey.pem" -out "$CERT_DIR/cert.csr" -subj "/C=FR/ST=Ile-de-France/L=Paris/O=Junqo/OU=Development/CN=$DOMAIN/emailAddress=dev@junqo.fr"

# Generate self-signed certificate
openssl x509 -req -in "$CERT_DIR/cert.csr" -signkey "$CERT_DIR/privkey.pem" -out "$CERT_DIR/fullchain.pem" -days 365 -extensions v3_req -extfile <(
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
rm "$CERT_DIR/cert.csr"

# Set appropriate permissions
chmod 600 "$CERT_DIR/privkey.pem"
chmod 644 "$CERT_DIR/fullchain.pem"

echo "✅ Self-signed certificates generated successfully!"
echo "📄 Private key: $CERT_DIR/privkey.pem"
echo "📄 Certificate: $CERT_DIR/fullchain.pem"
echo ""
echo "ℹ️  These certificates are for testing purposes only."
echo "⚠️  Browsers will show security warnings for self-signed certificates."