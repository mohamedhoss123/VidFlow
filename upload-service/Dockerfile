FROM golang:1.25-alpine

# Install Air for hot reloading
RUN go install github.com/air-verse/air@latest

# Set working directory
WORKDIR /app

# Copy go mod files first for better caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Ensure go.mod is properly initialized
RUN go mod tidy

# Create tmp directory for Air
RUN mkdir -p tmp

# Expose port
EXPOSE 8081

# Start with Air for hot reloading
CMD ["air", "-c", ".air.toml"]
