#!/usr/bin/env bash
set -euo pipefail

# Build local images used by docker-stack.yml.
docker build -t sre-auth-service:latest ./services/auth-service
docker build -t sre-product-service:latest ./services/product-service
docker build -t sre-order-service:latest ./services/order-service
docker build -t sre-payment-service:latest ./services/payment-service
docker build -t sre-notification-service:latest ./services/notification-service
docker build -t sre-user-profile-service:latest ./services/user-profile-service
docker build -t sre-api-gateway:latest ./api-gateway
docker build -t sre-frontend:latest ./frontend

if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q active; then
  docker swarm init
else
  echo "Docker Swarm is already initialized."
fi

docker stack deploy -c docker-stack.yml sre-app
docker stack services sre-app

echo
echo "Swarm deployed. Useful commands:"
echo "docker service ls"
echo "docker stack ps sre-app"
