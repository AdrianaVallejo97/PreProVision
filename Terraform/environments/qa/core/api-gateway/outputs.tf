output "api_gateway_sg_id" {
  value = aws_security_group.api_gateway_sg.id
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "alb_sg_id" {
  value = module.alb.alb_sg_id
}

output "target_group_arn" {
  value = aws_lb_target_group.api_gw_tg.arn
}
