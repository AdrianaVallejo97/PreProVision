variable "vpc_id" {
  type = string
}

variable "name" {
  type = string
}

variable "allowed_sg_ids" {
  type = list(string)
}

variable "enable_mysql" {
  type    = bool
  default = false
}

variable "enable_mongodb" {
  type    = bool
  default = false
}

variable "enable_redis" {
  type    = bool
  default = false
}
