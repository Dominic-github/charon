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
	@make generate-key

env:
	$(COPY) .env.example .env

generate-key:
	php artisan key:generate

data:
	@make migrate
	@make seed

migrate:
	php artisan migrate

seed:
	php artisan db:seed

up:
	php artisan serve --host=localhost --port=80

cache:
	php artisan config:cache
	
sync:
	php artisan charon:sync

# For docker

docker-setup:
	@make docker-env
	@make docker-generate-key
	@make docker-up
	@make compose-install

composer-install:
	docker exec -it $(image_name) composer install

composer-update:
	docker exec -it $(image_name) composer update

docker-env:
	$(COPY) .env.example .env

docker-generate-key:
	docker exec $(image_name) bash -c "php artisan key:generate"

docker-data:
	@make docker-migrate
	@make docker-seed

docker-migrate:
	docker exec $(image_name) bash -c "php artisan migrate"

docker-seed:
	docker exec $(image_name) bash -c "php artisan db:seed"

docker-up:
	docker-composer up -d

docker-stop:
	docker-composer stop
