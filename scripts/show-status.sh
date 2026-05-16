#!/usr/bin/env bash
set -euo pipefail

# Show container status and key API health responses.
docker compose ps

echo
echo "API Gateway health:"
curl -fsS http://localhost:3000/health || true

echo
echo
echo "All service health through API Gateway:"
curl -fsS http://localhost:3000/services/health || true
echo

