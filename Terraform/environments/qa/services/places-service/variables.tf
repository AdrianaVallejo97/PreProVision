variable "service_port" {
  type        = number
  description = "Places service HTTP port"
  default     = 7000
}

variable "metrics_port" {
  type        = number
  description = "Metrics port for /metrics scraping"
  default     = 9100
}
