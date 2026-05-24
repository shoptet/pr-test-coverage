FROM node:24-alpine

# Set working directory
WORKDIR /action

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (production only for runtime, dev for build)
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
