variable "service_port" {
  type        = number
  description = "Quotas service HTTP port"
  default     = 8000
}

variable "metrics_port" {
  type        = number
  description = "Metrics port for /metrics scraping"
  default     = 9100
}

variable "enable_redis_access" {
  type        = bool
  description = "Enable egress to Redis (6379) if quotas-service uses Redis"
  default     = true
}
