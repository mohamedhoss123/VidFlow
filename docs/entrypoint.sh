#!/bin/sh
set -e

# Pairs of (url name)
URLS="
http://172.20.0.8:3000/api/docs-yaml main-service.yaml
http://upload-service:8081/swagger.yaml upload-service.yaml
"

# Create docs folder if it doesn't exist
mkdir -p files

# Create docs folder
mkdir -p files

while read -r url name; do
  [ -z "$url" ] && continue
  echo "Downloading $url -> files/$name"
  wget -q -O "files/$name" "$url"
done <<EOF
http://main-service:3000/api/docs-yaml main-service.yaml
http://upload-service:8081/swagger.yaml upload-service.yaml
EOF


# Generate and start preview
pnpm generate
exec pnpm preview
