#!/bin/sh

# Always ensure dependencies are installed and up to date
echo "Installing/updating dependencies..."
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
pnpm prisma generate

# Run database migrations
echo "Running database migrations..."
pnpm prisma migrate deploy

# Start the development server
echo "Starting development server..."
pnpm run start:dev
