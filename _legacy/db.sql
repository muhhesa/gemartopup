-- ============================================================
-- FlashTop Database Schema
-- Import file ini ke MySQL melalui phpMyAdmin atau CLI:
--   mysql -u root -p flashtop_db < db.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `flashtop_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `flashtop_db`;

-- ============================================================
-- TABEL: orders — Semua transaksi
-- ============================================================
CREATE TABLE IF NOT EXISTS `orders` (
    `id`                INT AUTO_INCREMENT PRIMARY KEY,
    `order_id`          VARCHAR(20) NOT NULL UNIQUE,
    `game_id`           VARCHAR(20) NOT NULL,
    `game_name`         VARCHAR(100) NOT NULL,
    `game_short`        VARCHAR(10) NOT NULL,
    `game_color`        VARCHAR(10) DEFAULT '#3B82F6',
    `product_id`        VARCHAR(30) NOT NULL,
    `qty`               INT NOT NULL,
    `unit`              VARCHAR(30) NOT NULL,
    `player_id`         VARCHAR(50) NOT NULL,
    `zone_id`           VARCHAR(50) DEFAULT NULL,
    `customer_phone`    VARCHAR(20) DEFAULT NULL,
    `payment_method`    VARCHAR(30) NOT NULL COMMENT 'QRIS, BRIVA, BCAVA, dll',
    `price_base`        BIGINT NOT NULL DEFAULT 0 COMMENT 'Harga beli dari Indoflazz',
    `price_sell`        BIGINT NOT NULL COMMENT 'Harga jual ke pelanggan',
    `margin_pct`        DECIMAL(5,2) DEFAULT 5.00,
    `profit`            BIGINT NOT NULL DEFAULT 0,
    `status`            ENUM('pending','paid','processing','success','failed','expired','refund') NOT NULL DEFAULT 'pending',
    `tripay_reference`  VARCHAR(50) DEFAULT NULL,
    `tripay_pay_url`    TEXT DEFAULT NULL,
    `tripay_pay_code`   VARCHAR(100) DEFAULT NULL COMMENT 'VA number / QR string',
    `tripay_channel`    VARCHAR(20) DEFAULT NULL,
    `indoflazz_ref`     VARCHAR(50) DEFAULT NULL,
    `indoflazz_status`  VARCHAR(20) DEFAULT NULL,
    `wa_notified`       TINYINT(1) DEFAULT 0,
    `notes`             TEXT DEFAULT NULL,
    `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `paid_at`           DATETIME DEFAULT NULL,
    `completed_at`      DATETIME DEFAULT NULL,
    INDEX `idx_status` (`status`),
    INDEX `idx_created` (`created_at`),
    INDEX `idx_game` (`game_id`),
    INDEX `idx_tripay` (`tripay_reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: products — Produk game (dikelola dari admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS `products` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `game_id`       VARCHAR(20) NOT NULL UNIQUE,
    `game_name`     VARCHAR(100) NOT NULL,
    `game_short`    VARCHAR(10) NOT NULL,
    `game_color`    VARCHAR(10) DEFAULT '#3B82F6',
    `game_unit`     VARCHAR(30) NOT NULL,
    `image_url`     VARCHAR(255) DEFAULT '',
    `dc`            VARCHAR(20) NOT NULL COMMENT 'data-c attribute untuk CSS glow',
    `zone_required` TINYINT(1) DEFAULT 0,
    `zone_name`     VARCHAR(30) DEFAULT NULL,
    `zone_precheck` TINYINT(1) DEFAULT 0 COMMENT 'Apakah perlu cek ID game',
    `zone_options`  TEXT DEFAULT NULL COMMENT 'JSON array opsi zone/server',
    `items`         LONGTEXT NOT NULL COMMENT 'JSON array: [{id,qty,price_base,price_sell,badge}]',
    `margin_pct`    DECIMAL(5,2) DEFAULT NULL COMMENT 'NULL = pakai margin global',
    `is_active`     TINYINT(1) DEFAULT 1,
    `sort_order`    INT DEFAULT 0,
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: settings — Konfigurasi key-value
-- ============================================================
CREATE TABLE IF NOT EXISTS `settings` (
    `key`        VARCHAR(50) PRIMARY KEY,
    `value`      TEXT NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: admin_sessions — Session login admin
-- ============================================================
CREATE TABLE IF NOT EXISTS `admin_sessions` (
    `token`      VARCHAR(64) PRIMARY KEY,
    `username`   VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` DATETIME NOT NULL,
    INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: price_cache — Cache harga dari Indoflazz
-- ============================================================
CREATE TABLE IF NOT EXISTS `price_cache` (
    `product_code` VARCHAR(50) PRIMARY KEY,
    `price`        BIGINT NOT NULL,
    `product_name` VARCHAR(200) DEFAULT NULL,
    `fetched_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DEFAULT SETTINGS
-- ============================================================
INSERT INTO `settings` (`key`, `value`) VALUES
('store_name',      'FlashTop'),
('store_wa',        '628123456789'),
('default_margin',  '5'),
('tripay_sandbox',  '1'),
('wa_notify_paid',  '1'),
('wa_notify_success','1'),
('wa_notify_failed','1')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ============================================================
-- DEFAULT PRODUCTS (sama dengan data awal di index.html)
-- ============================================================
INSERT INTO `products` (`game_id`,`game_name`,`game_short`,`game_color`,`game_unit`,`image_url`,`dc`,`zone_required`,`zone_name`,`zone_precheck`,`zone_options`,`items`,`sort_order`) VALUES
('ml','Mobile Legends','ML','#1565C0','Diamond','https://placehold.co/400x600/1565C0/FFF?text=Mobile+Legends','ml',1,'Zone ID',1,NULL,
 '[{"id":"ml-86","qty":86,"price_base":13000,"price_sell":15500},{"id":"ml-172","qty":172,"price_base":25000,"price_sell":30000},{"id":"ml-257","qty":257,"price_base":37000,"price_sell":44500},{"id":"ml-344","qty":344,"price_base":49000,"price_sell":58500,"badge":"Terlaris"},{"id":"ml-429","qty":429,"price_base":61000,"price_sell":73000},{"id":"ml-514","qty":514,"price_base":73000,"price_sell":87500},{"id":"ml-706","qty":706,"price_base":98000,"price_sell":117500},{"id":"ml-878","qty":878,"price_base":122000,"price_sell":146000},{"id":"ml-1050","qty":1050,"price_base":146000,"price_sell":174500}]',1),

('ff','Free Fire','FF','#E65100','Diamond','https://placehold.co/400x600/E65100/FFF?text=Free+Fire','ff',0,NULL,0,NULL,
 '[{"id":"ff-70","qty":70,"price_base":6500,"price_sell":8000},{"id":"ff-140","qty":140,"price_base":13000,"price_sell":15500},{"id":"ff-355","qty":355,"price_base":31000,"price_sell":37500,"badge":"Terlaris"},{"id":"ff-720","qty":720,"price_base":62000,"price_sell":74000},{"id":"ff-1450","qty":1450,"price_base":123000,"price_sell":147000},{"id":"ff-2180","qty":2180,"price_base":183000,"price_sell":219500}]',2),

('pubg','PUBG Mobile','PUBG','#F57F17','UC','https://placehold.co/400x600/F57F17/FFF?text=PUBG+Mobile','pubg',0,NULL,0,NULL,
 '[{"id":"pubg-60","qty":60,"price_base":9000,"price_sell":11000},{"id":"pubg-180","qty":180,"price_base":27000,"price_sell":32000},{"id":"pubg-325","qty":325,"price_base":48000,"price_sell":57000,"badge":"Terlaris"},{"id":"pubg-660","qty":660,"price_base":95000,"price_sell":114000},{"id":"pubg-1800","qty":1800,"price_base":255000,"price_sell":305000}]',3),

('gi','Genshin Impact','GI','#4527A0','Crystal','https://placehold.co/400x600/4527A0/FFF?text=Genshin+Impact','gi',1,'Server',0,'["Asia","America","Europe","TW/HK/MO"]',
 '[{"id":"gi-60","qty":60,"price_base":12500,"price_sell":15000},{"id":"gi-300","qty":300,"price_base":60000,"price_sell":72000,"badge":"Terlaris"},{"id":"gi-980","qty":980,"price_base":190000,"price_sell":228000},{"id":"gi-1980","qty":1980,"price_base":375000,"price_sell":450000},{"id":"gi-3280","qty":3280,"price_base":607000,"price_sell":728000},{"id":"gi-6480","qty":6480,"price_base":1175000,"price_sell":1410000}]',4),

('hsr','Honkai: Star Rail','HSR','#0277BD','Oneiric Shard','https://placehold.co/400x600/0277BD/FFF?text=Honkai+Star+Rail','hsr',1,'Server',0,'["Asia","America","Europe","TW/HK/MO"]',
 '[{"id":"hsr-60","qty":60,"price_base":12500,"price_sell":15000},{"id":"hsr-300","qty":300,"price_base":60000,"price_sell":72000,"badge":"Terlaris"},{"id":"hsr-980","qty":980,"price_base":190000,"price_sell":228000},{"id":"hsr-1980","qty":1980,"price_base":375000,"price_sell":450000}]',5),

('cod','Call of Duty Mobile','COD','#1B5E20','CP','https://placehold.co/400x600/1B5E20/FFF?text=CODM','cod',0,NULL,0,NULL,
 '[{"id":"cod-80","qty":80,"price_base":11000,"price_sell":13500},{"id":"cod-400","qty":400,"price_base":53000,"price_sell":64000,"badge":"Terlaris"},{"id":"cod-800","qty":800,"price_base":104000,"price_sell":125000},{"id":"cod-2000","qty":2000,"price_base":257000,"price_sell":308000}]',6),

('wr','Wild Rift','WR','#00838F','Wild Cores','https://placehold.co/400x600/00838F/FFF?text=Wild+Rift','wr',0,NULL,0,NULL,
 '[{"id":"wr-75","qty":75,"price_base":8300,"price_sell":10000},{"id":"wr-340","qty":340,"price_base":37000,"price_sell":44000,"badge":"Terlaris"},{"id":"wr-590","qty":590,"price_base":62000,"price_sell":74000},{"id":"wr-1380","qty":1380,"price_base":142000,"price_sell":170000}]',7),

('valo','Valorant','VP','#C62828','VP','https://placehold.co/400x600/C62828/FFF?text=Valorant','valo',0,NULL,0,NULL,
 '[{"id":"valo-125","qty":125,"price_base":13000,"price_sell":16000},{"id":"valo-420","qty":420,"price_base":43000,"price_sell":52000},{"id":"valo-700","qty":700,"price_base":72000,"price_sell":86000,"badge":"Terlaris"},{"id":"valo-1375","qty":1375,"price_base":141000,"price_sell":169000},{"id":"valo-2050","qty":2050,"price_base":208000,"price_sell":250000}]',8)

ON DUPLICATE KEY UPDATE
    `game_name`=VALUES(`game_name`),
    `items`=VALUES(`items`),
    `updated_at`=NOW();
