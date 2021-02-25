resource "google_compute_backend_bucket" "default" {
  name        = "approved-backend-bucket"
  description = "Contains approved monument record sheets"
  bucket_name = google_storage_bucket.approved.name
}

resource "google_compute_url_map" "default" {
  name        = "http-load-balancer"
  description = "The url mapping from load balancer to bucket"

  default_service = google_compute_backend_bucket.default.id

  host_rule {
    hosts        = ["*"]
    description  = "the default rules for routing"
    path_matcher = "default"
  }

  path_matcher {
    name            = "default"
    default_service = google_compute_backend_bucket.default.id
  }
}

resource "google_compute_target_http_proxy" "default" {
  name        = "http-proxy"
  description = "the proxy between the internet and the bucket backend"
  url_map     = google_compute_url_map.default.id
}

resource "google_compute_global_forwarding_rule" "default" {
  name        = "front-end-load-balancer"
  description = "the front end load balancer"
  target      = google_compute_target_http_proxy.default.id
  port_range  = "80"
  ip_address  = google_compute_global_address.default.address
}
