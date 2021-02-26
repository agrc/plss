// project settings
variable "agency" {
  type    = string
  default = "dts-agrc"
}
variable "application" {
  type        = string
  description = "the name of the application"
}
variable "environment" {
  type        = string
  description = "Application environment"
  validation {
    condition     = contains(["dev", "at", "prod"], var.environment)
    error_message = "Value must be one of: dev, at, prod."
  }
}
variable "project_labels" {
  type = map(any)
  default = {
    app         = "void"
    contact     = "void"
    dept        = "void"
    elcid       = "void"
    env         = "void"
    security    = "0"
    supportcode = "void"
  }
}
variable "billing_account" {
  type        = string
  description = "GCP billing account"
}
variable "folder_id" {
  type = string
}

// services to enable
variable "services" {
  type    = list(any)
  default = []
}

variable "region" {
  type        = string
  description = "The region of the resources"
  default     = "us-central1"
}

variable "storage_region" {
  type        = string
  description = "The region of the storage"
  default     = "US"
}
variable "storage_class" {
  type        = string
  description = "The region of the storage"
  default     = "STANDARD"
  validation {
    condition     = contains(["STANDARD", "MULTI_REGIONAL", "REGIONAL", "NEARLINE", "COLDLINE", "ARCHIVE"], var.storage_class)
    error_message = "Value must be one of: STANDARD, MULTI_REGIONAL, REGIONAL, NEARLINE, COLDLINE, ARCHIVE."
  }
}

variable "managed_cert_urls" {
  type = list(any)
}
