# CI/CD Pipeline

This project includes a GitHub Actions workflow located at:

```text
.github/workflows/ci-cd.yml
```

## Pipeline Goals

The CI/CD pipeline verifies that the project is deployable and reliable before it is demonstrated or merged.

## Pipeline Stages

### 1. Validation

The validation job checks:

- `package.json` files for all Node.js services
- YAML syntax for Docker Compose, Docker Swarm, Kubernetes, Prometheus, Grafana provisioning, and incident override files
- Shell script syntax
- Docker Compose configuration
- Terraform formatting and validation

### 2. Docker Image Build

The build job builds Docker images for:

- auth-service
- product-service
- order-service
- payment-service
- notification-service
- user-profile-service
- api-gateway
- frontend

This confirms that every service can be containerized successfully.

### 3. Integration Test

The integration test job starts the full stack using Docker Compose and checks:

- API Gateway health
- aggregated service health through `/services/health`
- product listing
- user registration and login
- order creation
- Prometheus metrics exposure

After the test, the stack is stopped with `docker compose down -v`.

### 4. Image Publishing

On pushes to the `main` branch, the workflow publishes Docker images to GitHub Container Registry using tags:

```text
latest
<short-git-sha>
```

Image names follow this pattern:

```text
ghcr.io/<github-owner>/<repository-name>-<service-name>:latest
ghcr.io/<github-owner>/<repository-name>-<service-name>:<short-git-sha>
```

This demonstrates the Continuous Delivery part of the project.

### 5. Deployment Guide

The final job prints manual deployment commands for:

- Docker Compose
- Docker Swarm
- Kubernetes / Minikube
- Incident simulation and recovery