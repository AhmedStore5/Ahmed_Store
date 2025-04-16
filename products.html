<?php
// --- بداية قسم الإعدادات - هام جداً ---
// !!! استبدل هذه القيم ببيانات حسابك الحقيقي من لوحة تحكم Paymob !!!
// !!! REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL PAYMOB CREDENTIALS !!!

define('ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBd05USTJNeXdpYm1GdFpTSTZJakUzTkRRNE5ESXdPVGt1T0RJNE5qQTJJbjAuNy1kcVRxT0pPemxyQjRLdFFDS3k5clJSanFtUDh3UDktelRhdVI5UHhYMUFPS2lDdGszS2RGNHpKMURTR3BURE9JNWxUZlFzeXNXNEF3dHhBR0ZBdWc=', 'ضع_هنا_مفتاح_ال_API_الخاص_بك_من_Paymob');         // <<< غير هذه القيمة
define('5056756', 123456); // <<< غير هذه القيمة بالـ Integration ID الخاص بالمحافظ
define('62587D289175DBABF09381F73AADC2C2', 'ضع_هنا_ال_HMAC_SECRET_الخاص_بك'); // <<< غير هذه القيمة (مهمة للـ Callbacks)

// عناوين API Paymob (استخدم acceptance للاختبار، أزلها للبيئة الحقيقية)
// Paymob API URLs (use "acceptance." for testing, remove it for live environment)
define('PAYMOB_BASE_URL', 'https://acceptance.paymob.com/api'); // <<< عدّل هذا للبيئة الحقيقية

define('PAYMOB_AUTH_URL', PAYMOB_BASE_URL . '/auth/tokens');
define('PAYMOB_ORDER_URL', PAYMOB_BASE_URL . '/ecommerce/orders');
define('PAYMOB_PAYMENT_KEY_URL', PAYMOB_BASE_URL . '/acceptance/payment_keys');
define('PAYMOB_WALLET_REDIRECT_URL', PAYMOB_BASE_URL . '/acceptance/wallet_pay?payment_token='); // رابط إعادة توجيه المحفظة

// إعدادات إضافية (اختياري)
define('ORDER_CURRENCY', 'EGP');
define('PAYMENT_KEY_EXPIRATION_SECONDS', 3600); // صلاحية مفتاح الدفع (ساعة)

// --- نهاية قسم الإعدادات ---


// --- بداية منطق المعالجة ---
error_reporting(E_ALL); // لعرض الأخطاء أثناء التطوير (يجب تعطيله في البيئة الحقيقية)
ini_set('display_errors', 1); // لعرض الأخطاء أثناء التطوير (يجب تعطيله في البيئة الحقيقية)

// التحقق من أن الطلب POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_redirect('الوصول غير مسموح.');
}

// --- استقبال وتحقق من البيانات ---
$amount_egp = filter_input(INPUT_POST, 'amount', FILTER_VALIDATE_FLOAT);
$phone_number = filter_input(INPUT_POST, 'vodafone_cash_number', FILTER_SANITIZE_STRING); // تنظيف مبدئي

// بيانات وهمية للعميل (يفضل الحصول عليها من نظامك أو الفورم)
$first_name = "FirstName"; // قيمة افتراضية
$last_name = "LastName";   // قيمة افتراضية
$email = "customer@example.com"; // قيمة افتراضية

// التحقق الدقيق من رقم الهاتف (11 رقم يبدأ بـ 010, 011, 012, 015)
if (!$phone_number || !preg_match('/^01[0125]\d{8}$/', $phone_number)) {
    error_redirect('رقم فودافون كاش غير صحيح. يجب أن يكون 11 رقماً ويبدأ بـ 010 أو 012 أو 015.');
}
// التحقق من المبلغ
if (!$amount_egp || $amount_egp <= 0) {
    error_redirect('المبلغ المدخل غير صحيح.');
}

// تحويل المبلغ إلى قروش (لأن Paymob تتعامل بالقروش)
$amount_cents = (int) round($amount_egp * 100);

// --- الخطوة 1: طلب المصادقة (Authentication) ---
try {
    $auth_payload = json_encode(['api_key' => PAYMOB_API_KEY]);
    $auth_response = send_paymob_request(PAYMOB_AUTH_URL, $auth_payload);

    if (!isset($auth_response['token'])) {
        throw new Exception('فشل الحصول على رمز المصادقة. تحقق من API Key.');
    }
    $auth_token = $auth_response['token'];

    // --- الخطوة 2: تسجيل الطلب (Order Registration) ---
    // يمكنك إنشاء رقم طلب فريد من نظامك هنا
    $merchant_order_id = 'WP-' . time() . '-' . rand(100, 999); // مثال لرقم طلب فريد

    $order_payload = json_encode([
        'auth_token' => $auth_token,
        'delivery_needed' => 'false',
        'amount_cents' => $amount_cents,
        'currency' => ORDER_CURRENCY,
        'merchant_order_id' => $merchant_order_id,
        // 'items' => [] // يمكن إضافة تفاصيل المنتجات هنا (راجع توثيق Paymob)
    ]);
    $order_response = send_paymob_request(PAYMOB_ORDER_URL, $order_payload);

    if (!isset($order_response['id'])) {
         // محاولة عرض رسالة الخطأ من Paymob إذا كانت متاحة
         $error_message = 'فشل تسجيل الطلب لدى Paymob.';
         if (isset($order_response['message'])) {
             $error_message .= ' السبب: ' . $order_response['message'];
         } elseif (isset($order_response['detail'])) {
             $error_message .= ' السبب: ' . $order_response['detail'];
         }
        throw new Exception($error_message);
    }
    $paymob_order_id = $order_response['id'];

    // --- الخطوة 3: طلب مفتاح الدفع (Payment Key Request) ---
    $payment_key_payload = json_encode([
        'auth_token' => $auth_token,
        'amount_cents' => $amount_cents,
        'expiration' => PAYMENT_KEY_EXPIRATION_SECONDS,
        'order_id' => $paymob_order_id,
        'billing_data' => [ // بيانات العميل - إلزامي
            'apartment' => 'NA', // أو '803'
            'email' => $email,
            'floor' => 'NA', // أو '42'
            'first_name' => $first_name,
            'street' => 'NA', // أو 'Ethan Hunt Fallout'
            'building' => 'NA', // أو '8028'
            'phone_number' => $phone_number, // رقم هاتف العميل/فودافون كاش
            'shipping_method' => 'NA',
            'postal_code' => 'NA', // أو '01890'
            'city' => 'NA', // أو 'Jaskolskiburgh'
            'country' => 'NA', // أو 'CR'
            'last_name' => $last_name,
            'state' => 'NA' // أو 'Utah'
        ],
        'currency' => ORDER_CURRENCY,
        'integration_id' => PAYMOB_WALLET_INTEGRATION_ID, // << مهم: معرف تكامل المحفظة
        'lock_order_when_paid' => 'false' // أو 'true' إذا أردت قفل الطلب بعد الدفع
    ]);
    $payment_key_response = send_paymob_request(PAYMOB_PAYMENT_KEY_URL, $payment_key_payload);

    if (!isset($payment_key_response['token'])) {
        // محاولة عرض رسالة الخطأ من Paymob إذا كانت متاحة
         $error_message = 'فشل الحصول على مفتاح الدفع.';
         if (isset($payment_key_response['message'])) {
             $error_message .= ' السبب: ' . $payment_key_response['message'];
         } elseif (isset($payment_key_response['detail'])) {
              $error_message .= ' السبب: ' . $payment_key_response['detail'];
          }
         throw new Exception($error_message);
    }
    $payment_token = $payment_key_response['token'];

    // --- الخطوة 4: إعادة توجيه المستخدم للدفع ---
    $redirect_url = PAYMOB_WALLET_REDIRECT_URL . $payment_token;
    header('Location: ' . $redirect_url);
    exit; // مهم جداً لإيقاف تنفيذ الكود بعد التوجيه

} catch (Exception $e) {
    // تسجيل الخطأ (يفضل استخدام نظام تسجيل احترافي)
    error_log('Paymob Error: ' . $e->getMessage());
    // توجيه المستخدم لصفحة الخطأ مع رسالة واضحة
    error_redirect('حدث خطأ أثناء محاولة بدء عملية الدفع. يرجى المحاولة مرة أخرى لاحقاً. التفاصيل: ' . $e->getMessage());
}

// --- نهاية منطق المعالجة ---


// --- الدوال المساعدة ---

/**
 * يرسل طلب HTTP POST إلى Paymob API باستخدام cURL.
 *
 * @param string $url عنوان الـ API المطلوب.
 * @param string $payload البيانات المرسلة بصيغة JSON string.
 * @param int $timeout مهلة الاتصال بالثواني.
 * @return array|null بيانات الرد من Paymob كـ array أو null عند حدوث خطأ في cURL.
 * @throws Exception إذا كان رد Paymob خطأ (HTTP status != 2xx) أو رد غير صالح.
 */
function send_paymob_request(string $url, string $payload, int $timeout = 30): ?array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($payload)
        ],
        CURLOPT_TIMEOUT => $timeout, // مهلة للاتصال
        CURLOPT_CONNECTTIMEOUT => $timeout / 2 // مهلة لمحاولة الاتصال
        // قد تحتاج للأسطر التالية في بيئات معينة (يفضل إصلاح إعدادات SSL للخادم بدلاً منها)
        // CURLOPT_SSL_VERIFYPEER => false,
        // CURLOPT_SSL_VERIFYHOST => false,
    ]);

    $response_body = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        error_log("Paymob cURL Error for ($url): " . $curl_error);
        throw new Exception('خطأ في الاتصال ببوابة الدفع. حاول لاحقاً.');
    }

    $decoded_response = json_decode($response_body, true);

    // التحقق من رمز حالة HTTP
    if ($http_code < 200 || $http_code >= 300) {
        $error_details = json_encode($decoded_response ?: $response_body);
        error_log("Paymob HTTP Error ($http_code) for ($url): " . $error_details);
        // محاولة تمرير رسالة الخطأ من Paymob إذا وجدت
        $paymob_message = $decoded_response['message'] ?? ($decoded_response['detail'] ?? 'فشل غير محدد من بوابة الدفع');
        throw new Exception("خطأ من بوابة الدفع (Code $http_code): " . $paymob_message);
    }

     // التحقق من أن الرد هو JSON صالح (إذا كان يتوقع أن يكون دائماً كذلك)
     if ($response_body && $decoded_response === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log("Paymob Invalid JSON response for ($url): " . json_last_error_msg() . " | Response: " . $response_body);
         throw new Exception('رد غير صالح من بوابة الدفع.');
     }


    return $decoded_response;
}

/**
 * يوجه المستخدم إلى صفحة index.html مع رسالة خطأ.
 *
 * @param string $message رسالة الخطأ المراد عرضها.
 */
function error_redirect(string $message): void
{
    // تأكد من عدم وجود أي مخرجات قبل الـ header
    if (headers_sent()) {
         // إذا تم إرسال الهيدر، حاول عرض الخطأ مباشرة (قد لا يعمل دائماً)
        echo "<script>alert('خطأ: " . addslashes($message) . "'); window.location.href='index.html';</script>";
    } else {
        header('Location: index.html?error=' . urlencode($message));
    }
    exit;
}

// --- نهاية الدوال المساعدة ---
?>
