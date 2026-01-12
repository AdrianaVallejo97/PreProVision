module "network" {
  source = "../../../../modules/network"
  name   = "monitoring-qa"

  vpc_cidr            = "10.28.0.0/16"
  public_subnet_cidr  = "10.28.1.0/24"
  private_subnet_cidr = "10.28.2.0/24"
}

resource "aws_security_group" "monitoring_sg" {
  name   = "monitoring-qa-sg"
  vpc_id = module.network.vpc_id

  ingress {
    description = "Grafana"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Prometheus"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  ingress {
    description = "SSH Bastion"
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

module "monitoring" {
  source    = "../../../../modules/ec2-service"
  name      = "monitoring-qa"
  ami       = "ami-0abcdef"
  subnet_id = module.network.private_subnet_id
  sg_id     = aws_security_group.monitoring_sg.id
  key_name  = "service-key-qa"

  user_data = <<EOF
#!/bin/bash
yum update -y

# CloudWatch Agent
yum install amazon-cloudwatch-agent -y

# Prometheus
useradd --no-create-home prometheus
wget https://github.com/prometheus/prometheus/releases/latest/download/prometheus.linux-amd64.tar.gz
tar xvf prometheus.linux-amd64.tar.gz
mv prometheus*/prometheus /usr/local/bin/

# Grafana
yum install -y https://dl.grafana.com/oss/release/grafana-10.0.0-1.x86_64.rpm
systemctl enable grafana-server
systemctl start grafana-server
EOF
}
