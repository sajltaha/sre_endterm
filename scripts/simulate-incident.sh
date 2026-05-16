#!/usr/bin/env bash
set -euo pipefail

# Simulate an order-service outage by recreating it with FAIL_ORDER_SERVICE=true.
docker compose -f docker-compose.yml -f docker-compose.incident.yml up -d --no-deps order-service

cat <<'EOF'
Incident simulated.

Expected behavior:
- order-service health becomes DOWN
- frontend Orders page shows an order creation error
- Prometheus OrderServiceDown alert can trigger

Checks:
curl -i http://localhost:3003/health
curl http://localhost:3000/services/health
EOF
