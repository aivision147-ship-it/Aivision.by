<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false], JSON_UNESCAPED_UNICODE);
  exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw ?: "", true);
if (!is_array($data)) {
  $data = $_POST;
}

function clean(mixed $value, int $max): string
{
  $text = trim((string) ($value ?? ""));
  $text = str_replace(["\r", "\n", "%0a", "%0d"], " ", $text);
  if (mb_strlen($text) > $max) {
    $text = mb_substr($text, 0, $max);
  }
  return $text;
}

if (clean($data["company"] ?? "", 80) !== "") {
  echo json_encode(["ok" => true], JSON_UNESCAPED_UNICODE);
  exit;
}

$names = clean($data["names"] ?? "", 200);
$contact = clean($data["contact"] ?? "", 200);
if (mb_strlen($names) < 3 || mb_strlen($contact) < 3) {
  http_response_code(422);
  echo json_encode(["ok" => false], JSON_UNESCAPED_UNICODE);
  exit;
}

$lines = [
  "Заявка на сайт-приглашение",
  "Сайт: https://aivision.by/",
  "Пара: " . $names,
  "Дата: " . (clean($data["date"] ?? "", 40) ?: "ещё не выбрана"),
  "Город: " . (clean($data["city"] ?? "", 120) ?: "—"),
  "Формат: " . clean($data["tier"] ?? "", 40),
  "Связь: " . $contact,
];
$note = clean($data["note"] ?? "", 2000);
if ($note !== "") {
  $lines[] = "Пожелания: " . $note;
}

$to = "aivision147@gmail.com";
$from = "brief@aivision.by";
$subject = "=?UTF-8?B?" . base64_encode("Заявка с aivision.by: " . $names) . "?=";
$headers = [
  "MIME-Version: 1.0",
  "Content-Type: text/plain; charset=UTF-8",
  "From: VELA <{$from}>",
];
if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
  $headers[] = "Reply-To: {$contact}";
}

ini_set("sendmail_from", $from);
$ok = mail($to, $subject, implode("\n", $lines), implode("\r\n", $headers), "-f{$from}");

if (!$ok) {
  http_response_code(500);
  echo json_encode(["ok" => false], JSON_UNESCAPED_UNICODE);
  exit;
}

echo json_encode(["ok" => true], JSON_UNESCAPED_UNICODE);
