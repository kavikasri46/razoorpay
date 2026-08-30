FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDeps for vite build)
RUN npm ci

# Copy source files
COPY . .

# Build for production
RUN npm run build

# Production stage — serve with nginx
FROM nginx:alpine AS runner

# Copy built assets to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
