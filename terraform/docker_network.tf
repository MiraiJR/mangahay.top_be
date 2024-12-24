resource "docker_network" "mangahay_network" {
  name   = "mangahay_network"
  driver = "bridge"
}
