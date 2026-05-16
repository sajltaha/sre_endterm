# Architecture

This project implements a local SRE demonstration platform using independent Node.js microservices, Docker Compose for local execution, Docker Swarm and Kubernetes for orchestration examples, Terraform for reproducible infrastructure, Ansible for server configuration, and Prometheus/Grafana for observability.

## Diagram

```text
User Browser
    |
    v
Frontend Nginx :8080
    |
    v
API Gateway :3000
    |
    +--> auth-service :3001
    +--> product-service :3002
    +--> order-service :3003 ----> product-service
    |                              payment-service
    +--> payment-service :3004
    +--> notification-service :3005
    +--> user-profile-service :3006

PostgreSQL :5432 is included as persistent infrastructure.

Prometheus :9090 scrapes /metrics from all services.
Grafana :3007 visualizes uptime, request rate, error rate, latency, CPU, and memory.
```

## Service Communication

The API gateway forwards requests to service-specific routes. The order service demonstrates internal dependency behavior by validating products through `product-service` and creating a payment through `payment-service`.

## Monitoring Flow

Each Node.js service exposes `/metrics` using `prom-client`. Prometheus scrapes those metrics every 15 seconds and evaluates alert rules for service availability, error rate, latency, and order-service failure. Grafana can import `monitoring/grafana-dashboard.json` to visualize SRE indicators.

