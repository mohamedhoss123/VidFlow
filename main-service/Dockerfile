# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Create non-root user first
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Install pnpm
RUN npm install -g pnpm

# Set working directory and change ownership
WORKDIR /app
RUN chown appuser:appgroup /app

# Switch to non-root user early
USER appuser

# Copy package files
COPY --chown=appuser:appgroup package.json pnpm-lock.yaml ./

# Install production dependencies and Prisma CLI
RUN pnpm install --frozen-lockfile --prod && pnpm add prisma --save-dev

# Copy built application and necessary files from builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/src/proto ./src/proto

# Generate Prisma client in production stage
RUN pnpm prisma generate

# Expose gRPC port
EXPOSE 50051

# Health check (basic check if the process is running)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD pgrep -f "node.*main" || exit 1

# Start the application
CMD ["node", "dist/main.js"]
