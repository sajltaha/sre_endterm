#!/usr/bin/env bash
set -euo pipefail

# Stop containers but keep named volumes for database and Grafana data.
docker compose down
echo "Docker Compose stack stopped."
