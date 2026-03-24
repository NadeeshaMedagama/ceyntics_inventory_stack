FROM php:8.5-fpm-alpine

RUN apk add --no-cache nginx postgresql-dev libpng-dev libjpeg-turbo-dev \
    freetype-dev libzip-dev zip unzip curl git supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd zip bcmath opcache

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .
RUN composer install --no-interaction --optimize-autoloader \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf

EXPOSE 8000
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
