resource "aws_launch_template" "this" {
  name_prefix   = var.name
  image_id      = var.ami
  instance_type = "t3.micro"
  key_name      = var.key_name
  vpc_security_group_ids = [var.sg_id]
}

resource "aws_autoscaling_group" "this" {
  min_size         = 1
  max_size         = 2
  desired_capacity = 1
  vpc_zone_identifier = var.subnets

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  target_group_arns = [var.target_group_arn]
}
