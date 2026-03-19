# Frontend Dockerfile
FROM node:18-alpine AS build

# Build arguments untuk compile-time env vars
# HARUS di-set sebelum build untuk React environment variables
ARG REACT_APP_API_URL=http://backend:5000/api

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Set ENV dari ARG untuk build process
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
