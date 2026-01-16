data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "core/network/terraform.tfstate"
  }
}

data "terraform_remote_state" "bastion" {
  backend = "local"
  config = {
    path = "core/bastion/terraform.tfstate"
  }
}

data "terraform_remote_state" "api_gateway" {
  backend = "local"
  config = {
    path = "core/api-gateway/terraform.tfstate"
  }
}

module "db" {
  source = "../../../../modules/databases"

  name   = "prod"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  enable_mongodb = true

  allowed_sg_ids = [
    data.terraform_remote_state.api_gateway.outputs.api_gateway_sg_id,
    data.terraform_remote_state.bastion.outputs.bastion_sg_id
  ]
}
