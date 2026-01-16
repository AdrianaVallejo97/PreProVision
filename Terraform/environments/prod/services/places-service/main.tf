data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "core/network/terraform.tfstate"
  }
}

data "terraform_remote_state" "api_gateway" {
  backend = "local"
  config = {
    path = "core/api-gateway/terraform.tfstate"
  }
}

data "terraform_remote_state" "monitoring" {
  backend = "local"
  config = {
    path = "services/monitoring-service/terraform.tfstate"
  }
}

data "terraform_remote_state" "mysql" {
  backend = "local"
  config = {
    path = "databases/mysql/terraform.tfstate"
  }
}

data "terraform_remote_state" "mongodb" {
  backend = "local"
  config = {
    path = "databases/mongodb/terraform.tfstate"
  }
}

resource "aws_security_group" "places_service_sg" {
  name   = "prod-places-service-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  ingress {
    description     = "HTTP from API Gateway"
    from_port       = var.service_port
    to_port         = var.service_port
    protocol        = "tcp"
    security_groups = [
      data.terraform_remote_state.api_gateway.outputs.api_gateway_sg_id
    ]
  }

  ingress {
    description     = "Metrics scrape from monitoring-service"
    from_port       = var.metrics_port
    to_port         = var.metrics_port
    protocol        = "tcp"
    security_groups = [
      data.terraform_remote_state.monitoring.outputs.monitoring_sg_id
    ]
  }

  egress {
    description     = "Connect to MySQL"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [
      data.terraform_remote_state.mysql.outputs.mysql_sg_id
    ]
  }

  egress {
    description     = "Connect to MongoDB"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [
      data.terraform_remote_state.mongodb.outputs.mongodb_sg_id
    ]
  }

  egress {
    description = "General outbound (optional)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
