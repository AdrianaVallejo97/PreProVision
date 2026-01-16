output "mysql_sg_id" {
  value = try(aws_security_group.mysql_sg[0].id, null)
}

output "mongodb_sg_id" {
  value = try(aws_security_group.mongodb_sg[0].id, null)
}

output "redis_sg_id" {
  value = try(aws_security_group.redis_sg[0].id, null)
}
