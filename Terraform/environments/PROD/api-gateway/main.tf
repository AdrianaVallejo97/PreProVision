module "network" {
  source              = "../../../modules/network"
  name                = "api-gateway-prod"
  vpc_cidr            = "10.100.0.0/16"
  public_subnet_cidr  = "10.100.1.0/24"
  private_subnet_cidr = "10.100.2.0/24"
}
