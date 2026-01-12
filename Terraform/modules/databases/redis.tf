resource "aws_instance" "redis" {
  ami                    = var.ami
  instance_type          = "t3.micro"
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.sg_id]
  key_name               = var.key_name
  tags = { Name = "redis-cache" }
}
