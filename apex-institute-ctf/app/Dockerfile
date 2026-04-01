# Use slim instead of alpine to perfectly support sqlite3 native bindings
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json ./

# Install dependencies cleanly
RUN npm install

# Copy app source code (node_modules is ignored via .dockerignore)
COPY . .

# HARDENING: Do not run as root
RUN chown -R node:node /usr/src/app
USER node

# Expose port
EXPOSE 4000

# Start app
CMD [ "node", "server.js" ]
