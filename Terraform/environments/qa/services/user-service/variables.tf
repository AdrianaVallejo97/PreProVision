variable "service_port" {
  type        = number
  description = "User service HTTP port"
  default     = 9000
}

variable "metrics_port" {
  type        = number
  description = "Metrics port for /metrics scraping"
  default     = 9100
}
