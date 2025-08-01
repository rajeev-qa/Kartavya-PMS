.PHONY: help install setup dev build test clean docker-build docker-up docker-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd server && npm install
	@echo "Installing frontend dependencies..."
	npm install

setup: install ## Setup the project (install deps, setup DB, seed data)
	@echo "Setting up database..."
	cd server && npm run db:generate && npm run db:push && npm run db:seed
	@echo "Setup complete!"

dev: ## Start development servers
	@echo "Starting development environment..."
	chmod +x scripts/start-dev.sh
	./scripts/start-dev.sh

build: ## Build the application
	@echo "Building backend..."
	cd server && npm run build
	@echo "Building frontend..."
	npm run build

test: ## Run tests
	@echo "Running backend tests..."
	cd server && npm test
	@echo "Running frontend tests..."
	npm test

clean: ## Clean node_modules and build artifacts
	@echo "Cleaning..."
	rm -rf node_modules server/node_modules
	rm -rf .next server/dist
	rm -rf coverage server/coverage

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

migrate: ## Run database migrations
	cd server && npm run db:migrate

seed: ## Seed database with sample data
	cd server && npm run db:seed

deploy-staging: ## Deploy to staging
	@echo "Deploying to staging..."
	# Add staging deployment commands

deploy-prod: ## Deploy to production
	@echo "Deploying to production..."
	# Add production deployment commands
