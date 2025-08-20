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
      source = "vercel/vercel"
      version = "~> 0.3"
    }
  }

  required_version = ">= 1.2"
}

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

provider "turso" {
  api_token = var.turso_api_token
  organization = "karam"
}

data "turso_database_token" "token" {
  id = "portfolio"
  authorization = "read-only"
}

variable "vercel_api_token" {
  description = "my Vercel personal access token."
  type        = string
  sensitive   = true
}

provider "vercel" {
  team = "karam-barakats-projects"
  api_token = var.vercel_api_token
}

// vercel project itself is not managed by terraform, but terraform keep track of it
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
  key        = "TURSO_AUTH_TOKEN"
  value      = data.turso_database_token.token.jwt # This will likely be a new token created for the project.
  target     = ["production", "preview", "development"]
  # Mark the variable as sensitive so it's not shown in Terraform output
  # sensitive = true
}

resource "vercel_project_environment_variable" "media_bucket_domain" {
  project_id = data.vercel_project.frontend.id
  key        = "PUBLIC_MEDIA_BUCKET_DOMAIN"
  value      = "https://${aws_s3_bucket.main_s3.bucket_domain_name}"  # This will likely be a new token created for the project.
  target     = ["production", "preview", "development"]
  # Mark the variable as sensitive so it's not shown in Terraform output
  # sensitive = true
}
