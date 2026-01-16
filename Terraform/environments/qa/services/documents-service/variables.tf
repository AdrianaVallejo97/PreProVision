variable "service_port" {
  type        = number
  description = "Documents service HTTP port"
  default     = 5000
}

variable "metrics_port" {
  type        = number
  description = "Metrics port for /metrics scraping"
  default     = 9100
}
