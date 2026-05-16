#!/usr/bin/env bash
set -euo pipefail

# Recover order-service using the normal docker-compose.yml environment.
docker compose up -d --no-deps order-service
echo "Recovery complete."
echo "Check: curl -i http://localhost:3003/health"
