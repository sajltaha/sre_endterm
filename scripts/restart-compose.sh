#!/usr/bin/env bash
set -euo pipefail

# Restart the full local demo stack.
docker compose down
docker compose up --build -d
docker compose ps

echo "Restart complete: http://localhost:8080"

