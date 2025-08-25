#!/bin/bash
set -e

# RabbitMQ Initialization Script for VidFlow
# This script ensures the required user and vhost are created

echo "Starting RabbitMQ initialization..."

# Start RabbitMQ in the background
rabbitmq-server &
RABBITMQ_PID=$!

# Wait for RabbitMQ to be ready
echo "Waiting for RabbitMQ to start..."
sleep 15

# Wait for RabbitMQ ping to work
MAX_ATTEMPTS=30
ATTEMPT=0
until rabbitmqctl ping > /dev/null 2>&1; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo "RabbitMQ failed to respond to ping after $MAX_ATTEMPTS attempts"
        exit 1
    fi
    echo "Waiting for RabbitMQ to be ready... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 3
done

# Additional wait and check that we can actually run commands
echo "RabbitMQ ping successful, waiting for full initialization..."
sleep 5

# Verify RabbitMQ is truly ready by checking if we can list users
MAX_ATTEMPTS=10
ATTEMPT=0
until rabbitmqctl list_users > /dev/null 2>&1; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo "RabbitMQ failed to become fully ready after $MAX_ATTEMPTS attempts"
        exit 1
    fi
    echo "RabbitMQ not fully ready yet, waiting... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 3
done

echo "RabbitMQ is ready. Setting up user and vhost..."

# Create the vidflow_admin user if it doesn't exist
if ! rabbitmqctl list_users | grep -q "vidflow_admin"; then
    echo "Creating user: vidflow_admin"
    rabbitmqctl add_user vidflow_admin "VidFlow_RabbitMQ_2025!"
    rabbitmqctl set_user_tags vidflow_admin administrator
else
    echo "User vidflow_admin already exists"
fi

# Create the vidflow vhost if it doesn't exist
if ! rabbitmqctl list_vhosts | grep -q "vidflow"; then
    echo "Creating vhost: vidflow"
    rabbitmqctl add_vhost vidflow
else
    echo "Vhost vidflow already exists"
fi

# Set permissions for the user on the vhost
echo "Setting permissions for vidflow_admin on vidflow vhost"
rabbitmqctl set_permissions -p vidflow vidflow_admin ".*" ".*" ".*"

# Disable guest user for security (if it exists)
if rabbitmqctl list_users | grep -q "guest"; then
    echo "Disabling guest user for security"
    rabbitmqctl delete_user guest || true
fi

echo "RabbitMQ initialization completed successfully!"

# Keep RabbitMQ running in the foreground
wait $RABBITMQ_PID
