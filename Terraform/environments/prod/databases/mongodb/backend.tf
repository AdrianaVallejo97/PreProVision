terraform {
  backend "s3" {
    bucket         = "terraform-states-prod"
    key            = "databases/mongodb/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks-prod"
    encrypt        = true
  }
}
