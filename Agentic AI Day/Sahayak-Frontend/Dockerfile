# ------------------------
# 1. Base Image
# ------------------------
FROM node:20-alpine AS base
WORKDIR /app

# ------------------------
# 2. Dependencies Layer
# ------------------------
FROM base AS deps
# Copy dependency files first to leverage Docker caching
COPY package.json package-lock.json ./
# Clean install using package-lock.json
RUN npm ci --prefer-offline
# Optional: Fix known vulnerabilities
RUN npm audit fix || true

# ------------------------
# 3. Builder Layer
# ------------------------
FROM base AS builder
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy app source code
COPY . .

# Copy service account credentials (optional)
# COPY google-credentials.json ./google-credentials.json
COPY google-credentials.json ./google-credentials.json
ENV GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Build Next.js app with standalone output
RUN npm run build

# ------------------------
# 4. Runner Layer (Slim Final Image)
# ------------------------
FROM base AS runner
WORKDIR /app

# Add non-root user for better security
RUN addgroup --system --gid 1001 nextjs \
  && adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy built app (standalone mode)
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Optional: copy credentials if your app uses them at runtime
COPY --from=builder --chown=nextjs:nextjs /app/google-credentials.json ./google-credentials.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/google-credentials.json

# Use non-root user
USER nextjs

# Expose default Next.js port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
