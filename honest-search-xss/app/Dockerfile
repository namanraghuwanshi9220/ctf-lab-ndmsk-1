# Use PHP + Apache for the Web App, but also install Node.js for the Headless Bot
FROM php:8.1-apache

# Install Node.js, npm, and Chromium (for the XSS Bot)
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    chromium \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set up the Apache web root
WORKDIR /var/www/html
COPY src/ .

# Set up the Admin Bot
WORKDIR /opt/bot
COPY package.json .
RUN npm install puppeteer-core express
COPY bot.js .

# Expose Web Port and Bot internal API
EXPOSE 80
EXPOSE 3001

# Start Apache in the background, and start the Node Bot in the foreground
CMD apache2ctl start && node bot.js
