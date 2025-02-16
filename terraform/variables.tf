variable "s3_bucket_name" {
  description = "S3 bucket name"
  type        = string
  default     = "mangahay"
}

variable "backend_original_url" {
  description = "The original url of backend"
  type        = list(string)
  default     = ["http://127.0.0.1:3000", "http://localhost:3000"]
}

variable "frontend_original_url" {
  description = "The original url of frontend"
  type        = list(string)
  default     = ["http://127.0.0.1:3001", "http://localhost:3001"]
}

variable "localstack_api_key" {
  description = "API key for LocalStack Pro (optional)"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "host_docker" {
  description = "Host docker depend on the environment"
  type        = string
  # default     = "npipe:////.//pipe//docker_engine"
  default = "unix:///Users/h003018/.colima/default/docker.sock"
}
