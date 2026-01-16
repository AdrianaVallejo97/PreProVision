variable "service_port" {
  type    = number
  default = 8000
}

variable "metrics_port" {
  type    = number
  default = 9100
}

variable "enable_redis_access" {
  type    = bool
  default = true
}
