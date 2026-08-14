ALTER TABLE page_views
  ADD COLUMN country_code VARCHAR(2) NULL,
  ADD COLUMN city VARCHAR(80) NULL,
  ADD COLUMN referrer_host VARCHAR(255) NULL,
  ADD COLUMN device VARCHAR(16) NULL,
  ADD COLUMN browser VARCHAR(40) NULL,
  ADD COLUMN os VARCHAR(40) NULL,
  ADD COLUMN language VARCHAR(16) NULL;

CREATE INDEX idx_views_country ON page_views (country_code);
CREATE INDEX idx_views_device ON page_views (device);
