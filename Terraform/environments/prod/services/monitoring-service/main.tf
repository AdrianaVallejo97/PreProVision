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
# REMOTE STATE - BASTION (LOCAL)
#####################################
data "terraform_remote_state" "bastion" {
  backend = "local"
  config = {
    path = "../../core/bastion/terraform.tfstate"
  }
}

#####################################
# SECURITY GROUP - MONITORING SERVICE
#####################################
resource "aws_security_group" "monitoring_sg" {
  name   = "prod-monitoring-service-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  #################################
  # Ingress ONLY from Bastion (admin/debug)
  #################################
  ingress {
    description     = "Admin access from Bastion"
    from_port       = var.monitor_port
    to_port         = var.monitor_port
    protocol        = "tcp"
    security_groups = [
      data.terraform_remote_state.bastion.outputs.bastion_sg_id
    ]
  }

  #################################
  # Egress - scrape metrics inside VPC
  #################################
  egress {
    description = "Scrape metrics from services (pull)"
    from_port   = var.metrics_port
    to_port     = var.metrics_port
    protocol    = "tcp"
    cidr_blocks = [
      data.terraform_remote_state.network.outputs.vpc_cidr
    ]
  }

  #################################
  # Egress - HTTPS external (CloudWatch, exporters)
  #################################
  egress {
    description = "Outbound HTTPS (CloudWatch/External)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "monitoring_sg_id" {
  value = aws_security_group.monitoring_sg.id
}
