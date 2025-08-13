#!/bin/bash

# Array of URLs
urls=(
  "http://localhost:3000/api/docs-yaml"
)

# Matching names for each URL
names=(
  "main-service.yaml"
)

# Create docs folder if it doesn't exist
mkdir -p files

# Loop through URLs and download
for i in "${!urls[@]}"; do
  wget -O "files/${names[$i]}" "${urls[$i]}"
done

pnpm generate
pnpm preview