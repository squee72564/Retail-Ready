FROM golang:1.24.6-alpine

WORKDIR /app

# Copy go.mod and go.sum first for dependency resolution
COPY go.mod ./

# Download modules (this helps caching layers)
RUN go mod download

# Now copy the rest of the source code
COPY main.go ./

RUN go build -o app .

EXPOSE 8080

CMD ["./app"]
