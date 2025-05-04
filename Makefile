# Global

image_name = $(shell docker-compose ps -q Charon)

# Check Os
ifdef OS # Windown
	RM = del /Q
	RMDIR = rmdir /q /s
	COPY = copy

else # Linux, Unix, MacOs
	RM = rm -rf
	RMDIR = rm -rf
	COPY =  cp -r

# Get shell
# UNAME_S := $(shell uname -s)
endif

# For normal

init:
	php artisan charon:init

setup:
	@make env
	@make key

env:
	$(COPY) .env.example .env

key:
	php artisan key:generate
	php artisan config:cache

build:
	yarn build


data:
	@make migrate
	@make seed

migrate:
	php artisan migrate

seed:
	php artisan db:seed

run:
	php artisan serve --port=8000

cache:
	php artisan config:cache
	
sync:
	php artisan charon:sync

import:
	php artisan charon:search:import
