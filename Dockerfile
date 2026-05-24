FROM node:20-alpine

# Install git (required for GitHub Actions to work with repository)
RUN apk add --no-cache git

# Set working directory
WORKDIR /action

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (production only for runtime, dev for build)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
