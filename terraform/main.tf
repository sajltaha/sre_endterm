terraform {
  required_version = ">= 1.5.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "sre_network" {
  name = "${var.project_name}-terraform-network"
}

resource "docker_image" "nginx" {
  name         = "nginx:1.25-alpine"
  keep_locally = true
}

resource "docker_container" "demo_gateway" {
  count = var.instance_count
  name  = "${var.project_name}-terraform-demo-${count.index + 1}"
  image = docker_image.nginx.image_id

  ports {
    internal = 80
    external = 8088 + count.index
  }

  networks_advanced {
    name = docker_network.sre_network.name
  }
}

