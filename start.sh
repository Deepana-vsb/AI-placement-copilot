#!/bin/sh
# Start Spring Boot backend on port 8081 in the background with balanced memory limits
echo "Starting Spring Boot Backend on port 8081 with tuned JVM memory..."
java -Dserver.port=8081 \
     -Xms96m -Xmx320m \
     -XX:MaxMetaspaceSize=96m \
     -XX:+UseSerialGC \
     -XX:CICompilerCount=1 \
     -Xss512k \
     -jar /app/backend.jar &

# Start Next.js frontend on the assigned PORT (default 8080) in the foreground
echo "Starting Next.js Frontend on port ${PORT:-8080}..."
PORT=${PORT:-8080} npm start
