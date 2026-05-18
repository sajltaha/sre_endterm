# End-to-End SRE Implementation for a Multi-Orchestrated Microservices Platform

## 1. Project Overview

This final project demonstrates Site Reliability Engineering practices using a practical local microservices system. It includes six Node.js services, an API Gateway, a multi-page frontend dashboard, Docker Compose, Docker Swarm, Kubernetes, Terraform, Ansible, Prometheus, Grafana, SLI/SLO definitions, CI/CD, incident simulation, recovery automation, and capacity planning.

The project is intentionally student-friendly: data is stored in memory for easy local execution, while the infrastructure and monitoring patterns mirror a real SRE workflow.

## 2. Architecture Diagram

```text
Browser Frontend :8080
        |
        v
API Gateway :3000
        |
        +--> auth-service :3001
        +--> product-service :3002
        +--> order-service :3003 --> product-service + payment-service
        +--> payment-service :3004
        +--> notification-service :3005
        +--> user-profile-service :3006

PostgreSQL :5432

Prometheus :9090 scrapes /metrics from every service.
Grafana :3007 automatically loads the Prometheus datasource and SRE dashboard.

GitHub Actions validates, builds, integration-tests, and publishes images.
```

## 3. Services and Ports

| Component | Port | Purpose |
| --- | --- | --- |
| Frontend | 8080 | Multi-page dashboard UI |
| API Gateway | 3000 | Routing, service health aggregation, metrics |
| Auth Service | 3001 | Register, login, list users |
| Product Service | 3002 | Product CRUD |
| Order Service | 3003 | Order workflow and incident demo |
| Payment Service | 3004 | Payment creation/listing |
| Notification Service | 3005 | Notification creation/listing |
| User Profile Service | 3006 | Profile CRUD |
| Prometheus | 9090 | Metrics and alerts |
| Grafana | 3007 | Ready monitoring dashboard |
| PostgreSQL | 5432 | Demo infrastructure dependency |

## 4. How to Run Locally

```bash
chmod +x scripts/*.sh
./scripts/start-compose.sh
```

Open:

- Frontend: http://localhost:8080
- API Gateway: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3007

Stop:

```bash
./scripts/stop-compose.sh
```

Restart:

```bash
./scripts/restart-compose.sh
```

Status:

```bash
./scripts/show-status.sh
```

## 5. Frontend Pages

The frontend is plain HTML, CSS, and JavaScript served by Nginx.

- Home: overview, architecture summary, quick service health
- Services: all microservice health statuses from API Gateway
- Auth: register users, login, and list registered users
- Products: list and create products
- Orders: list and create orders, shows incident impact
- Payments: create and list payments
- Notifications: create and list notifications
- Profiles: create and list profiles
- Monitoring: Prometheus/Grafana links and SLO summary
- Incident: incident scenario and recovery commands

## 6. API Gateway Routes

Gateway health:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/services/health
```

Frontend/API routes:

| Gateway Route | Target |
| --- | --- |
| `/api/auth` | auth-service |
| `/api/products` | product-service |
| `/api/orders` | order-service |
| `/api/payments` | payment-service |
| `/api/notifications` | notification-service |
| `/api/profiles` | user-profile-service |

Example:

```bash
curl http://localhost:3000/api/products
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":1,"quantity":2}'
```

## 7. Monitoring Setup

Prometheus scrapes:

- `api-gateway:3000`
- `auth-service:3001`
- `product-service:3002`
- `order-service:3003`
- `payment-service:3004`
- `notification-service:3005`
- `user-profile-service:3006`

Alerts:

- `ServiceDown`
- `OrderServiceDown`
- `HighErrorRate`
- `HighLatency`

## 8. Grafana Automatic Dashboard

Grafana is provisioned automatically through:

```text
monitoring/grafana/provisioning/datasources/datasource.yml
monitoring/grafana/provisioning/dashboards/dashboard.yml
monitoring/grafana/dashboards/sre-dashboard.json
```

Open http://localhost:3007 and login with:

```text
admin / admin
```

Dashboard title:

```text
SRE Microservices Monitoring Dashboard
```

## 9. Incident Simulation

Scenario: Order Service failure caused by wrong configuration.

Simulate:

```bash
./scripts/simulate-incident.sh
```

During the incident:

- `order-service /health` returns HTTP 500
- `POST /api/orders` returns HTTP 503
- frontend Orders page shows an error
- Prometheus can trigger `OrderServiceDown`

Recover:

```bash
./scripts/recover-incident.sh
```

## 10. Load Testing and Capacity Planning

Generate traffic for capacity planning and Grafana evidence:

```bash
./scripts/load-test.sh
```

For a larger local test:

```bash
REQUESTS=300 SLEEP_SECONDS=0.02 ./scripts/load-test.sh
```

Then check Grafana request rate, latency, and error panels at http://localhost:3007.

See [docs/load-testing.md](docs/load-testing.md) and [docs/capacity-planning.md](docs/capacity-planning.md).

## 11. Docker Swarm Deployment

```bash
./scripts/deploy-swarm.sh
docker service ls
docker stack ps sre-app
```

## 12. Kubernetes Deployment

For Minikube:

```bash
eval "$(minikube docker-env)"
./scripts/deploy-k8s.sh
kubectl get pods -n sre-project
kubectl get svc -n sre-project
```

Frontend and API Gateway use NodePort for local access.

## 13. Terraform Explanation

Terraform uses the local Docker provider so the project is runnable without paid cloud infrastructure.

```bash
cd terraform
terraform init
terraform plan
terraform apply
terraform destroy
```

It provisions a Docker network and demo Nginx containers to demonstrate reproducible infrastructure.

## 14. Ansible Explanation

The Ansible playbook demonstrates how an Ubuntu server can be prepared for deployment.

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

It installs Docker, copies project files, starts Compose, and checks API Gateway health.

## 15. CI/CD Pipeline

The project includes a GitHub Actions workflow:

```text
.github/workflows/ci-cd.yml
```

The pipeline includes:

- validation of JSON, YAML, shell scripts, Docker Compose, and Terraform
- Docker image builds for all microservices, API Gateway, and frontend
- Docker Compose integration test for health checks, auth flow, product listing, order creation, and metrics
- Docker image publishing to GitHub Container Registry on `main`
- deployment command summary for Compose, Swarm, Kubernetes, and incident simulation

See [docs/ci-cd.md](docs/ci-cd.md).

## 16. Known Limitations

- Microservices use in-memory data for clarity and easy local execution.
- PostgreSQL is included as infrastructure but not deeply integrated into every service.
- Kubernetes image names are local demo names; for a remote cluster, push images to a registry and update manifests.
- Grafana panels populate after traffic is generated through the frontend or curl commands.
- Auth Service displays plaintext demo passwords only for educational visibility. This is not a production security practice.
