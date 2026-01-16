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
# REMOTE STATE - REDIS
#####################################
data "terraform_remote_state" "redis" {
  backend = "local"
  config = {
    path = "databases/redis/terraform.tfstate"
  }
}

#####################################
# REMOTE STATE - MYSQL (optional)
#####################################
data "terraform_remote_state" "mysql" {
  backend = "local"
  config = {
    path = "databases/mysql/terraform.tfstate"
  }
}

#####################################
# REMOTE STATE - MONGODB (optional)
#####################################
data "terraform_remote_state" "mongodb" {
  backend = "local"
  config = {
    path = "databases/mongodb/terraform.tfstate"
  }
}

#####################################
# SECURITY GROUP - VIEWING SERVICE
#####################################
resource "aws_security_group" "viewing_service_sg" {
  name   = "qa-viewing-service-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  #################################
  # API Gateway -> Viewing (HTTP)
  #################################
  ingress {
    description     = "HTTP from API Gateway"
    from_port       = var.service_port
    to_port         = var.service_port
    protocol        = "tcp"
    security_groups = [data.terraform_remote_state.api_gateway.outputs.api_gateway_sg_id]
  }

  #################################
  # Monitoring -> Viewing (metrics)
  #################################
  ingress {
    description     = "Metrics scrape from monitoring-service"
    from_port       = var.metrics_port
    to_port         = var.metrics_port
    protocol        = "tcp"
    security_groups = [data.terraform_remote_state.monitoring.outputs.monitoring_sg_id]
  }

  #################################
  # Egress to Redis (optional)
  #################################
  dynamic "egress" {
    for_each = var.enable_redis_access ? [1] : []
    content {
      description     = "Connect to Redis"
      from_port       = 6379
      to_port         = 6379
      protocol        = "tcp"
      security_groups = [data.terraform_remote_state.redis.outputs.redis_sg_id]
    }
  }

  #################################
  # Egress to MySQL (optional)
  #################################
  dynamic "egress" {
    for_each = var.enable_mysql_access ? [1] : []
    content {
      description     = "Connect to MySQL"
      from_port       = 3306
      to_port         = 3306
      protocol        = "tcp"
      security_groups = [data.terraform_remote_state.mysql.outputs.mysql_sg_id]
    }
  }

  #################################
  # Egress to MongoDB (optional)
  #################################
  dynamic "egress" {
    for_each = var.enable_mongodb_access ? [1] : []
    content {
      description     = "Connect to MongoDB"
      from_port       = 27017
      to_port         = 27017
      protocol        = "tcp"
      security_groups = [data.terraform_remote_state.mongodb.outputs.mongodb_sg_id]
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
