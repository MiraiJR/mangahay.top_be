resource "aws_s3_bucket" "mangahay_s3_bucket" {
  bucket = var.s3_bucket_name

  depends_on = [docker_container.localstack_container]
}

resource "aws_s3_bucket_cors_configuration" "mangahay_s3_bucket_cors_configuration" {
  bucket = aws_s3_bucket.mangahay_s3_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "DELETE"]
    allowed_origins = var.backend_original_url
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = var.frontend_original_url
  }
}
