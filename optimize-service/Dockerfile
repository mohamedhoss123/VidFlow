FROM golang:1.24-alpine

WORKDIR /app

RUN go install github.com/air-verse/air@latest

COPY go.mod ./

COPY . .

RUN apk update && apk add --no-cache ffmpeg

CMD ["air", "-c", ".air.toml"]