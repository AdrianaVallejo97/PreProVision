variable "service_port" {
  type        = number
  description = "Notifications service HTTP port"
  default     = 6000
}

variable "metrics_port" {
  type        = number
  description = "Metrics port for /metrics scraping"
  default     = 9100
}
