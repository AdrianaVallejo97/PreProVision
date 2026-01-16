#####################################
# REMOTE STATE - NETWORK
#####################################
data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "core/network/terraform.tfstate"
  }
}

#####################################
# REMOTE STATE - API GATEWAY
#####################################
data "terraform_remote_state" "api_gateway" {
  backend = "local"
  config = {
    path = "core/api-gateway/terraform.tfstate"
  }
}

#####################################
# REMOTE STATE - MONITORING SERVICE
#####################################
data "terraform_remote_state" "monitoring" {
  backend = "local"
  config = {
    path = "services/monitoring-service/terraform.tfstate"
  }
}

#####################################
# REMOTE STATE - REDIS (optional)
#####################################
data "terraform_remote_state" "redis" {
  backend = "local"
  config = {
    path = "databases/redis/terraform.tfstate"
  }
}

#####################################
# SECURITY GROUP - QUOTAS SERVICE
#####################################
resource "aws_security_group" "quotas_service_sg" {
  name   = "qa-quotas-service-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  #################################
  # Ingress from API Gateway
  #################################
  ingress {
    description     = "HTTP from API Gateway"
    from_port       = var.service_port
    to_port         = var.service_port
    protocol        = "tcp"
    security_groups = [
      data.terraform_remote_state.api_gateway.outputs.api_gateway_sg_id
    ]
  }

  #################################
  # Ingress metrics from Monitoring
  #################################
  ingress {
    description     = "Metrics scrape from monitoring-service"
    from_port       = var.metrics_port
    to_port         = var.metrics_port
    protocol        = "tcp"
    security_groups = [
      data.terraform_remote_state.monitoring.outputs.monitoring_sg_id
    ]
  }

  #################################
  # Egress to Redis (optional)
  #################################
  dynamic "egress" {
    for_each = var.enable_redis_access ? [1] : []
    content {
      description     = "Connect to Redis (quotas/rate-limits)"
      from_port       = 6379
      to_port         = 6379
      protocol        = "tcp"
      security_groups = [
        data.terraform_remote_state.redis.outputs.redis_sg_id
      ]
    }
  }

  #################################
  # Egress general (optional)
  #################################
  egress {
    description = "General outbound (optional)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
