module "network" {
  source              = "../../../../modules/network"
  name                = "viewing-prod"
  vpc_cidr            = "10.126.0.0/16"
  public_subnet_cidr  = "10.126.1.0/24"
  private_subnet_cidr = "10.126.2.0/24"
}

resource "aws_security_group" "viewing_sg" {
  vpc_id = module.network.vpc_id
  ingress { 
    from_port=8080 
    to_port=8080 
    protocol="tcp" 
    cidr_blocks=["0.0.0.0/0"] 
    }
  egress  { 
    from_port=0 
    to_port=0 protocol="-1" 
    cidr_blocks=["0.0.0.0/0"] 
    }
}

module "viewing" {
  source     = "../../../../modules/ec2-service"
  name       = "viewing-prod"
  ami        = "ami-0abcdef"
  subnet_id  = module.network.private_subnet_id
  sg_id      = aws_security_group.viewing_sg.id
  key_name   = "service-key-prod"
}