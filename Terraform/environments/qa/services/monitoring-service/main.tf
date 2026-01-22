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
# SECURITY GROUP - MONITORING SERVICE
#####################################
resource "aws_security_group" "monitoring_sg" {
  name   = "qa-monitoring-service-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  ingress {
    description = "Admin access from your IP (TEMP)"
    from_port   = var.monitor_port
    to_port     = var.monitor_port
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  egress {
    description = "Scrape metrics inside VPC"
    from_port   = var.metrics_port
    to_port     = var.metrics_port
    protocol    = "tcp"
    cidr_blocks = [data.terraform_remote_state.network.outputs.vpc_cidr]
  }

  egress {
    description = "Outbound HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

