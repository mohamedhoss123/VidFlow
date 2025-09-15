# Node.js development environment
FROM node:22-alpine3.20

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies (this layer will be cached if package files don't change)
RUN pnpm install

# Copy and setup startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Copy source code (this will be overridden by volume mount in development)
COPY . .

# Expose ports
EXPOSE 3000 50051

# Start development server
CMD ["sh", "/app/start.sh"]

