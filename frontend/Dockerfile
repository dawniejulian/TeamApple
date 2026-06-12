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
ENV GENERATE_SOURCEMAP=false

RUN npm run build

# Production stage
FROM nginx:1.27-alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/ssl/private /etc/ssl/certs && \
    # Create self-signed cert with SAN including VPS IP 206.237.98.213
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=ID/ST=Jogja/L=Jogja/O=TeamApple/CN=206.237.98.213" \
    -addext "subjectAltName = IP:206.237.98.213"

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
EXPOSE 3443

CMD ["nginx", "-g", "daemon off;"]
