// requires policy exception

resource "google_storage_bucket_iam_member" "public" {
  bucket = google_storage_bucket.approved.name
  member = "allUsers"
  role   = "roles/storage.objectViewer"
}
