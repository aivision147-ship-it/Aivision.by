<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . "/private/lib/store.php";

header("X-Robots-Tag: noindex, nofollow");
header("Referrer-Policy: no-referrer");

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST" && ($_SERVER["REQUEST_METHOD"] ?? "") !== "OPTIONS") {
    aiv_json(405, ["ok" => false, "error" => "method"]);
}

aiv_cors();

$data = aiv_read_json();
if ($data === []) {
    aiv_json(400, ["ok" => false, "error" => "json"]);
}

if (aiv_rate_hit("order:" . aiv_client_ip()) > 10) {
    aiv_json(429, ["ok" => false, "error" => "rate"]);
}

if (trim((string) ($data["website"] ?? "")) !== "") {
    aiv_json(200, ["ok" => true]);
}

$partner1 = trim((string) ($data["partner1"] ?? $data["name"] ?? ""));
$partner2 = trim((string) ($data["partner2"] ?? ""));
if ($partner2 === "" && preg_match("/^(.{2,80}?)\\s+и\\s+(.{2,80})$/u", $partner1, $parts) === 1) {
    $partner1 = trim($parts[1]);
    $partner2 = trim($parts[2]);
}
$email = trim((string) ($data["email"] ?? ""));
$phone = trim((string) ($data["phone"] ?? $data["contact"] ?? ""));
if ($partner1 === "" || mb_strlen($partner1) > 100 || mb_strlen($partner2) > 100 || mb_strlen($phone) > 80) {
    aiv_json(422, ["ok" => false, "error" => "fields"]);
}
if ($email !== "" && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    aiv_json(422, ["ok" => false, "error" => "email"]);
}
if (mb_strlen(trim((string) ($data["note"] ?? ""))) > 1000) {
    aiv_json(422, ["ok" => false, "error" => "fields"]);
}

$tier = (string) ($data["tier"] ?? "middle");
if ($tier === "luxury") {
    $tier = "lux";
}

$site = aiv_create_order([
    "partner1" => $partner1,
    "partner2" => $partner2,
    "email" => $email,
    "phone" => $phone,
    "wedding_date" => (string) ($data["weddingDate"] ?? $data["date"] ?? ""),
    "tier" => $tier,
    "slug" => (string) ($data["slug"] ?? ""),
    "source" => (string) ($data["source"] ?? ""),
    "note" => (string) ($data["note"] ?? ""),
    "marketing_consent" => !empty($data["marketing"]),
    "consent_text_version" => (string) ($data["consentTextVersion"] ?? ""),
    "invite_url" => (string) ($data["inviteUrl"] ?? ""),
]);

aiv_json(200, [
    "ok" => true,
    "siteId" => $site["site_id"],
    "payStatus" => $site["pay_status"],
    "marketing" => $site["marketing_consent"],
]);
