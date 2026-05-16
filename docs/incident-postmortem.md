# Incident Postmortem

## Incident Title

Order Service failure caused by incorrect database configuration or failure flag.

## Summary

The order service was intentionally placed in a failed state using `FAIL_ORDER_SERVICE=true`. Health checks returned HTTP 500 and order creation returned HTTP 503. Metrics stayed available so Prometheus could detect and alert on the incident.

## Impact

Users could browse products and use other services, but they could not create new orders. The API gateway continued running, but order-related requests failed.

## Timeline

- 10:00 - Incident simulation started with `scripts/simulate-incident.sh`.
- 10:01 - `/health` for order-service returned 500.
- 10:02 - Prometheus `OrderServiceDown` alert became active.
- 10:05 - Operator confirmed the failure flag was enabled.
- 10:08 - Recovery script restored normal environment.
- 10:09 - Health checks returned 200 and order creation worked again.

## Detection

The incident was detected through Prometheus scraping `service_health{service="order-service"}` and the `/health` endpoint.

## Root Cause

The order service was started with `FAIL_ORDER_SERVICE=true`, representing an incorrect configuration or failed dependency scenario.

## Resolution

The service was recreated with `FAIL_ORDER_SERVICE=false` using `scripts/recover-incident.sh`.

## What Went Well

- Metrics remained available during failure.
- The failure was isolated to order creation.
- Recovery was automated through a script.

## What Went Wrong

- The order workflow had a hard dependency on product and payment service availability.
- No fallback or queue existed for delayed order processing.

## Preventive Actions

- Add CI checks for dangerous environment variables.
- Add deployment validation before rollout.
- Add retry and circuit breaker behavior for downstream calls.
- Add alerts for configuration drift.

## Lessons Learned

SRE practice requires not only detecting failure, but also having simple recovery procedures, documented ownership, and clear SLO-based impact assessment.

