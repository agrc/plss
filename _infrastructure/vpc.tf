resource "google_compute_global_address" "default" {
  project     = google_project.project.project_id
  name        = "global-load-balancer-ip"
  description = "Public IP address for the load balancer"
}

output "public_ip" {
  value = google_compute_global_address.default.address
}
