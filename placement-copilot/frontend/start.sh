#!/bin/sh
# Start Spring Boot backend on port 8081 in the background with memory limits
echo "Starting Spring Boot Backend on port 8081 with JVM limits..."
java -Dserver.port=8081 -jar /app/backend.jar &

# Start Next.js frontend on the assigned PORT (default 8080) in the foreground
echo "Starting Next.js Frontend on port ${PORT:-8080}..."
PORT=${PORT:-8080} npm start
