variable "service_port" {
  type        = number
  description = "Auth service HTTP port"
  default     = 3000
}

variable "metrics_port" {
  type        = number
  description = "Metrics port for /metrics scraping"
  default     = 9100
}
