variable "project_name" {
  description = "Project name used for local Docker infrastructure resources."
  type        = string
  default     = "sre-endterm"
}

variable "region" {
  description = "Educational cloud region placeholder for report discussion."
  type        = string
  default     = "local"
}

variable "instance_count" {
  description = "Number of local demo containers to provision."
  type        = number
  default     = 1
}

variable "vm_size" {
  description = "Educational VM size placeholder for cloud capacity planning."
  type        = string
  default     = "local-docker-small"
}

