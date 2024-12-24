resource "docker_image" "redis" {
  name = "docker.io/redis:latest"
}


resource "docker_container" "redis_container" {
  name  = "redis"
  image = docker_image.redis.image_id

  ports {
    internal = 6379
    external = 6379
  }

  volumes {
    container_path = "/usr/share/redis/data"
  }

  networks_advanced {
    name = docker_network.mangahay_network.id
  }

  healthcheck {
    test         = ["CMD", "bash", "-c", "echo PING | nc localhost 6379"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "5s"
  }
}
