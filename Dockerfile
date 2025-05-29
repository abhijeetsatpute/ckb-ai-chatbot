# Step 1: Build React client
FROM node:18-slim AS client-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Step 2: Server with Playwright dependencies
FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy server dependencies and install
COPY server/package*.json ./server/
RUN cd server && npm install && npx playwright install --with-deps

# Copy server code and React build
COPY server ./server
COPY --from=client-builder /app/client/dist /app/client/dist

# Set working directory to server
WORKDIR /app/server

EXPOSE 3000

CMD ["node", "index.js"]
