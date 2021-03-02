resource "google_storage_bucket" "approved" {
  name                        = "plss-approved"
  location                    = var.storage_region
  storage_class               = var.storage_class
  uniform_bucket_level_access = true
  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
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

resource "google_storage_bucket_object" "not-found" {
  name    = "404.html"
  content = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>404: File not found</title><link href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' rel='stylesheet' integrity='sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T' crossorigin='anonymous'></head><body class='mt-5'><div class='container'><div class='jumbotron alert-warning'><div class='container'><h1 class='display-4'>File not found</h1><p class='lead'>Check your link and contact AGRC if you have reached this in error.</p></div></div></div></body></html>"
  bucket  = google_storage_bucket.approved.name
}

resource "google_storage_bucket_object" "index" {
  name    = "index.html"
  content = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>PLSS</title><link href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' rel='stylesheet' integrity='sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T' crossorigin='anonymous'></head><body class='mt-5'><div class='container'><div class='jumbotron alert-warning'><div class='container'><h1 class='display-4'>Monument sheet storage</h1><p class='lead'>Use https://plss.utah.gov to view specific monument record sheets.</p></div></div></div></body></html>"
  bucket  = google_storage_bucket.approved.name
}

resource "google_storage_bucket_object" "data-index" {
  name    = "data/index.html"
  content = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>PLSS</title><link href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' rel='stylesheet' integrity='sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T' crossorigin='anonymous'></head><body class='mt-5'><div class='container'><div class='jumbotron alert-warning'><div class='container'><h1 class='display-4'>Monument sheet storage</h1><p class='lead'>Use https://plss.utah.gov to view specific monument record sheets.</p></div></div></div></body></html>"
  bucket  = google_storage_bucket.approved.name
}
