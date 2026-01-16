#####################################
# REMOTE STATE - NETWORK (LOCAL)
#####################################
data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "../../core/network/terraform.tfstate"
  }
}

#####################################
# REMOTE STATE - MONITORING SERVICE (LOCAL)
#####################################
data "terraform_remote_state" "monitoring" {
  backend = "local"
  config = {
    path = "../monitoring-service/terraform.tfstate"
  }
}

#####################################
# REMOTE STATE - REDIS (LOCAL)
#####################################
data "terraform_remote_state" "redis" {
  backend = "local"
  config = {
    path = "../../databases/redis/terraform.tfstate"
  }
}

#####################################
# SECURITY GROUP - CACHE SERVICE
#####################################
resource "aws_security_group" "cache_service_sg" {
  name   = "qa-cache-service-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

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
  # Egress to Redis (SG -> SG)
  #################################
  egress {
    description     = "Connect to Redis"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [
      data.terraform_remote_state.redis.outputs.redis_sg_id
    ]
  }

  #################################
  # (Optional) General outbound
  #################################
  egress {
    description = "General outbound (optional)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "cache_service_sg_id" {
  value = aws_security_group.cache_service_sg.id
}
