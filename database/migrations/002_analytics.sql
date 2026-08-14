CREATE TABLE IF NOT EXISTS page_views (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  path VARCHAR(500) NOT NULL,
  visitor_hash CHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  INDEX idx_views_created (created_at),
  INDEX idx_views_path (path(191)),
  INDEX idx_views_visitor_day (visitor_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
