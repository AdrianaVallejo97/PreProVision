variable "app_port" {
  type    = number
  default = 8080
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "acm_certificate_arn" {
  type    = string
  default = ""
}
variable "ami_id" {
  type        = string
  description = "AMI for api-gateway instances"
}