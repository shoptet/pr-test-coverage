FROM node:24-alpine

# Set working directory
WORKDIR /action

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies and tsx for running TypeScript
RUN npm install && npm install -g tsx

# Copy source code
COPY src/ ./src/

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
