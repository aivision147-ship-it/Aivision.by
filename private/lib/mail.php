<?php
declare(strict_types=1);

require_once __DIR__ . "/store.php";
require_once __DIR__ . "/PHPMailer/Exception.php";
require_once __DIR__ . "/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/PHPMailer/SMTP.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

function aiv_mail(string $to, string $subject, string $html, string $text): bool
{
    $smtp = aiv_config()["smtp"] ?? [];
    $host = (string) ($smtp["host"] ?? "");
    if ($host === "" || $host === "log") {
        $dir = aiv_private() . "/logs";
        if (!is_dir($dir)) {
            mkdir($dir, 0750, true);
        }
        $block = "----\nTO: {$to}\nSUBJECT: {$subject}\n\n{$text}\n";
        file_put_contents($dir . "/mail.log", $block, FILE_APPEND | LOCK_EX);
        return true;
    }
    try {
        $mail = new PHPMailer(true);
        $mail->CharSet = "UTF-8";
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = (int) ($smtp["port"] ?? 465);
        $secure = (string) ($smtp["secure"] ?? "ssl");
        $mail->SMTPSecure = $secure === "tls" ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
        $mail->SMTPAuth = true;
        $mail->Username = (string) ($smtp["user"] ?? "");
        $mail->Password = (string) ($smtp["pass"] ?? "");
        $mail->setFrom((string) ($smtp["from"] ?? $mail->Username), (string) ($smtp["from_name"] ?? "AIVISION STUDIO"));
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $html;
        $mail->AltBody = $text;
        $mail->send();
        return true;
    } catch (MailException $error) {
        aiv_log("smtp {$to} " . $error->getMessage());
        return false;
    } catch (Throwable $error) {
        aiv_log("smtp {$to} " . $error->getMessage());
        return false;
    }
}

function aiv_answers_url(string $token): string
{
    return aiv_origin() . "/answers?token=" . rawurlencode($token);
}

function aiv_telegram_url(string $siteId): string
{
    $name = trim((string) (aiv_config()["telegram_bot_username"] ?? ""), "@");
    if ($name === "") {
        return "";
    }
    return "https://t.me/" . rawurlencode($name) . "?start=" . rawurlencode($siteId);
}

function aiv_notify_response(array $site, array $response): void
{
    $answers = aiv_answers_url((string) $site["token"]);
    $drinks = implode(", ", $response["drinks"] ?? []);
    $coming = ($response["attending"] ?? "") === "yes" ? "придёт" : "не придёт";
    $lines = [
        "Новый ответ на приглашение",
        "Пара: " . $site["couple"],
        "Гость: " . $response["name"],
        "Ответ: " . $coming,
        "Гостей: " . (string) $response["guests"],
        "Еда: " . ($response["food"] !== "" ? $response["food"] : "—"),
        "Аллергии: " . ($response["allergies"] !== "" ? $response["allergies"] : "—"),
        "Напитки: " . ($drinks !== "" ? $drinks : "—"),
        "Комментарий: " . ($response["comment"] !== "" ? $response["comment"] : "—"),
        "Страница ответов: " . $answers,
    ];
    $text = implode("\n", $lines);
    $subject = "Новый ответ на приглашение: " . $response["name"];
    $html = "<p>" . implode("</p><p>", array_map(fn ($line) => aiv_h($line), $lines)) . "</p>";
    $studio = (string) (aiv_config()["studio_email"] ?? "aivision147@gmail.com");
    $coupleMail = trim((string) ($site["email"] ?? ""));
    if ($coupleMail !== "" && filter_var($coupleMail, FILTER_VALIDATE_EMAIL)) {
        if (!aiv_mail($coupleMail, $subject, $html, $text)) {
            aiv_log("письмо паре не ушло, ответ сохранён, site=" . $site["site_id"]);
        }
    }
    if ($studio !== "" && $studio !== $coupleMail) {
        if (!aiv_mail($studio, $subject, $html, $text)) {
            aiv_log("копия студии не ушла, ответ сохранён, site=" . $site["site_id"]);
        }
    }
    aiv_telegram_notify($site, $text);
}

function aiv_telegram_notify(array $site, string $text): void
{
    $chat = trim((string) ($site["telegram_chat_id"] ?? ""));
    $token = trim((string) (aiv_config()["telegram_bot_token"] ?? ""));
    if ($chat === "" || $token === "") {
        return;
    }
    $url = "https://api.telegram.org/bot" . $token . "/sendMessage";
    $payload = json_encode(["chat_id" => $chat, "text" => $text], JSON_UNESCAPED_UNICODE);
    $ch = curl_init($url);
    if ($ch === false) {
        aiv_log("telegram curl не стартовал, site=" . $site["site_id"]);
        return;
    }
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($body === false || $code >= 400) {
        aiv_log("telegram {$code} site=" . $site["site_id"]);
    }
}

function aiv_unsubscribe_url(string $token): string
{
    return aiv_origin() . "/api/unsubscribe.php?token=" . rawurlencode($token);
}

function aiv_mail_marketing(array $site, string $subject, string $text): bool
{
    if (empty($site["marketing_consent"]) || trim((string) ($site["email"] ?? "")) === "") {
        return false;
    }
    $link = aiv_unsubscribe_url((string) $site["token"]);
    $text .= "\n\nОтписаться: " . $link;
    $html = "<p>" . aiv_h($text) . "</p><p><a href=\"" . aiv_h($link) . "\">Отписаться</a></p>";
    return aiv_mail((string) $site["email"], $subject, $html, $text);
}

function aiv_mail_welcome(array $site): bool
{
    $answers = aiv_answers_url((string) $site["token"]);
    $telegram = aiv_telegram_url((string) $site["site_id"]);
    $lines = [
        "Ваш сайт-приглашение AIVISION STUDIO готов принимать ответы гостей.",
        "Приглашение: " . ($site["invite_url"] !== "" ? $site["invite_url"] : "ссылку пришлём отдельно"),
        "Ответы гостей: " . $answers,
        "Эту ссылку никому не пересылайте, кроме себя.",
    ];
    if ($telegram !== "") {
        $lines[] = "Telegram о новых ответах: откройте один раз " . $telegram;
    }
    $lines[] = "В опубликованное приглашение уже вписаны siteId " . $site["site_id"] . " и приём ответов https://aivision.by/api/rsvp.php.";
    $text = implode("\n", $lines);
    $html = "<p>" . implode("</p><p>", array_map(fn ($line) => aiv_h($line), $lines)) . "</p>";
    $to = trim((string) $site["email"]);
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    return aiv_mail($to, "Ответы гостей — " . $site["couple"], $html, $text);
}
