# Use Node.js as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Install dependencies
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Expose the development server port
EXPOSE 3001

# Start the development server
CMD ["npm", "run", "start"]