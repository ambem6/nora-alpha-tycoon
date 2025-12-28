#!/bin/bash
DOCKER_COMPOSE_FILE="infra/docker/docker-compose.yml"
echo "🚀 Deploying Nora Alpha Tycoon..."
if ! docker info > /dev/null 2>&1; then echo "❌ Docker not running"; exit 1; fi
docker-compose -f $DOCKER_COMPOSE_FILE build
docker-compose -f $DOCKER_COMPOSE_FILE down
docker-compose -f $DOCKER_COMPOSE_FILE up -d
docker-compose -f $DOCKER_COMPOSE_FILE exec gateway npx prisma migrate deploy
docker image prune -f
echo "✅ Deployment Complete!"
