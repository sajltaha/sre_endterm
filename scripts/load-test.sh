#!/usr/bin/env bash
set -euo pipefail

# Lightweight capacity test for the local Docker Compose demo.
# It generates traffic through the API Gateway and prints success/error counts.

BASE_URL="${BASE_URL:-http://localhost:3000}"
REQUESTS="${REQUESTS:-60}"
SLEEP_SECONDS="${SLEEP_SECONDS:-0.05}"

success=0
errors=0
orders=0
payments=0
products=0

require_service() {
  if ! curl -fsS "${BASE_URL}/health" >/dev/null; then
    echo "API Gateway is not reachable at ${BASE_URL}."
    echo "Start the stack first: ./scripts/start-compose.sh"
    exit 1
  fi
}

record_result() {
  local status="$1"
  if [[ "$status" =~ ^2|3 ]]; then
    success=$((success + 1))
  else
    errors=$((errors + 1))
  fi
}

request_status() {
  curl -sS -o /dev/null -w "%{http_code}" "$@"
}

require_service

echo "Starting lightweight load test"
echo "Base URL: ${BASE_URL}"
echo "Requests: ${REQUESTS}"
echo

start_time="$(date +%s)"

for i in $(seq 1 "${REQUESTS}"); do
  case $((i % 3)) in
    0)
      status="$(request_status "${BASE_URL}/api/products")"
      products=$((products + 1))
      ;;
    1)
      status="$(request_status -X POST "${BASE_URL}/api/orders" \
        -H "Content-Type: application/json" \
        -d '{"userId":1,"productId":1,"quantity":1}')"
      orders=$((orders + 1))
      ;;
    2)
      status="$(request_status -X POST "${BASE_URL}/api/payments" \
        -H "Content-Type: application/json" \
        -d '{"orderId":1,"amount":100}')"
      payments=$((payments + 1))
      ;;
  esac

  record_result "${status}"
  sleep "${SLEEP_SECONDS}"
done

end_time="$(date +%s)"
duration=$((end_time - start_time))
if [[ "${duration}" -lt 1 ]]; then
  duration=1
fi

echo "Load test summary"
echo "-----------------"
echo "Total requests: ${REQUESTS}"
echo "Successful responses: ${success}"
echo "Failed responses: ${errors}"
echo "Product read requests: ${products}"
echo "Order create requests: ${orders}"
echo "Payment create requests: ${payments}"
echo "Approximate duration: ${duration}s"
echo "Approximate throughput: $((REQUESTS / duration)) req/s"
echo
echo "Now check:"
echo "- Grafana request rate, latency, and error panels: http://localhost:3007"
echo "- Prometheus query: sum(rate(http_requests_total[5m])) by (service)"

