FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL and libc for Prisma compatibility in Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including TypeScript devDependencies needed for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source files
COPY . .

# Build TypeScript to JavaScript in /dist
RUN npm run build

# Prune devDependencies to keep the production bundle clean and lightweight
RUN npm prune --omit=dev

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL in runner for Prisma runtime execution
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

# Copy built artifacts and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
