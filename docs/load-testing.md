# Load Testing and Capacity Evidence

This project includes a lightweight load test script:

```bash
./scripts/load-test.sh
```

## Purpose

The script generates traffic through the API Gateway to support the capacity planning section of the final report. It targets the most important paths:

- product reads
- order creation
- payment creation

These paths are useful because Order Service and Payment Service are on the critical business workflow.

## How to Run

Start the local stack first:

```bash
./scripts/start-compose.sh
```

Run the default load test:

```bash
./scripts/load-test.sh
```

Run a larger test:

```bash
REQUESTS=300 SLEEP_SECONDS=0.02 ./scripts/load-test.sh
```

## What to Observe

After running the script, open:

```text
Grafana: http://localhost:3007
Prometheus: http://localhost:9090
```

Useful PromQL queries:

```promql
sum(rate(http_requests_total[5m])) by (service)
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
```

## Capacity Planning Connection

The script supports the following findings:

1. Order Service and Payment Service are critical because order creation depends on payment creation.
2. Increased request volume is visible in Prometheus and Grafana request-rate panels.
3. Latency and error-rate panels can be used to decide when horizontal scaling is needed.
4. PostgreSQL is identified as a future bottleneck if persistent order and payment storage is added.

## Report Text

You can use this text in the final PDF:

```text
A lightweight load test was implemented to generate traffic against the product, order, and payment workflows. The test sends requests through the API Gateway and allows Prometheus and Grafana to show request rate, latency, and error behavior under increased load. The results support the capacity planning conclusion that Order Service and Payment Service are critical scaling targets.
```

