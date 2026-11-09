<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . "/private/lib/mail.php";

header("X-Robots-Tag: noindex, nofollow");

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    http_response_code(200);
    header("Content-Type: application/json; charset=utf-8");
    echo "{\"ok\":true}";
    exit;
}

$config = aiv_config();
$secret = (string) ($config["telegram_webhook_secret"] ?? "");
if ($secret !== "" && !hash_equals($secret, (string) ($_GET["secret"] ?? ""))) {
    http_response_code(403);
    exit;
}

$token = trim((string) ($config["telegram_bot_token"] ?? ""));
$update = aiv_read_json();
$text = trim((string) ($update["message"]["text"] ?? ""));
$chat = (string) ($update["message"]["chat"]["id"] ?? "");
if ($token === "" || $chat === "" || !str_starts_with($text, "/start")) {
    http_response_code(200);
    echo "{\"ok\":true}";
    exit;
}

$parts = preg_split("/\\s+/", $text) ?: [];
$siteId = (string) ($parts[1] ?? "");
$ok = $siteId !== "" && aiv_set_telegram($siteId, $chat);
$reply = $ok
    ? "Готово. Новые ответы гостей будут приходить в этот чат."
    : "Не узнали сайт. Откройте ссылку из письма студии ещё раз.";
$payload = json_encode(["chat_id" => $chat, "text" => $reply], JSON_UNESCAPED_UNICODE);
$ch = curl_init("https://api.telegram.org/bot" . $token . "/sendMessage");
if ($ch !== false) {
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

http_response_code(200);
header("Content-Type: application/json; charset=utf-8");
echo "{\"ok\":true}";
