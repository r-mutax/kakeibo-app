# Simple production Docker image for Kakeibo App
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && npm run build

# Create data directory for SQLite
RUN mkdir -p /app/data

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/data/prod.db"

# Initialize database and start app
CMD ["sh", "-c", "npx prisma migrate deploy && node .next/standalone/server.js"]