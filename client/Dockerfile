# Node.js development environment
FROM node:22-alpine3.20

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .




# Start development server
CMD ["pnpm", "run", "dev"]

