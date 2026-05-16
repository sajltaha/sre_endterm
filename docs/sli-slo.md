# SLI and SLO Definition

## SLIs

- Availability = successful requests / total requests * 100
- Latency = 95th percentile response time
- Error Rate = failed requests / total requests * 100
- Request Success Rate = 2xx responses / total requests * 100

## SLOs

- Availability >= 99%
- Latency <= 200ms for 95% of requests
- Error Rate <= 1%
- Request Success Rate >= 99%

## Example PromQL

```promql
up
rate(http_requests_total[5m])
rate(http_requests_total{status=~"5.."}[5m])
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
sum(rate(http_requests_total{status=~"2.."}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service) * 100
```

## Error Budget

For a 99% monthly availability SLO, the service has a 1% monthly error budget. If the system receives 100,000 requests per month, up to 1,000 failed requests can occur before the error budget is exhausted.

