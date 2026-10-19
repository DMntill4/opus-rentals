-- =============================================================================
-- OPUS RENTALS - DATABASE SCHEMA (4FN NORMALIZED)
-- Engine: MySQL 8.0+ | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `opus_rentals_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `opus_rentals_db`;

-- Drop tables in reverse foreign-key order
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `payment_methods`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `rental_damages`;
DROP TABLE IF EXISTS `rental_returns`;
DROP TABLE IF EXISTS `rentals`;
DROP TABLE IF EXISTS `tool_specifications`;
DROP TABLE IF EXISTS `tool_images`;
DROP TABLE IF EXISTS `tools`;
DROP TABLE IF EXISTS `tool_categories`;
DROP TABLE IF EXISTS `provider_coverage_zones`;
DROP TABLE IF EXISTS `provider_contacts`;
DROP TABLE IF EXISTS `providers`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

-- -----------------------------------------------------------------------------
-- 1. ROLES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `roles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    CONSTRAINT `pk_roles` PRIMARY KEY (`id`),
    CONSTRAINT `uk_roles_name` UNIQUE (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role_id` BIGINT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_users` PRIMARY KEY (`id`),
    CONSTRAINT `uk_users_email` UNIQUE (`email`),
    CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. CLIENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `clients` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `document_type` VARCHAR(20) NOT NULL,
    `document_number` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_clients` PRIMARY KEY (`id`),
    CONSTRAINT `uk_clients_user_id` UNIQUE (`user_id`),
    CONSTRAINT `uk_clients_document` UNIQUE (`document_type`, `document_number`),
    CONSTRAINT `fk_clients_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. PROVIDERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `providers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `company_name` VARCHAR(150) NOT NULL,
    `tax_id` VARCHAR(50) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_providers` PRIMARY KEY (`id`),
    CONSTRAINT `uk_providers_user_id` UNIQUE (`user_id`),
    CONSTRAINT `uk_providers_tax_id` UNIQUE (`tax_id`),
    CONSTRAINT `fk_providers_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. PROVIDER CONTACTS (4FN: Separated from coverage zones)
-- -----------------------------------------------------------------------------
CREATE TABLE `provider_contacts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `provider_id` BIGINT NOT NULL,
    `contact_type` VARCHAR(30) NOT NULL, -- 'PHONE', 'EMAIL', 'WHATSAPP', 'SUPPORT'
    `contact_value` VARCHAR(150) NOT NULL,
    CONSTRAINT `pk_provider_contacts` PRIMARY KEY (`id`),
    CONSTRAINT `fk_provider_contacts_providers` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE,
    INDEX `idx_provider_contacts_provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. PROVIDER COVERAGE ZONES (4FN: Multi-valued independent of contacts)
-- -----------------------------------------------------------------------------
CREATE TABLE `provider_coverage_zones` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `provider_id` BIGINT NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    CONSTRAINT `pk_provider_coverage_zones` PRIMARY KEY (`id`),
    CONSTRAINT `fk_provider_coverage_providers` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE,
    INDEX `idx_provider_coverage_provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. TOOL CATEGORIES
-- -----------------------------------------------------------------------------
CREATE TABLE `tool_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `icon` VARCHAR(50) NULL,
    CONSTRAINT `pk_tool_categories` PRIMARY KEY (`id`),
    CONSTRAINT `uk_tool_categories_name` UNIQUE (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. TOOLS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `tools` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `provider_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `brand` VARCHAR(100) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `daily_price` DECIMAL(12,2) NOT NULL,
    `deposit_amount` DECIMAL(12,2) NOT NULL,
    `total_quantity` INT NOT NULL DEFAULT 5,
    `available_quantity` INT NOT NULL DEFAULT 5,
    `status` VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RENTED', 'MAINTENANCE', 'RETIRED'
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_tools` PRIMARY KEY (`id`),
    CONSTRAINT `fk_tools_providers` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_tools_categories` FOREIGN KEY (`category_id`) REFERENCES `tool_categories` (`id`) ON DELETE RESTRICT,
    INDEX `idx_tools_provider` (`provider_id`),
    INDEX `idx_tools_category` (`category_id`),
    INDEX `idx_tools_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TOOL IMAGES (4FN: Independent image entity, not coupled with specs)
-- -----------------------------------------------------------------------------
CREATE TABLE `tool_images` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tool_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `is_cover` BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT `pk_tool_images` PRIMARY KEY (`id`),
    CONSTRAINT `fk_tool_images_tools` FOREIGN KEY (`tool_id`) REFERENCES `tools` (`id`) ON DELETE CASCADE,
    INDEX `idx_tool_images_tool` (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. TOOL SPECIFICATIONS (4FN: Independent specs entity, not coupled with images)
-- -----------------------------------------------------------------------------
CREATE TABLE `tool_specifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tool_id` BIGINT NOT NULL,
    `spec_key` VARCHAR(100) NOT NULL,
    `spec_value` VARCHAR(255) NOT NULL,
    CONSTRAINT `pk_tool_specifications` PRIMARY KEY (`id`),
    CONSTRAINT `fk_tool_specifications_tools` FOREIGN KEY (`tool_id`) REFERENCES `tools` (`id`) ON DELETE CASCADE,
    INDEX `idx_tool_specifications_tool` (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. RENTALS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `rentals` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `client_id` BIGINT NOT NULL,
    `tool_id` BIGINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `total_days` INT NOT NULL,
    `daily_rate` DECIMAL(12,2) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `subtotal` DECIMAL(12,2) NOT NULL,
    `deposit_amount` DECIMAL(12,2) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'IN_PROGRESS', 'RETURNED', 'CANCELLED'
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_rentals` PRIMARY KEY (`id`),
    CONSTRAINT `fk_rentals_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_rentals_tools` FOREIGN KEY (`tool_id`) REFERENCES `tools` (`id`) ON DELETE RESTRICT,
    INDEX `idx_rentals_client` (`client_id`),
    INDEX `idx_rentals_tool` (`tool_id`),
    INDEX `idx_rentals_dates` (`start_date`, `end_date`),
    INDEX `idx_rentals_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. RENTAL RETURNS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `rental_returns` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rental_id` BIGINT NOT NULL,
    `return_date` DATE NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'COMPLETED', -- 'COMPLETED', 'DAMAGED_REPORTED'
    `general_notes` TEXT NULL,
    `inspector_notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_rental_returns` PRIMARY KEY (`id`),
    CONSTRAINT `uk_rental_returns_rental` UNIQUE (`rental_id`),
    CONSTRAINT `fk_rental_returns_rentals` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. RENTAL DAMAGES TABLE (4FN: Isolated damages itemization)
-- -----------------------------------------------------------------------------
CREATE TABLE `rental_damages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `return_id` BIGINT NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `severity` VARCHAR(30) NOT NULL DEFAULT 'MINOR', -- 'MINOR', 'MODERATE', 'SEVERE', 'TOTAL_LOSS'
    `penalty_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_rental_damages` PRIMARY KEY (`id`),
    CONSTRAINT `fk_rental_damages_returns` FOREIGN KEY (`return_id`) REFERENCES `rental_returns` (`id`) ON DELETE CASCADE,
    INDEX `idx_rental_damages_return` (`return_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. INVOICES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `invoices` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rental_id` BIGINT NOT NULL,
    `invoice_number` VARCHAR(50) NOT NULL,
    `issue_date` DATE NOT NULL,
    `subtotal` DECIMAL(12,2) NOT NULL,
    `tax_amount` DECIMAL(12,2) NOT NULL,
    `total_amount` DECIMAL(12,2) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ISSUED', -- 'ISSUED', 'PAID', 'CANCELLED'
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_invoices` PRIMARY KEY (`id`),
    CONSTRAINT `uk_invoices_rental` UNIQUE (`rental_id`),
    CONSTRAINT `uk_invoices_number` UNIQUE (`invoice_number`),
    CONSTRAINT `fk_invoices_rentals` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
    INDEX `idx_invoices_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. PAYMENT METHODS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `payment_methods` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL, -- 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH'
    `name` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT `pk_payment_methods` PRIMARY KEY (`id`),
    CONSTRAINT `uk_payment_methods_code` UNIQUE (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. PAYMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `invoice_id` BIGINT NOT NULL,
    `payment_method_id` BIGINT NOT NULL,
    `transaction_reference` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `payment_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `payment_status` VARCHAR(30) NOT NULL DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_payments` PRIMARY KEY (`id`),
    CONSTRAINT `uk_payments_reference` UNIQUE (`transaction_reference`),
    CONSTRAINT `fk_payments_invoices` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_payments_methods` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE RESTRICT,
    INDEX `idx_payments_invoice` (`invoice_id`),
    INDEX `idx_payments_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 17. RENTAL CLAIMS, WARRANTIES AND REFUNDS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `rental_claims` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rental_id` BIGINT NOT NULL,
    `client_id` BIGINT NOT NULL,
    `claim_type` VARCHAR(50) NOT NULL, -- 'WARRANTY_REPLACEMENT', 'DAMAGE_REPORT', 'REFUND_REQUEST'
    `reason` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `requested_action` VARCHAR(100) NULL, -- 'REPLACEMENT', 'TECHNICIAN_VISIT', 'PARTIAL_REFUND', 'TOTAL_REFUND'
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED'
    `refund_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `resolution_notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `resolved_at` TIMESTAMP NULL,
    CONSTRAINT `pk_rental_claims` PRIMARY KEY (`id`),
    CONSTRAINT `fk_claims_rentals` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_claims_clients` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
    INDEX `idx_claims_rental` (`rental_id`),
    INDEX `idx_claims_client` (`client_id`),
    INDEX `idx_claims_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

