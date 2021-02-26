resource "google_compute_global_address" "default" {
  project     = google_project.project.project_id
  name        = "global-load-balancer-ip"
  description = "Public IP address for the load balancer"
}

output "public_ip" {
  value = google_compute_global_address.default.address
}

resource "google_compute_managed_ssl_certificate" "default" {
  project = google_project.project.project_id
  name    = "https-certificate"

  lifecycle {
    create_before_destroy = true
  }

  managed {
    domains = var.managed_cert_urls
  }
}
