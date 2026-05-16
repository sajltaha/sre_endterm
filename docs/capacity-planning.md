# Capacity Planning

## Traffic Assumptions

- Normal traffic: 20 requests per second.
- Peak traffic: 100 requests per second during demonstrations or load tests.
- Read-heavy workload for products and profiles.
- Write-heavy bottleneck around order creation and payment simulation.

## Resource Usage Analysis

Node.js services are lightweight and can run with 128-256Mi memory for this demo. The order service and payment service require more CPU because they are part of the critical checkout path.

## Bottlenecks

- order-service: depends on product and payment services and can become a workflow bottleneck.
- payment-service: payment simulation is on the critical path.
- PostgreSQL: persistent storage can become a bottleneck if real writes are added.

## Scaling Strategies

- Use horizontal replicas for stateless services.
- Use Kubernetes HPA for order-service and payment-service.
- Add database indexes for real product/order tables.
- Add Redis caching for product catalog reads.
- Increase CPU/RAM for services under sustained load.

## Capacity Table

| Component | Current Capacity | Planned Capacity |
| --- | --- | --- |
| API Gateway | 1-2 replicas | 3 replicas |
| Product Service | 1-2 replicas | 3 replicas plus Redis cache |
| Order Service | 2 replicas | 3-5 replicas with HPA |
| Payment Service | 2 replicas | 3-5 replicas with HPA |
| PostgreSQL | Single local instance | Managed PostgreSQL or replicated DB |
| Monitoring | Single Prometheus/Grafana | Persistent storage and alert manager |

