FROM php:8.0-apache

# Install mysqli extension for database connection
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Enable Apache mod_rewrite for custom 404 routing
RUN a2enmod rewrite

# Copy custom apache config
COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html
COPY src/ /var/www/html/

RUN chown -R www-data:www-data /var/www/html/
