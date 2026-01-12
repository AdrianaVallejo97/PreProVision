module "network" {
  source = "../../../../modules/network"
  name   = "documents-qa"

  vpc_cidr            = "10.25.0.0/16"
  public_subnet_cidr  = "10.25.1.0/24"
  private_subnet_cidr = "10.25.2.0/24"
}

resource "aws_security_group" "documents_sg" {
  name   = "documents-qa-sg"
  vpc_id = module.network.vpc_id

  ingress {
    description = "HTTP API"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  ingress {
    description = "SSH from Bastion"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "documents" {
  source    = "../../../../modules/ec2-service"
  name      = "documents-qa"
  ami       = "ami-0abcdef"
  subnet_id = module.network.private_subnet_id
  sg_id     = aws_security_group.documents_sg.id
  key_name  = "service-key-qa"

  user_data = <<EOF
#!/bin/bash
yum update -y
yum install -y git nodejs npm

echo "export FIREBASE_BUCKET=documents-qa-bucket" >> /etc/profile
echo "export FIREBASE_PROJECT=documents-qa" >> /etc/profile

mkdir -p /opt/documents-service
cd /opt/documents-service
EOF
}
