# Root monorepo Dockerfile for backend/orderproducts services.
# Use --build-arg SERVICE=backend or --build-arg SERVICE=orderproducts
# Optionally set PORT=3000 or PORT=3001 for the chosen service.

FROM node:20-alpine AS builder
ARG SERVICE=backend
WORKDIR /app

COPY ${SERVICE}/package.json ./
RUN npm install

COPY ${SERVICE} ./
RUN npx prisma generate
RUN npm prune --production

FROM node:20-alpine AS runner
WORKDIR /app
ARG PORT=3000
ENV NODE_ENV=production
ENV PORT=${PORT}

COPY --from=builder /app ./

EXPOSE ${PORT}
CMD ["node", "src/server.js"]
