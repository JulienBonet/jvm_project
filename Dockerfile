# Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client ./
RUN npm run build

# Build backend
FROM node:22-alpine

WORKDIR /app

COPY server/package*.json ./server/
WORKDIR /app/server

RUN npm ci --omit=dev

COPY server ./

# Injection du build React
COPY --from=frontend-builder /app/client/dist /app/client/dist

EXPOSE 3001

CMD ["node", "index.js"]