module "network" {
  source = "../../../../modules/network"

  name                    = "qa"
  vpc_cidr                = "10.27.0.0/16"
  public_subnet_cidr      = "10.27.1.0/24"
  private_app_subnet_cidr = "10.27.2.0/24"
  private_db_subnet_cidr  = "10.27.3.0/24"
}
