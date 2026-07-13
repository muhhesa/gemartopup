<?php
/**
 * proxy.php — Backend Proxy untuk API Indoflazz
 * 
 * CARA PAKAI:
 * 1. Isi $API_KEY dengan API key dari dashboard Indoflazz
 * 2. Upload file ini ke hosting kamu (folder yang sama dengan index.html)
 * 3. Di menu Pengaturan website, set URL Proxy ke: /proxy.php
 * 4. Aktifkan Live Mode
 * 5. Daftarkan IP server kamu ke admin Indoflazz (wajib untuk whitelist)
 *
 * Hosting yang direkomendasikan: Niagahoster, IDwebhost, Rumahweb
 * Paket paling murah sudah cukup (shared hosting dengan PHP 7.4+)
 */

// ============================================================
// KONFIGURASI — Wajib diisi
// ============================================================
$API_KEY  = 'ISI_API_KEY_INDOFLAZZ_DI_SINI';
$API_BASE = 'https://a-api.indoflazz.com/api/';

// Nama toko untuk log (opsional)
$STORE_NAME = 'FlashTop';

// ============================================================
// HEADERS
// ============================================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Hanya izinkan POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// ============================================================
// PARSE INPUT
// ============================================================
$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
    exit;
}

$endpoint = $input['endpoint'] ?? 'service';
$allowed  = ['service', 'order', 'status', 'saldo'];

if (!in_array($endpoint, $allowed)) {
    echo json_encode(['status' => 'error', 'message' => 'Endpoint tidak diizinkan']);
    exit;
}

// ============================================================
// BUILD PARAMS — Hapus 'endpoint' dari params, tambah api_key
// ============================================================
$params = $input;
unset($params['endpoint']);
$params['api_key'] = $API_KEY;

// ============================================================
// CALL INDOFLAZZ API
// ============================================================
$url = $API_BASE . $endpoint;

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query($params),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_USERAGENT      => $STORE_NAME . '/1.0',
]);

$response  = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// ============================================================
// HANDLE ERRORS
// ============================================================
if ($curlError) {
    error_log('[' . $STORE_NAME . '] cURL error: ' . $curlError);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Gagal menghubungi server Indoflazz: ' . $curlError,
    ]);
    exit;
}

if ($httpCode !== 200) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Server Indoflazz merespons dengan kode: ' . $httpCode,
    ]);
    exit;
}

// ============================================================
// RETURN RESPONSE
// ============================================================
// Log untuk debugging (hapus di production jika tidak perlu)
// error_log('[' . $STORE_NAME . '] ' . $endpoint . ' -> ' . $response);

echo $response;
