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

data "terraform_remote_state" "cache_service" {
  backend = "local"
  config = {
    path = "services/cache-service/terraform.tfstate"
  }
}

data "terraform_remote_state" "quotas_service" {
  backend = "local"
  config = {
    path = "services/quotas-service/terraform.tfstate"
  }
}

data "terraform_remote_state" "viewing_service" {
  backend = "local"
  config = {
    path = "services/viewing-service/terraform.tfstate"
  }
}


module "db" {
  source = "../../../../modules/databases"

  name   = "prod"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id

  enable_redis = true

  allowed_sg_ids = [
    data.terraform_remote_state.cache_service.outputs.cache_service_sg_id,
    data.terraform_remote_state.quotas_service.outputs.quotas_service_sg_id,
    data.terraform_remote_state.viewing_service.outputs.viewing_service_sg_id,
    data.terraform_remote_state.bastion.outputs.bastion_sg_id
  ]
}