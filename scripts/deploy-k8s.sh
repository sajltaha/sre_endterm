#!/usr/bin/env bash
set -euo pipefail

# For Minikube, run: eval "$(minikube docker-env)" before building images.
docker build -t sre-auth-service:latest ./services/auth-service
docker build -t sre-product-service:latest ./services/product-service
docker build -t sre-order-service:latest ./services/order-service
docker build -t sre-payment-service:latest ./services/payment-service
docker build -t sre-notification-service:latest ./services/notification-service
docker build -t sre-user-profile-service:latest ./services/user-profile-service
docker build -t sre-api-gateway:latest ./api-gateway
docker build -t sre-frontend:latest ./frontend

kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/
kubectl get pods -n sre-project
kubectl get svc -n sre-project

echo
echo "Kubernetes deployed. Useful commands:"
echo "kubectl get pods -n sre-project"
echo "kubectl get svc -n sre-project"
