#####################################
# REMOTE STATE - NETWORK (LOCAL)
#####################################
data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "../network/terraform.tfstate"
  }
}

#####################################
# SECURITY GROUP - API GATEWAY (INSTANCES)
#####################################
resource "aws_security_group" "api_gateway_sg" {
  name   = "qa-api-gateway-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  # Tráfico HTTP hacia las instancias (desde el ALB)
  ingress {
    description     = "HTTP from ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [module.alb.alb_sg_id]
  }

  egress {
    description = "Outbound all"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

#####################################
# ALB (MODULE)
#####################################
module "alb" {
  source = "../../../../modules/alb"

  name              = "qa-api-gateway"
  vpc_id            = data.terraform_remote_state.network.outputs.vpc_id
  public_subnet_ids = data.terraform_remote_state.network.outputs.public_subnet_ids
}

#####################################
# TARGET GROUP
#####################################
resource "aws_lb_target_group" "api_gw_tg" {
  name     = "qa-api-gw-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = data.terraform_remote_state.network.outputs.vpc_id

  health_check {
    protocol            = "HTTP"
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 30
    timeout             = 5
  }
}

#####################################
# LISTENER HTTP :80 -> TG :8080
#####################################
resource "aws_lb_listener" "http" {
  load_balancer_arn = module.alb.alb_arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_gw_tg.arn
  }
}

#####################################
# ASG (MODULE)
# (Sin vpc_id ni target_group_arns porque tu módulo no los soporta)
#####################################
module "asg" {
  source = "../../../../modules/asg"

  name               = "qa-api-gateway"
  subnet_ids         = data.terraform_remote_state.network.outputs.private_app_subnet_ids
  security_group_ids = [aws_security_group.api_gateway_sg.id]

  ami_id        = var.ami_id
  instance_type = "t3.micro"

  desired_capacity = 1
  min_size         = 1
  max_size         = 2
}

#####################################
# ATTACH ASG -> TARGET GROUP
#####################################
resource "aws_autoscaling_attachment" "asg_to_tg" {
  autoscaling_group_name = module.asg.asg_name
  lb_target_group_arn    = aws_lb_target_group.api_gw_tg.arn
}
