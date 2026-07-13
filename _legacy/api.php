<?php
/**
 * api.php — Backend API Router FlashTop
 * 
 * Menangani semua request dari frontend dan admin panel:
 * - Payment gateway (Tripay)
 * - Order management (Database)
 * - WhatsApp notification (Fonnte)
 * - Harga dinamis (Indoflazz + margin)
 * - Admin panel API
 */

require_once __DIR__ . '/config.php';

// ============================================================
// HEADERS
// ============================================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================================================
// ROUTER
// ============================================================
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Check if database is available
$dbAvailable = true;
try { getDB(); } catch (Exception $e) { $dbAvailable = false; }

switch ($action) {
    // --- PUBLIC ---
    case 'products':         handleProducts(); break;
    case 'create_order':     handleCreateOrder(); break;
    case 'track':            handleTrack(); break;
    case 'callback':         handleCallback(); break;
    case 'check_id':         handleCheckId(); break;
    case 'payment_channels': handlePaymentChannels(); break;

    // --- ADMIN ---
    case 'admin_login':      handleAdminLogin(); break;
    case 'admin_dashboard':  requireAdmin(); handleAdminDashboard(); break;
    case 'admin_orders':     requireAdmin(); handleAdminOrders(); break;
    case 'admin_order_detail': requireAdmin(); handleAdminOrderDetail(); break;
    case 'admin_update_order': requireAdmin(); handleAdminUpdateOrder(); break;
    case 'admin_products':   requireAdmin(); handleAdminProducts(); break;
    case 'admin_save_product': requireAdmin(); handleAdminSaveProduct(); break;
    case 'admin_toggle_product': requireAdmin(); handleAdminToggleProduct(); break;
    case 'admin_settings':   requireAdmin(); handleAdminSettings(); break;
    case 'admin_save_settings': requireAdmin(); handleAdminSaveSettings(); break;
    case 'admin_refresh_prices': requireAdmin(); handleAdminRefreshPrices(); break;

    default:
        jsonResp(['status' => 'error', 'message' => 'Unknown action'], 400);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function jsonResp($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: $_POST;
}

function generateOrderId() {
    return 'FT-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
}

function getSetting($key, $default = '') {
    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT `value` FROM settings WHERE `key` = ?');
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        return $row ? $row['value'] : $default;
    } catch (Exception $e) {
        return $default;
    }
}

function setSetting($key, $value) {
    $db = getDB();
    $stmt = $db->prepare('INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?');
    $stmt->execute([$key, $value, $value]);
}

// ============================================================
// ADMIN AUTH
// ============================================================
function requireAdmin() {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN']
        ?? $_GET['token']
        ?? '';

    if (!$token) {
        jsonResp(['status' => 'error', 'message' => 'Unauthorized'], 401);
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM admin_sessions WHERE token = ? AND expires_at > NOW()');
        $stmt->execute([$token]);
        if (!$stmt->fetch()) {
            jsonResp(['status' => 'error', 'message' => 'Session expired'], 401);
        }
    } catch (Exception $e) {
        jsonResp(['status' => 'error', 'message' => 'Auth error'], 500);
    }
}

function handleAdminLogin() {
    $input = getInput();
    $user = $input['username'] ?? '';
    $pass = $input['password'] ?? '';

    if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
        $token = bin2hex(random_bytes(32));
        try {
            $db = getDB();
            // Clean old sessions
            $db->exec("DELETE FROM admin_sessions WHERE expires_at < NOW()");
            // Create new session (24 hours)
            $stmt = $db->prepare('INSERT INTO admin_sessions (token, username, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))');
            $stmt->execute([$token, $user]);
        } catch (Exception $e) {
            jsonResp(['status' => 'error', 'message' => 'DB error'], 500);
        }

        jsonResp([
            'status'   => 'success',
            'token'    => $token,
            'username' => $user,
            'expires'  => 86400
        ]);
    }

    jsonResp(['status' => 'error', 'message' => 'Username atau password salah'], 401);
}

// ============================================================
// PUBLIC: PRODUCTS
// ============================================================
function handleProducts() {
    try {
        $db = getDB();
        $stmt = $db->query('SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC');
        $products = $stmt->fetchAll();

        $result = [];
        foreach ($products as $p) {
            $items = json_decode($p['items'], true) ?: [];
            $result[] = [
                'id'       => $p['game_id'],
                'name'     => $p['game_name'],
                'sh'       => $p['game_short'],
                'col'      => $p['game_color'],
                'img'      => $p['image_url'],
                'unit'     => $p['game_unit'],
                'dc'       => $p['dc'],
                'zone'     => (bool)$p['zone_required'],
                'zname'    => $p['zone_name'],
                'zpre'     => (bool)$p['zone_precheck'],
                'zopts'    => $p['zone_options'] ? json_decode($p['zone_options'], true) : null,
                'pkgs'     => array_map(function($item) {
                    return [
                        'id' => $item['id'],
                        'q'  => $item['qty'],
                        'p'  => $item['price_sell'],
                        'b'  => $item['badge'] ?? null,
                    ];
                }, $items),
            ];
        }

        jsonResp(['status' => 'success', 'data' => $result]);
    } catch (Exception $e) {
        jsonResp(['status' => 'error', 'message' => 'Failed to load products'], 500);
    }
}

// ============================================================
// PUBLIC: PAYMENT CHANNELS (from Tripay)
// ============================================================
function handlePaymentChannels() {
    $url = TRIPAY_BASE . '/merchant/payment-channel';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . TRIPAY_API_KEY],
        CURLOPT_TIMEOUT        => 15,
    ]);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        // Return default channels on error
        jsonResp(['status' => 'success', 'data' => getDefaultChannels()]);
        return;
    }

    $data = json_decode($response, true);
    if (isset($data['data'])) {
        // Filter only active and relevant channels
        $channels = [];
        $allowed = ['QRIS','QRISC','BRIVA','BNIVA','MANDIRIVA','BCAVA','BSIVA','OVO','DANA','SHOPEEPAY'];
        foreach ($data['data'] as $ch) {
            if ($ch['active'] && in_array($ch['code'], $allowed)) {
                $channels[] = [
                    'code'     => $ch['code'],
                    'name'     => $ch['name'],
                    'group'    => $ch['group'],
                    'icon_url' => $ch['icon_url'] ?? '',
                    'fee_flat' => $ch['total_fee']['flat'] ?? 0,
                    'fee_pct'  => $ch['total_fee']['percent'] ?? 0,
                ];
            }
        }
        jsonResp(['status' => 'success', 'data' => $channels]);
    } else {
        jsonResp(['status' => 'success', 'data' => getDefaultChannels()]);
    }
}

function getDefaultChannels() {
    return [
        ['code'=>'QRIS',      'name'=>'QRIS (Semua E-Wallet)',   'group'=>'QRIS',           'icon_url'=>'','fee_flat'=>750,'fee_pct'=>0],
        ['code'=>'BRIVA',     'name'=>'BRI Virtual Account',     'group'=>'Virtual Account', 'icon_url'=>'','fee_flat'=>0,'fee_pct'=>0],
        ['code'=>'BNIVA',     'name'=>'BNI Virtual Account',     'group'=>'Virtual Account', 'icon_url'=>'','fee_flat'=>0,'fee_pct'=>0],
        ['code'=>'MANDIRIVA', 'name'=>'Mandiri Virtual Account', 'group'=>'Virtual Account', 'icon_url'=>'','fee_flat'=>0,'fee_pct'=>0],
        ['code'=>'BCAVA',     'name'=>'BCA Virtual Account',     'group'=>'Virtual Account', 'icon_url'=>'','fee_flat'=>0,'fee_pct'=>0],
        ['code'=>'OVO',       'name'=>'OVO',                     'group'=>'E-Wallet',        'icon_url'=>'','fee_flat'=>0,'fee_pct'=>0],
        ['code'=>'DANA',      'name'=>'DANA',                    'group'=>'E-Wallet',        'icon_url'=>'','fee_flat'=>0,'fee_pct'=>0],
        ['code'=>'SHOPEEPAY', 'name'=>'ShopeePay',               'group'=>'E-Wallet',        'icon_url'=>'','fee_flat'=>0,'fee_pct'=>0],
    ];
}

// ============================================================
// PUBLIC: CREATE ORDER
// ============================================================
function handleCreateOrder() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResp(['status' => 'error', 'message' => 'POST required'], 405);
    }

    $input = getInput();
    $gameId     = $input['game_id']         ?? '';
    $productId  = $input['product_id']      ?? '';
    $playerId   = $input['player_id']       ?? '';
    $zoneId     = $input['zone_id']         ?? '';
    $channel    = $input['payment_channel'] ?? '';
    $phone      = $input['phone']           ?? '';

    if (!$gameId || !$productId || !$playerId || !$channel) {
        jsonResp(['status' => 'error', 'message' => 'Data tidak lengkap'], 400);
    }

    // Get product from database
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM products WHERE game_id = ? AND is_active = 1');
    $stmt->execute([$gameId]);
    $product = $stmt->fetch();

    if (!$product) {
        jsonResp(['status' => 'error', 'message' => 'Produk tidak ditemukan'], 404);
    }

    $items = json_decode($product['items'], true);
    $selectedItem = null;
    foreach ($items as $item) {
        if ($item['id'] === $productId) {
            $selectedItem = $item;
            break;
        }
    }

    if (!$selectedItem) {
        jsonResp(['status' => 'error', 'message' => 'Nominal tidak ditemukan'], 404);
    }

    $orderId   = generateOrderId();
    $priceSell = $selectedItem['price_sell'];
    $priceBase = $selectedItem['price_base'] ?? 0;
    $profit    = $priceSell - $priceBase;

    // Create Tripay invoice
    $tripayResult = createTripayTransaction($orderId, $priceSell, $channel, [
        'game'    => $product['game_name'],
        'qty'     => $selectedItem['qty'],
        'unit'    => $product['game_unit'],
        'player'  => $playerId,
        'zone'    => $zoneId,
    ]);

    if (!$tripayResult || ($tripayResult['success'] ?? false) === false) {
        jsonResp([
            'status'  => 'error',
            'message' => 'Gagal membuat invoice pembayaran: ' . ($tripayResult['message'] ?? 'Unknown error')
        ], 500);
    }

    $tripayData = $tripayResult['data'] ?? [];

    // Save order to database
    $stmt = $db->prepare('INSERT INTO orders
        (order_id, game_id, game_name, game_short, game_color, product_id, qty, unit,
         player_id, zone_id, customer_phone, payment_method, price_base, price_sell,
         margin_pct, profit, status, tripay_reference, tripay_pay_url, tripay_pay_code, tripay_channel)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

    $marginPct = $product['margin_pct'] ?? getSetting('default_margin', DEFAULT_MARGIN);

    $stmt->execute([
        $orderId,
        $gameId,
        $product['game_name'],
        $product['game_short'],
        $product['game_color'],
        $productId,
        $selectedItem['qty'],
        $product['game_unit'],
        $playerId,
        $zoneId ?: null,
        $phone ?: null,
        $channel,
        $priceBase,
        $priceSell,
        $marginPct,
        $profit,
        'pending',
        $tripayData['reference'] ?? null,
        $tripayData['checkout_url'] ?? null,
        $tripayData['pay_code'] ?? ($tripayData['qr_url'] ?? null),
        $channel,
    ]);

    jsonResp([
        'status'   => 'success',
        'order_id' => $orderId,
        'data'     => [
            'order_id'     => $orderId,
            'amount'       => $priceSell,
            'channel'      => $channel,
            'pay_code'     => $tripayData['pay_code'] ?? null,
            'pay_url'      => $tripayData['pay_url'] ?? null,
            'checkout_url' => $tripayData['checkout_url'] ?? null,
            'qr_url'       => $tripayData['qr_url'] ?? null,
            'qr_string'    => $tripayData['qr_string'] ?? null,
            'expired_time' => $tripayData['expired_time'] ?? (time() + 3600),
            'instructions' => $tripayData['instructions'] ?? [],
            'reference'    => $tripayData['reference'] ?? null,
        ],
    ]);
}

// ============================================================
// TRIPAY: Create Closed Transaction
// ============================================================
function createTripayTransaction($orderId, $amount, $channel, $itemInfo) {
    $privateKey = TRIPAY_PRIVATE_KEY;
    $merchantCode = TRIPAY_MERCHANT;

    $signature = hash_hmac('sha256', $merchantCode . $orderId . $amount, $privateKey);

    $payload = [
        'method'         => $channel,
        'merchant_ref'   => $orderId,
        'amount'         => $amount,
        'customer_name'  => 'Player ' . $itemInfo['player'],
        'customer_email' => 'customer@flashtop.store',
        'customer_phone' => '081234567890',
        'order_items'    => [[
            'name'     => $itemInfo['qty'] . ' ' . $itemInfo['unit'] . ' ' . $itemInfo['game'],
            'price'    => $amount,
            'quantity' => 1,
        ]],
        'callback_url'   => CALLBACK_URL,
        'return_url'     => ($GLOBALS['protocol'] ?? 'https') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/index.html',
        'expired_time'   => time() + 3600, // 1 hour
        'signature'      => $signature,
    ];

    $url = TRIPAY_BASE . '/transaction/create';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . TRIPAY_API_KEY,
        ],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        return ['success' => false, 'message' => 'Tripay connection error: ' . $err];
    }

    return json_decode($response, true);
}

// ============================================================
// TRIPAY: Callback Handler
// ============================================================
function handleCallback() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data) {
        jsonResp(['status' => 'error', 'message' => 'Invalid callback data'], 400);
    }

    // Verify signature
    $signature = $_SERVER['HTTP_X_CALLBACK_SIGNATURE'] ?? '';
    $expectedSignature = hash_hmac('sha256', $raw, TRIPAY_PRIVATE_KEY);

    if ($signature !== $expectedSignature) {
        jsonResp(['status' => 'error', 'message' => 'Invalid signature'], 403);
    }

    $merchantRef = $data['merchant_ref'] ?? '';
    $tripayStatus = $data['status'] ?? '';

    if (!$merchantRef) {
        jsonResp(['status' => 'error', 'message' => 'Missing merchant ref'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM orders WHERE order_id = ?');
    $stmt->execute([$merchantRef]);
    $order = $stmt->fetch();

    if (!$order) {
        jsonResp(['status' => 'error', 'message' => 'Order not found'], 404);
    }

    // Map Tripay status
    if ($tripayStatus === 'PAID') {
        // Payment confirmed — process order
        $stmt = $db->prepare('UPDATE orders SET status = ?, paid_at = NOW(), tripay_reference = ? WHERE order_id = ?');
        $stmt->execute(['paid', $data['reference'] ?? $order['tripay_reference'], $merchantRef]);

        // Send WhatsApp notification — payment received
        if (getSetting('wa_notify_paid', '1') === '1' && $order['customer_phone']) {
            sendWhatsApp($order['customer_phone'],
                "✅ *Pembayaran Diterima!*\n\n" .
                "Order: *{$merchantRef}*\n" .
                "Game: {$order['game_name']}\n" .
                "Item: {$order['qty']} {$order['unit']}\n" .
                "Player ID: {$order['player_id']}" . ($order['zone_id'] ? " / {$order['zone_id']}" : "") . "\n\n" .
                "Sedang diproses, mohon tunggu 1-3 menit... ⏳"
            );
        }

        // Auto-process via Indoflazz
        processIndoflazzOrder($merchantRef);

    } elseif ($tripayStatus === 'EXPIRED' || $tripayStatus === 'FAILED') {
        $newStatus = $tripayStatus === 'EXPIRED' ? 'expired' : 'failed';
        $stmt = $db->prepare('UPDATE orders SET status = ? WHERE order_id = ? AND status IN ("pending")');
        $stmt->execute([$newStatus, $merchantRef]);
    }

    jsonResp(['success' => true]);
}

// ============================================================
// INDOFLAZZ: Process Order
// ============================================================
function processIndoflazzOrder($orderId) {
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM orders WHERE order_id = ?');
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();

    if (!$order) return;

    // Update status to processing
    $stmt = $db->prepare('UPDATE orders SET status = "processing" WHERE order_id = ?');
    $stmt->execute([$orderId]);

    // Call Indoflazz API
    $target = $order['player_id'];
    if ($order['zone_id']) {
        $target .= '|' . $order['zone_id'];
    }

    $params = [
        'api_key' => INDOFLAZZ_API_KEY,
        'service' => $order['product_id'],
        'target'  => $target,
    ];

    $ch = curl_init(INDOFLAZZ_BASE . 'order');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($params),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT      => STORE_NAME . '/2.0',
    ]);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        $db->prepare('UPDATE orders SET status = "failed", notes = ? WHERE order_id = ?')
           ->execute(['Indoflazz error: ' . $err, $orderId]);
        notifyOrderFailed($order);
        return;
    }

    $result = json_decode($response, true);
    $apiStatus = $result['status'] ?? 'error';
    $apiRef = $result['transaction']['id'] ?? null;

    if ($apiStatus === 'success' || $apiStatus === 'processing') {
        $newStatus = $apiStatus === 'success' ? 'success' : 'processing';
        $stmt = $db->prepare('UPDATE orders SET status = ?, indoflazz_ref = ?, indoflazz_status = ?, completed_at = IF(? = "success", NOW(), NULL) WHERE order_id = ?');
        $stmt->execute([$newStatus, $apiRef, $apiStatus, $newStatus, $orderId]);

        if ($newStatus === 'success') {
            notifyOrderSuccess($order);
        }
    } else {
        $msg = $result['message'] ?? 'Unknown error';
        $db->prepare('UPDATE orders SET status = "failed", notes = ?, indoflazz_status = "failed" WHERE order_id = ?')
           ->execute(['Indoflazz: ' . $msg, $orderId]);
        notifyOrderFailed($order);
    }
}

// ============================================================
// WHATSAPP NOTIFICATIONS (Fonnte)
// ============================================================
function sendWhatsApp($phone, $message) {
    if (!FONNTE_TOKEN || FONNTE_TOKEN === 'ISI_TOKEN_FONNTE') return false;

    $ch = curl_init('https://api.fonnte.com/send');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => [
            'target'  => $phone,
            'message' => $message,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: ' . FONNTE_TOKEN],
        CURLOPT_TIMEOUT        => 15,
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    return $response !== false;
}

function notifyOrderSuccess($order) {
    if (getSetting('wa_notify_success', '1') !== '1') return;
    if (!$order['customer_phone']) return;

    sendWhatsApp($order['customer_phone'],
        "🎮 *Top Up Berhasil!*\n\n" .
        "Order: *{$order['order_id']}*\n" .
        "Game: {$order['game_name']}\n" .
        "Item: {$order['qty']} {$order['unit']}\n" .
        "Player ID: {$order['player_id']}" . ($order['zone_id'] ? " / {$order['zone_id']}" : "") . "\n\n" .
        "{$order['qty']} {$order['unit']} sudah masuk ke akun kamu! ✅\n" .
        "Terima kasih sudah berbelanja di " . STORE_NAME . " 🙏"
    );

    // Mark as notified
    try {
        $db = getDB();
        $db->prepare('UPDATE orders SET wa_notified = 1 WHERE order_id = ?')
           ->execute([$order['order_id']]);
    } catch (Exception $e) {}
}

function notifyOrderFailed($order) {
    if (getSetting('wa_notify_failed', '1') !== '1') return;
    if (!$order['customer_phone']) return;

    $storeName = STORE_NAME;
    $storeWa = getSetting('store_wa', STORE_WA);

    sendWhatsApp($order['customer_phone'],
        "⚠️ *Top Up Gagal Diproses*\n\n" .
        "Order: *{$order['order_id']}*\n" .
        "Game: {$order['game_name']}\n" .
        "Item: {$order['qty']} {$order['unit']}\n\n" .
        "Mohon maaf, top up gagal diproses oleh sistem.\n" .
        "Tim kami akan segera menghubungi Anda.\n\n" .
        "Hubungi CS: wa.me/{$storeWa}"
    );
}

// ============================================================
// PUBLIC: TRACK ORDER
// ============================================================
function handleTrack() {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        jsonResp(['status' => 'error', 'message' => 'Order ID required'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT order_id, game_id, game_name, game_short, game_color, qty, unit, player_id, zone_id, payment_method, price_sell, status, created_at, paid_at, completed_at FROM orders WHERE order_id = ?');
    $stmt->execute([strtoupper($id)]);
    $order = $stmt->fetch();

    if (!$order) {
        jsonResp(['status' => 'error', 'message' => 'Order tidak ditemukan'], 404);
    }

    jsonResp(['status' => 'success', 'data' => $order]);
}

// ============================================================
// PUBLIC: CHECK PLAYER ID
// ============================================================
function handleCheckId() {
    $pid = $_GET['pid'] ?? '';
    $game = $_GET['game'] ?? '';

    if (!$pid) {
        jsonResp(['status' => 'error', 'message' => 'Player ID required'], 400);
    }

    // In production, this would call Indoflazz check API
    // For now, return a simulated success
    $names = ['LegendaryHero99','ShadowKnight07','XProGamer','NightWalker_','StarBreaker','DarkLord99','IronWolf77','GhostSniper'];
    $name = $names[array_rand($names)];

    jsonResp([
        'status'  => 'success',
        'data'    => ['name' => $name, 'player_id' => $pid]
    ]);
}

// ============================================================
// ADMIN: DASHBOARD
// ============================================================
function handleAdminDashboard() {
    $db = getDB();

    // Today stats
    $today = $db->query("SELECT
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status='success' THEN 1 ELSE 0 END), 0) as success_count,
        COALESCE(SUM(CASE WHEN status='success' THEN price_sell ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN status='success' THEN profit ELSE 0 END), 0) as profit
        FROM orders WHERE DATE(created_at) = CURDATE()")->fetch();

    // This week
    $week = $db->query("SELECT
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status='success' THEN price_sell ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN status='success' THEN profit ELSE 0 END), 0) as profit
        FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)")->fetch();

    // This month
    $month = $db->query("SELECT
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status='success' THEN price_sell ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN status='success' THEN profit ELSE 0 END), 0) as profit
        FROM orders WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())")->fetch();

    // All time
    $all = $db->query("SELECT
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status='success' THEN 1 ELSE 0 END), 0) as success_count,
        COALESCE(SUM(CASE WHEN status='success' THEN price_sell ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN status='success' THEN profit ELSE 0 END), 0) as profit
        FROM orders")->fetch();

    // By status
    $statuses = $db->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status")->fetchAll();

    // Top games
    $topGames = $db->query("SELECT game_name, COUNT(*) as count, SUM(CASE WHEN status='success' THEN price_sell ELSE 0 END) as revenue
        FROM orders GROUP BY game_name ORDER BY count DESC LIMIT 5")->fetchAll();

    // Recent orders (last 10)
    $recent = $db->query("SELECT order_id, game_name, game_short, game_color, qty, unit, player_id, price_sell, status, created_at
        FROM orders ORDER BY created_at DESC LIMIT 10")->fetchAll();

    // Daily revenue last 7 days
    $dailyRevenue = $db->query("SELECT DATE(created_at) as date,
        COALESCE(SUM(CASE WHEN status='success' THEN price_sell ELSE 0 END), 0) as revenue,
        COUNT(*) as orders
        FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at) ORDER BY date ASC")->fetchAll();

    // Pending count (needs attention)
    $pendingCount = $db->query("SELECT COUNT(*) as count FROM orders WHERE status IN ('pending','paid','processing')")->fetch();

    jsonResp([
        'status' => 'success',
        'data'   => [
            'today'         => $today,
            'week'          => $week,
            'month'         => $month,
            'all_time'      => $all,
            'statuses'      => $statuses,
            'top_games'     => $topGames,
            'recent_orders' => $recent,
            'daily_revenue' => $dailyRevenue,
            'pending_count' => $pendingCount['count'] ?? 0,
        ]
    ]);
}

// ============================================================
// ADMIN: ORDERS LIST
// ============================================================
function handleAdminOrders() {
    $db = getDB();
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 20;
    $offset = ($page - 1) * $limit;

    $where = '1=1';
    $params = [];

    if ($status) {
        $where .= ' AND status = ?';
        $params[] = $status;
    }

    if ($search) {
        $where .= ' AND (order_id LIKE ? OR player_id LIKE ? OR game_name LIKE ?)';
        $s = "%{$search}%";
        $params = array_merge($params, [$s, $s, $s]);
    }

    // Count
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE {$where}");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];

    // Data
    $params[] = $limit;
    $params[] = $offset;
    $stmt = $db->prepare("SELECT * FROM orders WHERE {$where} ORDER BY created_at DESC LIMIT ? OFFSET ?");
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    jsonResp([
        'status' => 'success',
        'data'   => $orders,
        'total'  => $total,
        'page'   => $page,
        'pages'  => ceil($total / $limit),
    ]);
}

// ============================================================
// ADMIN: ORDER DETAIL
// ============================================================
function handleAdminOrderDetail() {
    $id = $_GET['id'] ?? '';
    if (!$id) jsonResp(['status' => 'error', 'message' => 'ID required'], 400);

    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM orders WHERE order_id = ?');
    $stmt->execute([$id]);
    $order = $stmt->fetch();

    if (!$order) jsonResp(['status' => 'error', 'message' => 'Not found'], 404);

    jsonResp(['status' => 'success', 'data' => $order]);
}

// ============================================================
// ADMIN: UPDATE ORDER
// ============================================================
function handleAdminUpdateOrder() {
    $input = getInput();
    $orderId = $input['order_id'] ?? '';
    $newStatus = $input['status'] ?? '';
    $notes = $input['notes'] ?? '';

    if (!$orderId || !$newStatus) {
        jsonResp(['status' => 'error', 'message' => 'Missing data'], 400);
    }

    $db = getDB();
    $completedAt = in_array($newStatus, ['success','failed','refund']) ? 'NOW()' : 'NULL';

    $stmt = $db->prepare("UPDATE orders SET status = ?, notes = ?, completed_at = {$completedAt} WHERE order_id = ?");
    $stmt->execute([$newStatus, $notes, $orderId]);

    // If marked success, send notification
    if ($newStatus === 'success') {
        $stmt = $db->prepare('SELECT * FROM orders WHERE order_id = ?');
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        if ($order) notifyOrderSuccess($order);
    }

    jsonResp(['status' => 'success', 'message' => 'Order updated']);
}

// ============================================================
// ADMIN: PRODUCTS
// ============================================================
function handleAdminProducts() {
    $db = getDB();
    $stmt = $db->query('SELECT * FROM products ORDER BY sort_order ASC');
    jsonResp(['status' => 'success', 'data' => $stmt->fetchAll()]);
}

function handleAdminSaveProduct() {
    $input = getInput();
    $db = getDB();

    $gameId = $input['game_id'] ?? '';
    if (!$gameId) jsonResp(['status' => 'error', 'message' => 'game_id required'], 400);

    $stmt = $db->prepare('UPDATE products SET
        game_name = ?, game_short = ?, game_color = ?, game_unit = ?, image_url = ?,
        items = ?, margin_pct = ?, zone_required = ?, zone_name = ?,
        zone_options = ?, is_active = ?, sort_order = ?, updated_at = NOW()
        WHERE game_id = ?');

    $stmt->execute([
        $input['game_name']     ?? '',
        $input['game_short']    ?? '',
        $input['game_color']    ?? '#3B82F6',
        $input['game_unit']     ?? '',
        $input['image_url']     ?? '',
        $input['items']         ?? '[]',
        $input['margin_pct']    ?? null,
        $input['zone_required'] ?? 0,
        $input['zone_name']     ?? null,
        $input['zone_options']  ?? null,
        $input['is_active']     ?? 1,
        $input['sort_order']    ?? 0,
        $gameId,
    ]);

    jsonResp(['status' => 'success', 'message' => 'Product saved']);
}

function handleAdminToggleProduct() {
    $input = getInput();
    $gameId = $input['game_id'] ?? '';
    $active = $input['is_active'] ?? 1;

    if (!$gameId) jsonResp(['status' => 'error', 'message' => 'game_id required'], 400);

    $db = getDB();
    $stmt = $db->prepare('UPDATE products SET is_active = ? WHERE game_id = ?');
    $stmt->execute([$active, $gameId]);

    jsonResp(['status' => 'success', 'message' => 'Product updated']);
}

// ============================================================
// ADMIN: SETTINGS
// ============================================================
function handleAdminSettings() {
    $db = getDB();
    $stmt = $db->query('SELECT `key`, `value` FROM settings');
    $settings = [];
    while ($row = $stmt->fetch()) {
        $settings[$row['key']] = $row['value'];
    }
    jsonResp(['status' => 'success', 'data' => $settings]);
}

function handleAdminSaveSettings() {
    $input = getInput();
    $allowed = ['store_name','store_wa','default_margin','tripay_sandbox',
                'wa_notify_paid','wa_notify_success','wa_notify_failed'];

    foreach ($input as $key => $value) {
        if (in_array($key, $allowed)) {
            setSetting($key, $value);
        }
    }

    jsonResp(['status' => 'success', 'message' => 'Settings saved']);
}

// ============================================================
// ADMIN: REFRESH PRICES FROM INDOFLAZZ
// ============================================================
function handleAdminRefreshPrices() {
    $ch = curl_init(INDOFLAZZ_BASE . 'service');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query(['api_key' => INDOFLAZZ_API_KEY]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT      => STORE_NAME . '/2.0',
    ]);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        jsonResp(['status' => 'error', 'message' => 'Gagal menghubungi Indoflazz: ' . $err], 500);
    }

    $data = json_decode($response, true);
    if (($data['status'] ?? '') !== 'success') {
        jsonResp(['status' => 'error', 'message' => 'Response Indoflazz tidak valid'], 500);
    }

    // Cache prices
    $db = getDB();
    $defaultMargin = (float)getSetting('default_margin', DEFAULT_MARGIN);
    $stmt = $db->prepare('INSERT INTO price_cache (product_code, price, product_name, fetched_at)
        VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE price = ?, product_name = ?, fetched_at = NOW()');

    $updated = 0;
    foreach (($data['data'] ?? []) as $item) {
        $code = $item['code'] ?? $item['id'] ?? '';
        $price = $item['price'] ?? 0;
        $name = $item['name'] ?? '';

        if ($code && $price > 0) {
            $stmt->execute([$code, $price, $name, $price, $name]);
            $updated++;
        }
    }

    // Auto-update product prices with margin
    $products = $db->query('SELECT * FROM products')->fetchAll();
    $priceUpdateCount = 0;

    foreach ($products as $prod) {
        $items = json_decode($prod['items'], true) ?: [];
        $margin = $prod['margin_pct'] ?? $defaultMargin;
        $changed = false;

        foreach ($items as &$item) {
            $cacheStmt = $db->prepare('SELECT price FROM price_cache WHERE product_code = ?');
            $cacheStmt->execute([$item['id']]);
            $cached = $cacheStmt->fetch();

            if ($cached) {
                $basePrice = $cached['price'];
                $sellPrice = (int)ceil($basePrice * (1 + $margin / 100));
                // Round to nearest 500
                $sellPrice = (int)(ceil($sellPrice / 500) * 500);

                $item['price_base'] = $basePrice;
                $item['price_sell'] = $sellPrice;
                $changed = true;
                $priceUpdateCount++;
            }
        }

        if ($changed) {
            $updStmt = $db->prepare('UPDATE products SET items = ?, updated_at = NOW() WHERE game_id = ?');
            $updStmt->execute([json_encode($items, JSON_UNESCAPED_UNICODE), $prod['game_id']]);
        }
    }

    jsonResp([
        'status'  => 'success',
        'message' => "Berhasil update {$updated} harga dari Indoflazz, {$priceUpdateCount} produk diperbarui",
        'cached'  => $updated,
        'updated' => $priceUpdateCount,
    ]);
}
