#####################################
# REMOTE STATE - SERVICES NETWORK
#####################################
data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "../network/terraform.tfstate"
  }
}

#####################################
# REMOTE STATE - MONITORING SERVICE
#####################################
data "terraform_remote_state" "monitoring" {
  backend = "local"
  config = {
    path = "../monitoring-service/terraform.tfstate"
  }
}

#####################################
# SECURITY GROUP - AGREEMENTS SERVICE
#####################################
resource "aws_security_group" "agreements_service_sg" {
  name   = "qa-agreements-service-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  #################################
  # HTTP access (TEMP - tu IP)
  #################################
  ingress {
    description = "HTTP admin/test access (TEMP)"
    from_port   = var.service_port
    to_port     = var.service_port
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  #################################
  # Monitoring -> Agreements (metrics)
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
  # Egress (default)
  #################################
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
