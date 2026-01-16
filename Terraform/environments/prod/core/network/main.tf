module "network" {
  source = "../../../../modules/network"

  name                    = "prod"
  vpc_cidr                = "10.28.0.0/16"
  public_subnet_cidr      = "10.28.1.0/24"
  private_app_subnet_cidr = "10.28.2.0/24"
  private_db_subnet_cidr  = "10.28.3.0/24"
}

