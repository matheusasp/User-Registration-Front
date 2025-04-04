FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build app for production
RUN npm run build

# Install simple http server to serve static content
RUN npm install -g http-server

# Expose port
EXPOSE 8080

# Start application
CMD ["http-server", "dist"]