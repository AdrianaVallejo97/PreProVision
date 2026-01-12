#####################################
# NETWORK (VPC + Subnets)
#####################################

module "network" {
  source = "../../../modules/network"
  name   = "bastion-prod"

  vpc_cidr            = "10.120.0.0/16"
  public_subnet_cidr  = "10.120.1.0/24"
  private_subnet_cidr = "10.120.2.0/24"
}

#####################################
# SECURITY GROUP
#####################################

resource "aws_security_group" "bastion_sg" {
  name   = "bastion-prod-sg"
  vpc_id = module.network.vpc_id

  # SSH desde tu IP (RECOMENDADO)
  ingress {
    description = "SSH from admin IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # 🔒 En real: TU IP
  }

  # Salida SSH a todos los servicios (cross-account)
  egress {
    description = "SSH to private services"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  # Salida general (updates, yum, etc.)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

#####################################
# BASTION EC2
#####################################

resource "aws_instance" "bastion" {
  ami                         = "ami-0abcdef" # Amazon Linux 2
  instance_type               = "t3.micro"
  subnet_id                   = module.network.public_subnet_id
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  key_name                    = "bastion-key-prod"
  associate_public_ip_address = true

  tags = {
    Name = "bastion-prod"
    Role = "bastion"
    Env  = "prod"
  }

  user_data = <<EOF
#!/bin/bash
yum update -y

# Hardening básico
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Utilidades
yum install -y htop git
EOF
}
