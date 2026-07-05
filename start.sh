#!/bin/sh
# Start Spring Boot backend on port 8081 in the background
echo "Starting Spring Boot Backend on port 8081..."
java -Dserver.port=8081 -jar /app/backend.jar &

# Start Next.js frontend on port 8080 in the foreground
echo "Starting Next.js Frontend on port 8080..."
PORT=8080 npm start
