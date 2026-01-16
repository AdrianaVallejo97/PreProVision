variable "service_port" {
  type        = number
  description = "Agreements service HTTP port"
  default     = 4000
}

variable "metrics_port" {
  type        = number
  description = "Metrics port for /metrics scraping"
  default     = 9100
}
