resource "google_project" "project" {
  name                = "ut-${var.agency}-${var.application}-${var.environment}"
  project_id          = "ut-${var.agency}-${var.application}-${var.environment}"
  labels              = var.project_labels
  billing_account     = var.billing_account
  folder_id           = var.folder_id
  auto_create_network = false
}

resource "google_project_service" "required_apis" {
  for_each           = toset(var.services)
  service            = each.key
  project            = google_project.project.project_id
  disable_on_destroy = false
}

output "project" {
  value = google_project.project.name
}
