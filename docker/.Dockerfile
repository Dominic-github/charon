# Install php
ARG PHP_VERSION=8.2.28 

FROM php:${PHP_VERSION}-fpm-alpine
# The charon version to download
ARG CHARON_VERSION=v2.0.1

# Install vim for easier editing/debugging
RUN apt-get update && apt-get install -y vim

# Download the charon release
RUN curl -L https://github.com/dominic-github/charon/archive/refs/tags/${CHARON_VERSION}.tar.gz | tar -xz -C /tmp \
  && cd /tmp/charon/ \
  && rm -rf .editorconfig \
    .eslintignore \
    .Makefile \
    .Makefile \
    .eslintrc \
    .git \
    .gitattributes \
    .github \
    .gitignore \
    .gitmodules \
    .gitpod.dockerfile \
    .gitpod.yml \
    api-docs \
    cypress \
    cypress.config.js \
    nginx.conf.example \
    package.json \
    phpstan.neon.dist \
    phpunit.xml.dist \
    resources/artifacts/ \
    ruleset.xml \
    scripts/ \
    vite.config.js



  # Install charon runtime dependencies.
RUN apt-get update \
  && apt-get install --yes --no-install-recommends \
    cron \
    libapache2-mod-xsendfile \
    libzip-dev \
    zip \
    ffmpeg \
    locales \
    libpng-dev \
    libjpeg62-turbo-dev \
    libpq-dev \
    libwebp-dev \
  && docker-php-ext-configure gd --with-jpeg --with-webp \
  # https://laravel.com/docs/8.x/deployment#server-requirements
  # ctype, fileinfo, json, mbstring, openssl, tokenizer and xml are already activated in the base image
  && docker-php-ext-install \
    bcmath \
    exif \
    gd \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    zip \
  && apt-get clean \
  # Create the music volume so it has the correct permissions
  && mkdir /music \
  && chown www-data:www-data /music \
  # Create the search-indexes volume so it has the correct permissions
  && mkdir -p /var/www/html/storage/search-indexes \
  && chown www-data:www-data /var/www/html/storage/search-indexes \
  # Set locale to prevent removal of non-ASCII path characters when transcoding with ffmpeg
  # See https://github.com/charon/docker/pull/91
  && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen \
  && /usr/sbin/locale-gen

# Copy Apache configuration
COPY ./apache.conf /etc/apache2/sites-available/000-default.conf

# Copy php.ini
COPY ./docker/php/php.ini "$PHP_INI_DIR/php.ini"
# /usr/local/etc/php/php.ini

# Deploy Apache configuration
RUN a2enmod rewrite

# Copy the downloaded release
RUN cp -R /tmp/charon/. /var/www/html \
  && chown -R www-data:www-data /var/www/html

# Volumes for the music files and search index
# This declaration must be AFTER creating the folders and setting their permissions
# and AFTER changing to non-root user.
# Otherwise, they are owned by root and the user cannot write to them.
VOLUME ["/music", "/var/www/html/storage/search-indexes"]

ENV FFMPEG_PATH=/usr/bin/ffmpeg \
    MEDIA_PATH=/music \
    STREAMING_METHOD=x-sendfile \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

# Setup bootstrap script.
COPY charon-entrypoint /usr/local/bin/
ENTRYPOINT ["charon-entrypoint"]
CMD ["apache2-foreground"]

EXPOSE 80

# Check that the homepage is displayed
HEALTHCHECK --start-period=30s --start-interval=5s --interval=5m --timeout=5s \
  CMD curl -f http://localhost/sw.js || exit 1