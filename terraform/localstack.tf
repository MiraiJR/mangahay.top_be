resource "docker_image" "localstack_image" {
  name = "localstack/localstack:latest"
}

resource "docker_container" "localstack_container" {
  name  = "localstack"
  image = docker_image.localstack_image.image_id

  ports {
    internal = 4566
    external = 4566
  }

  env = [
    "EDGE_PORT=4566",
    "SERVICES=s3,lambda",
    "DEFAULT_REGION=us-east-1",
    "DEBUG=1"
  ]

  volumes {
    container_path = "/usr/share/localstack/data"
  }

  networks_advanced {
    name = docker_network.mangahay_network.id
  }

  healthcheck {
    test         = ["CMD-SHELL", "curl -f http://localhost:4566/_localstack/health || exit 1"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "5s"
  }
}
