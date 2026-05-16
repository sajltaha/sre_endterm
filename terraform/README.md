# Terraform Demo Infrastructure

This folder uses the Docker provider so students can run Terraform locally without a paid cloud account.

## Commands

```bash
cd terraform
terraform init
terraform plan
terraform apply
terraform destroy
```

Terraform provisions a Docker network and one or more simple demo containers. The variables `region` and `vm_size` are included for report discussion and can be mapped to a real cloud provider later.

