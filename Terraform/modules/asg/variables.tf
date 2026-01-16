variable "name" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_ids" {
  type = list(string)
}

variable "instance_type" {
  type = string
}

# Si lo pasas, se usa este; si NO lo pasas, se busca AMI automáticamente.
variable "ami_id" {
  type        = string
  description = "Optional AMI ID. If empty, module will lookup the latest Amazon Linux 2 AMI."
  default     = ""
}

variable "desired_capacity" {
  type    = number
  default = 1
}

variable "min_size" {
  type    = number
  default = 1
}

variable "max_size" {
  type    = number
  default = 2
}

