terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
    turso = {
      source = "celest-dev/turso"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 4.0"
    }
  }

  required_version = ">= 1.2"
}

// general variables
variable "admin_jwt_secret" {
  description = ""
  type        = string
  nullable    = false
  sensitive   = true
}

// Provider: Google
variable "admin_google_oauth_client_id" {
  description = ""
  type        = string
  nullable    = false
}

variable "admin_google_oauth_client_secret" {
  description = ""
  type        = string
  nullable    = false
  sensitive   = true
}




// Provider: AWS
provider "aws" {
  region = "us-west-2"
}

resource "aws_s3_bucket" "main_s3" {
  bucket = "tf-portfolio2"
}

resource "aws_s3_bucket_policy" "public_read_raw_folder" {
  bucket = aws_s3_bucket.main_s3.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadRawFolder"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.main_s3.arn}/raw/*"
      },
    ]
  })
}

resource "aws_s3_bucket_ownership_controls" "public_read_ownership_controls" {
  bucket = aws_s3_bucket.main_s3.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_cors_configuration" "main_s3_cors" {
  bucket = aws_s3_bucket.main_s3.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "HEAD", "DELETE"]
    # Browser PUTs use short-lived presigned URLs; JWT still gates who can mint them.
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_iam_user" "media_uploader" {
  name = "tf-portfolio2-media-uploader"
}

resource "aws_iam_user_policy" "media_uploader" {
  name = "tf-portfolio2-media-uploader"
  user = aws_iam_user.media_uploader.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListRawPrefix"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.main_s3.arn
        Condition = {
          StringLike = {
            "s3:prefix" = ["raw", "raw/*"]
          }
        }
      },
      {
        Sid      = "WriteRawObjects"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
        Resource = "${aws_s3_bucket.main_s3.arn}/raw/*"
      },
    ]
  })
}

resource "aws_iam_access_key" "media_uploader" {
  user = aws_iam_user.media_uploader.name
}

// Provider: Turso
provider "turso" {
  api_token    = var.turso_api_token
  organization = "karam"
}

variable "turso_api_token" {
  description = "my Turso API token"
  type        = string
  nullable    = false
  sensitive   = true
}

variable "turso_database_url" {
  description = "url of Turso db, current provider does not provide information about the url, the default value here  is a good guess of the url"
  type        = string
  nullable    = false
  default     = "libsql://portfolio-karam.aws-us-west-2.turso.io"
}

variable "turso_token_full_access" {
  description = "created by `turso db tokens create portfolio -e 7d`. I could have used `data 'turso_database_token` but unfurtunately that would be generated every time I `terraform apply`. I don't want that behavior, so I would generate that manually and store in a variable"
  type        = string
  sensitive   = true
}

variable "turso_token_read_only" {
  description = "created by `turso db tokens create portfolio -e 7d --read-only`. I could have used `data 'turso_database_token` but unfurtunately that would be generated every time I `terraform apply`. I don't want that behavior, so I would generate that manually and store in a variable"
  type        = string
  sensitive   = true
}

// Provider: Vercel
provider "vercel" {
  team      = "karam-barakats-projects"
  api_token = var.vercel_api_token
}

variable "vercel_api_token" {
  description = "my Vercel personal access token."
  type        = string
  sensitive   = true
}

data "vercel_project" "frontend" {
  name = "portfolio"
}

resource "vercel_project_environment_variable" "turso_database_url" {
  project_id = data.vercel_project.frontend.id
  key        = "TURSO_DATABASE_URL"
  value      = var.turso_database_url
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "turso_auth_token" {
  project_id = data.vercel_project.frontend.id
  key        = "TURSO_AUTH_TOKEN_READ_ONLY"
  value      = var.turso_token_read_only
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "turso_auth_token_full_access" {
  project_id = data.vercel_project.frontend.id
  key        = "TURSO_AUTH_TOKEN_FULL_ACCESS"
  value      = var.turso_token_full_access
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "media_bucket_domain" {
  project_id = data.vercel_project.frontend.id
  key        = "PUBLIC_MEDIA_BUCKET_DOMAIN"
  value      = "https://${aws_s3_bucket.main_s3.bucket_domain_name}" # This will likely be a new token created for the project.
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "google_oauth_client_id" {
  project_id = data.vercel_project.frontend.id
  key        = "PUBLIC_GOOGLE_OAUTH_CLIENT_ID"
  value      = var.admin_google_oauth_client_id
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "google_oauth_client_secret" {
  project_id = data.vercel_project.frontend.id
  key        = "GOOGLE_OAUTH_CLIENT_SECRET"
  value      = var.admin_google_oauth_client_secret
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "jwt_secret" {
  project_id = data.vercel_project.frontend.id
  key        = "JWT_SECRET"
  value      = var.admin_jwt_secret
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "aws_access_key_id" {
  project_id = data.vercel_project.frontend.id
  key        = "AWS_ACCESS_KEY_ID"
  value      = aws_iam_access_key.media_uploader.id
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "aws_secret_access_key" {
  project_id = data.vercel_project.frontend.id
  key        = "AWS_SECRET_ACCESS_KEY"
  value      = aws_iam_access_key.media_uploader.secret
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "aws_region" {
  project_id = data.vercel_project.frontend.id
  key        = "AWS_REGION"
  value      = "us-west-2"
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "aws_s3_bucket" {
  project_id = data.vercel_project.frontend.id
  key        = "AWS_S3_BUCKET"
  value      = aws_s3_bucket.main_s3.bucket
  target     = ["production", "preview", "development"]
}

# public information, that I might use as a hint on how to regenerate terraform.tfstate successfully
output "gcp_main_email" {
  value = "k99.barakat@gmail.com"
}

output "gcp_project_name" {
  value = "main-396908"
}

output "vercel_frontend_project_id" {
  value = data.vercel_project.frontend.id
}

output "vercel_frontend_team_id" {
  value = data.vercel_project.frontend.team_id
}

output "vercel_main_email" {
  value = "k99.barakat@gmail.com"
}

output "turso_main_email" {
  value = "k99.barakat@gmail.com"
}

output "turso_db" {
  value = var.turso_database_url
}

output "aws_main_email" {
  value = "k99.barakat@gmail.com"
}

output "aws_s3_bucket_arn" {
  value = aws_s3_bucket.main_s3.arn
}

output "aws_media_uploader_access_key_id" {
  value = aws_iam_access_key.media_uploader.id
}
