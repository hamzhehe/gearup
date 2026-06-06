FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./

RUN mkdir -p uploads config

ENV NODE_ENV=production

CMD ["npm", "start"]
