#####################################
# REMOTE STATE - NETWORK (LOCAL)
#####################################
data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "../network/terraform.tfstate"
  }
}

#####################################
# BASTION (MODULE)
#####################################
module "bastion" {
  source = "../../../../modules/bastion"

  name              = "qa"
  vpc_id            = data.terraform_remote_state.network.outputs.vpc_id
  public_subnet_ids = data.terraform_remote_state.network.outputs.public_subnet_ids

  admin_cidr = var.admin_cidr
  ami_id     = var.ami_id

  instance_type = var.instance_type

}
