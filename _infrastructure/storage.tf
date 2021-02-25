resource "google_storage_bucket" "approved" {
  name                        = "plss-approved"
  location                    = var.storage_region
  storage_class               = var.storage_class
  uniform_bucket_level_access = true
}

resource "google_storage_bucket" "pending" {
  name                        = "plss-pending"
  location                    = var.storage_region
  storage_class               = var.storage_class
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "data" {
  name    = "data/"
  content = "data folder"
  bucket  = google_storage_bucket.approved.name
}
