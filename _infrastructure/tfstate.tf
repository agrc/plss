resource "google_storage_bucket" "tf_state_store" {
  project       = "ut-${var.agency}-tf-state-prod"
  name          = "${google_project.project.name}-tfstate"
  location      = "us-central1"
  storage_class = "REGIONAL"
  # add lifecycle for versions: https://cloud.google.com/storage/docs/lifecycle#numberofnewerversions
  versioning {
    enabled = true
  }
  uniform_bucket_level_access = false
  lifecycle_rule {
    action {
      type = "Delete"
    }

    condition {
      age                = 0
      num_newer_versions = 50
      with_state         = "ANY"
    }
  }
}

terraform {
  backend "gcs" {
    bucket = "ut-dts-agrc-plss-dev-tfstate"
    prefix = "state"
  }
}

output "bucket_name" {
  value = google_storage_bucket.tf_state_store.name
}
