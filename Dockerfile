# Stage 1: Build the Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app
COPY placement-copilot/backend/pom.xml .
COPY placement-copilot/backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Build the Next.js frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY placement-copilot/frontend/package*.json ./
RUN npm ci
COPY placement-copilot/frontend/. .
RUN npm run build

# Stage 3: Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install Java 17 JRE for the backend
RUN apk add --no-cache openjdk17-jre

# Copy the built backend jar
COPY --from=backend-builder /app/target/backend-0.0.1-SNAPSHOT.jar ./backend.jar

# Copy Next.js frontend files
COPY --from=frontend-builder /app/next.config.js ./
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/package.json ./package.json

# Copy start script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose ports
EXPOSE 8080
EXPOSE 8081

# Set production env
ENV NODE_ENV=production
ENV PORT=8080
ENV BACKEND_URL=http://localhost:8081

CMD ["./start.sh"]
