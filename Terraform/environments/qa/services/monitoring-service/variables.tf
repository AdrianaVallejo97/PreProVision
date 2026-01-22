variable "monitor_port" {
  type        = number
  description = "Monitoring service port (admin/UI/Prometheus)"
  default     = 9090
}

variable "metrics_port" {
  type        = number
  description = "Port used to scrape metrics from services"
  default     = 9100
}

variable "admin_cidr" {
  type        = string
  description = "Your public IP CIDR to SSH into Bastion (e.g., x.x.x.x/32)"
}
