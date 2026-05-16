#!/usr/bin/env bash
set -euo pipefail

# Build and start the complete local SRE stack.
docker compose up --build -d
docker compose ps

cat <<'EOF'

SRE demo is starting.
Frontend:    http://localhost:8080
API Gateway: http://localhost:3000
Prometheus:  http://localhost:9090
Grafana:     http://localhost:3007  admin/admin

Useful checks:
curl http://localhost:3000/health
curl http://localhost:3000/services/health
EOF
