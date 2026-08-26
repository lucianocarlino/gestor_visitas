FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code and configuration files
COPY . .

# Build production static bundle (outputs to /app/dist)
RUN npm run build

FROM nginx:alpine

# Remove default boilerplate nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration into conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 5000

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]