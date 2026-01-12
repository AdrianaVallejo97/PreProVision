module "network" {
  source = "../../../modules/network"
  name = "api-gateway-qa"
  vpc_cidr = "10.1.0.0/16"
  public_subnet_cidr = "10.1.1.0/24"
  private_subnet_cidr = "10.1.2.0/24"
}
