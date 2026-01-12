module "network" {
  source = "../../../../modules/network"
  name = "mysql-qa"
  vpc_cidr = "10.20.0.0/16"
  public_subnet_cidr = "10.20.1.0/24"
  private_subnet_cidr = "10.20.2.0/24"
}

resource "aws_security_group" "mysql_sg" {
  vpc_id = module.network.vpc_id
  ingress {
    from_port = 3306
    to_port   = 3306
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "mysql" {
  source = "../../../../modules/databases"
  ami = "ami-0abcdef"
  subnet_id = module.network.private_subnet_id
  sg_id = aws_security_group.mysql_sg.id
  key_name = "db-key"
}
