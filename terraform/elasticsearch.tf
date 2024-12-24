resource "docker_image" "elasticsearch" {
  name = "docker.elastic.co/elasticsearch/elasticsearch:8.15.0"
}
resource "docker_image" "kibana" {
  name = "docker.elastic.co/kibana/kibana:8.15.0"
}

resource "docker_container" "elasticsearch_container" {
  name  = "elasticsearch"
  image = docker_image.elasticsearch.image_id

  ports {
    internal = 9200
    external = 9200
    protocol = "tcp"
  }

  env = [
    "node.name=elasticsearch",
    "cluster.name=elk-stack-cluster",
    "ELASTIC_PASSWORD=haotruong123",
    "bootstrap.memory_lock=true",
    "xpack.security.enabled=true",
    "xpack.license.self_generated.type=basic",
    "discovery.type=single-node",
    "ES_JAVA_OPTS=-Xms512m -Xmx512m"
  ]

  volumes {
    container_path = "/usr/share/elasticsearch/data"
  }

  networks_advanced {
    name = docker_network.mangahay_network.id
  }

  healthcheck {
    test = [
      "CMD-SHELL",
      "curl -s -u elastic:haotruong123 http://elasticsearch:9200 | grep -q 'You Know, for Search'",
    ]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "5s"
  }
}

resource "docker_container" "kibana_container" {
  name  = "kibana"
  image = docker_image.kibana.image_id

  ports {
    internal = 5601
    external = 5601
  }

  env = [
    "SERVERNAME=kibana",
    "ELASTICSEARCH_HOSTS=http://elasticsearch:9200",
    "ELASTICSEARCH_USERNAME=kibana_system",
    "ELASTICSEARCH_PASSWORD=haotruong123"
  ]

  depends_on = [docker_image.elasticsearch]

  volumes {
    container_path = "/usr/share/kibana/data"
  }

  networks_advanced {
    name = docker_network.mangahay_network.id
  }

  healthcheck {
    test = [
      "CMD-SHELL",
      "curl -s -u kibana_system:haotruong123 -I http://kibana:5601 | grep -q 'HTTP/1.1 200 OK'",
    ]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "5s"
  }
}
