# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app code
COPY . .

# Create scripts directory
RUN mkdir -p scripts

# Expose port
EXPOSE 5000

# Start: seed passwords then launch server
CMD ["sh", "-c", "node scripts/seed-passwords.js && node server.js"]
