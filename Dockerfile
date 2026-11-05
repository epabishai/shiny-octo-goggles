FROM node:20-alpine

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY src/ ./src/
COPY public/ ./public/
COPY fixtures/ ./fixtures/

USER node

EXPOSE 3000

CMD ["node", "server.js"]
