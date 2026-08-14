-- Concept Portfolio — MySQL schema (idempotent CREATE IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS portfolio_items (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  service VARCHAR(32) NOT NULL,
  slug VARCHAR(160) NULL,
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  content_json JSON NOT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  INDEX idx_portfolio_service_status (service, status),
  INDEX idx_portfolio_service_order (service, sort_order),
  INDEX idx_portfolio_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Unique (service, slug) only when slug is present (MySQL allows multiple NULLs in UNIQUE)
CREATE UNIQUE INDEX IF NOT EXISTS uq_portfolio_service_slug
  ON portfolio_items (service, slug);

CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  filename VARCHAR(512) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'local',
  provider_key VARCHAR(512) NULL,
  public_url TEXT NULL,
  width INT NULL,
  height INT NULL,
  object_position_x DECIMAL(6,2) NULL DEFAULT 50,
  object_position_y DECIMAL(6,2) NULL DEFAULT 50,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  INDEX idx_media_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  data_json JSON NOT NULL,
  updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  UNIQUE KEY uq_session_token_hash (token_hash),
  INDEX idx_session_expires (expires_at),
  CONSTRAINT fk_session_user
    FOREIGN KEY (user_id) REFERENCES admin_users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_views (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  path VARCHAR(500) NOT NULL,
  visitor_hash CHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  country_code VARCHAR(2) NULL,
  city VARCHAR(80) NULL,
  referrer_host VARCHAR(255) NULL,
  device VARCHAR(16) NULL,
  browser VARCHAR(40) NULL,
  os VARCHAR(40) NULL,
  language VARCHAR(16) NULL,
  INDEX idx_views_created (created_at),
  INDEX idx_views_path (path(191)),
  INDEX idx_views_visitor_day (visitor_hash, created_at),
  INDEX idx_views_country (country_code),
  INDEX idx_views_device (device)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
