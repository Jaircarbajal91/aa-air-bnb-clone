# Multi-stage: CRA frontend build, then Express as non-root.
FROM node:18-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
ENV CI=false
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

FROM node:18-alpine AS runtime
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev \
  && apk del python3 make g++

COPY --chown=node:node backend ./backend
COPY --from=frontend --chown=node:node /frontend/build ./frontend/build

USER node

ENV NODE_ENV=production \
    PORT=8000

EXPOSE 8000

CMD ["node", "backend/bin/www"]
