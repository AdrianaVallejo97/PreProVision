variable "admin_cidr" {
  type        = string
  description = "Your public IP CIDR to SSH into Bastion (e.g., x.x.x.x/32)"
}

variable "ami_id" {
  type        = string
  description = "AMI for bastion instance"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}
