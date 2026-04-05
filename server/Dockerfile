# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Faqat production dependency lar
COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

# Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Build natijasi
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health/ping || exit 1

EXPOSE 3000

CMD ["node", "dist/main"]
