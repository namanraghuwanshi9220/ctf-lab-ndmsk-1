# Use specific alpine version for smaller attack surface
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json ./

# Install dependencies (Changed from 'npm ci' to 'npm install' to fix lockfile error)
RUN npm install --ignore-scripts

# Copy app source code
COPY . .

# HARDENING: Do not run as root. Use the built-in 'node' user.
RUN chown -R node:node /usr/src/app
USER node

# Expose port
EXPOSE 3000

# Start app
CMD [ "node", "server.js" ]
