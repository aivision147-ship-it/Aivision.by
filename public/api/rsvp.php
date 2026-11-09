<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . "/private/lib/mail.php";

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

if (aiv_rate_hit(aiv_client_ip()) > 10) {
    aiv_json(429, ["ok" => false, "error" => "rate"]);
}

$trap = trim((string) ($data["website"] ?? $data["company"] ?? ""));
if ($trap !== "") {
    aiv_json(200, ["ok" => true]);
}

$siteId = trim((string) ($data["site"] ?? $data["siteId"] ?? ""));
if ($siteId === "" || preg_match("/^[a-z0-9][a-z0-9-]{0,80}$/", $siteId) !== 1) {
    aiv_json(403, ["ok" => false, "error" => "forbidden"]);
}

$site = aiv_site($siteId);
if ($site === null || !$site["paid"]) {
    aiv_json(403, ["ok" => false, "error" => "forbidden"]);
}

$name = trim((string) ($data["name"] ?? ""));
$attending = (string) ($data["attending"] ?? "");
$food = trim((string) ($data["food"] ?? ""));
$allergies = trim((string) ($data["allergies"] ?? ""));
$comment = trim((string) ($data["comment"] ?? ""));
if ($name === "" || mb_strlen($name) > 100 || !in_array($attending, ["yes", "no"], true)) {
    aiv_json(422, ["ok" => false, "error" => "fields"]);
}
if (mb_strlen($comment) > 1000 || mb_strlen($food) > 300 || mb_strlen($allergies) > 300) {
    aiv_json(422, ["ok" => false, "error" => "fields"]);
}

$max = (int) $site["max_guests"];
if ($attending === "yes") {
    $guests = (int) ($data["guests"] ?? 0);
    if ($guests < 1 || $guests > $max) {
        aiv_json(422, ["ok" => false, "error" => "guests"]);
    }
} else {
    $guests = 0;
    $food = "";
    $allergies = "";
}

$drinks = [];
if ($attending === "yes" && isset($data["drinks"]) && is_array($data["drinks"])) {
    foreach ($data["drinks"] as $drink) {
        $drink = trim((string) $drink);
        if ($drink === "" || mb_strlen($drink) > 80) {
            continue;
        }
        $drinks[] = $drink;
        if (count($drinks) >= 12) {
            break;
        }
    }
}

$now = gmdate("c");
$guestKey = mb_strtolower(preg_replace("/\\s+/u", " ", $name) ?? $name);
aiv_upsert_response([
    "site_id" => $siteId,
    "guest_key" => $guestKey,
    "name" => $name,
    "attending" => $attending,
    "guests" => $guests,
    "food" => $food,
    "allergies" => $allergies,
    "drinks" => $drinks,
    "comment" => $comment,
    "couple" => trim((string) ($data["couple"] ?? "")),
    "submitted_at" => $now,
    "updated_at" => $now,
]);

$saved = [
    "name" => $name,
    "attending" => $attending,
    "guests" => $guests,
    "food" => $food,
    "allergies" => $allergies,
    "drinks" => $drinks,
    "comment" => $comment,
];
try {
    aiv_notify_response($site, $saved);
} catch (Throwable $error) {
    aiv_log("notify " . $siteId . " " . $error->getMessage());
}

aiv_json(200, ["ok" => true]);
