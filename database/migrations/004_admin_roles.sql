-- Content Manager role on admin_users
ALTER TABLE admin_users
  ADD COLUMN role ENUM('admin', 'content_manager') NOT NULL DEFAULT 'admin'
  AFTER email;
