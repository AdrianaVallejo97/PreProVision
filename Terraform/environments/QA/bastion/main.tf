#####################################
# NETWORK (VPC + Subnets)
#####################################

module "network" {
  source = "../../../modules/network"
  name   = "bastion-qa"

  vpc_cidr            = "10.20.0.0/16"
  public_subnet_cidr  = "10.20.1.0/24"
  private_subnet_cidr = "10.20.2.0/24"
}

#####################################
# SECURITY GROUP
#####################################

resource "aws_security_group" "bastion_sg" {
  name   = "bastion-qa-sg"
  vpc_id = module.network.vpc_id

  # SSH desde tu IP (en QA puede ser abierto)
  ingress {
    description = "SSH from admin"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # En PROD limitar IP
  }

  # Salida SSH hacia servicios QA
  egress {
    description = "SSH to QA services"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  # Salida general
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
  ami                         = "ami-0abcdef"   # Amazon Linux 2
  instance_type               = "t3.micro"
  subnet_id                   = module.network.public_subnet_id
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  key_name                    = "bastion-key-qa"
  associate_public_ip_address = true

  tags = {
    Name = "bastion-qa"
    Role = "bastion"
    Env  = "qa"
  }

  user_data = <<EOF
#!/bin/bash
yum update -y

# Hardening básico SSH
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Utilidades
yum install -y htop git
EOF
}
