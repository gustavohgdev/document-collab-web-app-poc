# docker/frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
COPY frontend/postcss.config.cjs ./postcss.config.cjs
COPY frontend/tailwind.config.js ./
COPY frontend/tsconfig.json ./
COPY frontend/vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend files
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
