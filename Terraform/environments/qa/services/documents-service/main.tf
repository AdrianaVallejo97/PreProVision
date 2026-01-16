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
# SECURITY GROUP - DOCUMENTS SERVICE
#####################################
resource "aws_security_group" "documents_service_sg" {
  name   = "qa-documents-service-sg"
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
  # Egress to Firebase Storage (HTTPS)
  #################################
  egress {
    description = "Outbound HTTPS to Firebase Storage"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  #################################
  # Optional DNS (UDP 53)
  #################################
  egress {
    description = "DNS queries"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "documents_service_sg_id" {
  value = aws_security_group.documents_service_sg.id
}
