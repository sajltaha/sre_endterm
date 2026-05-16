output "network_name" {
  value = docker_network.sre_network.name
}

output "demo_container_urls" {
  value = [for i in range(var.instance_count) : "http://localhost:${8088 + i}"]
}

output "region" {
  value = var.region
}

output "vm_size" {
  value = var.vm_size
}

