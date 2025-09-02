FROM golang:1.24-alpine

WORKDIR /app

RUN go install github.com/air-verse/air@latest

COPY go.mod ./

COPY . .


CMD ["air", "-c", ".air.toml"]
