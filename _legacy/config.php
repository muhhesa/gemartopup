<?php
/**
 * config.php — Konfigurasi Pusat FlashTop
 * 
 * ISI SEMUA KONFIGURASI DI BAWAH INI SEBELUM GO-LIVE.
 * File ini TIDAK boleh diakses publik. Pastikan hosting kamu
 * melindungi file .php dari direct download.
 */

// ============================================================
// DATABASE MYSQL
// ============================================================
define('DB_HOST', 'localhost');
define('DB_NAME', 'flashtop_db');     // Nama database yang sudah dibuat di cPanel
define('DB_USER', 'root');            // Username database
define('DB_PASS', '');                // Password database

// ============================================================
// TRIPAY — Payment Gateway
// Daftar di: https://tripay.co.id
// ============================================================
define('TRIPAY_API_KEY',     'ISI_TRIPAY_API_KEY');
define('TRIPAY_PRIVATE_KEY', 'ISI_TRIPAY_PRIVATE_KEY');
define('TRIPAY_MERCHANT',    'ISI_TRIPAY_MERCHANT_CODE');
define('TRIPAY_SANDBOX',     true);  // true = sandbox (testing), false = production

// URL Tripay otomatis berdasarkan mode
define('TRIPAY_BASE', TRIPAY_SANDBOX
    ? 'https://tripay.co.id/api-sandbox'
    : 'https://tripay.co.id/api'
);

// ============================================================
// INDOFLAZZ — Provider Produk Digital
// Daftar di: https://indoflazz.com
// ============================================================
define('INDOFLAZZ_API_KEY', 'ISI_API_KEY_INDOFLAZZ');
define('INDOFLAZZ_BASE',    'https://a-api.indoflazz.com/api/');

// ============================================================
// FONNTE — WhatsApp Notification Gateway
// Daftar di: https://fonnte.com
// ============================================================
define('FONNTE_TOKEN', 'ISI_TOKEN_FONNTE');

// ============================================================
// ADMIN PANEL
// ============================================================
define('ADMIN_USER', 'admin');          // Username admin
define('ADMIN_PASS', 'admin123');       // Ganti dengan password kuat!

// ============================================================
// BISNIS
// ============================================================
define('DEFAULT_MARGIN', 5);            // Margin default 5% (3% inflasi + 2% profit)
define('STORE_NAME',     'FlashTop');
define('STORE_WA',       '628123456789');

// ============================================================
// CALLBACK URL — Otomatis detect
// ============================================================
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('CALLBACK_URL', $protocol . '://' . $host . '/api.php?action=callback');

// ============================================================
// DATABASE CONNECTION
// ============================================================
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE  => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES    => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
            exit;
        }
    }
    return $pdo;
}
