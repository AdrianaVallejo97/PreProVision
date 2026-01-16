variable "service_port" {
  type        = number
  description = "Viewing service HTTP port"
  default     = 10000
}

variable "metrics_port" {
  type        = number
  description = "Metrics port for /metrics scraping"
  default     = 9100
}

variable "enable_redis_access" {
  type        = bool
  description = "Enable egress to Redis (6379)"
  default     = true
}

variable "enable_mysql_access" {
  type        = bool
  description = "Enable egress to MySQL (3306) if viewing-service uses MySQL"
  default     = false
}

variable "enable_mongodb_access" {
  type        = bool
  description = "Enable egress to MongoDB (27017) if viewing-service uses MongoDB"
  default     = false
}
