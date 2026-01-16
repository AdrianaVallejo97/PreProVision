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
# REMOTE STATE - API GATEWAY (LOCAL)
#####################################
data "terraform_remote_state" "api_gateway" {
  backend = "local"
  config = {
    path = "../../core/api-gateway/terraform.tfstate"
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
# SECURITY GROUP - AUTH SERVICE
#####################################
resource "aws_security_group" "auth_service_sg" {
  name   = "prod-auth-service-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  #################################
  # API Gateway -> Auth
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
  # Monitoring -> Auth (metrics)
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
  # Egress
  #################################
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "auth_service_sg_id" {
  value = aws_security_group.auth_service_sg.id
}
