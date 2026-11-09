<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . "/private/lib/store.php";

header("X-Robots-Tag: noindex, nofollow");
header("Referrer-Policy: no-referrer");
header("Content-Type: text/html; charset=utf-8");

$token = (string) ($_GET["token"] ?? "");
$ok = preg_match("/^[a-f0-9]{64}$/", $token) === 1 && aiv_clear_marketing($token);
if (!$ok) {
    http_response_code(404);
    echo "<!doctype html><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex, nofollow\"><title>Отписка</title><p>Ссылка недействительна</p>";
    exit;
}

echo "<!doctype html><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex, nofollow\"><title>Отписка</title><p>Рассылку остановили. Заказ и ответы гостей это не отменяет.</p>";
