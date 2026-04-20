variable "db_username" {
  description = "Database username"
  type        = string
  default     = "cloudforge"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "docker_username" {
  description = "Docker Hub username"
  type        = string
}