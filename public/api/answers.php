<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . "/private/lib/store.php";

header("X-Robots-Tag: noindex, nofollow");
header("Referrer-Policy: no-referrer");
header("Cache-Control: no-store");

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "GET") {
    aiv_json(405, ["ok" => false, "error" => "method"]);
}

$token = (string) ($_GET["token"] ?? "");
if ($token === "" || preg_match("/^[a-f0-9]{64}$/", $token) !== 1) {
    aiv_json(404, ["ok" => false, "error" => "invalid"]);
}

$site = aiv_site_by_token($token);
if ($site === null || !$site["paid"]) {
    aiv_json(404, ["ok" => false, "error" => "invalid"]);
}

aiv_json(200, [
    "ok" => true,
    "site" => [
        "couple" => $site["couple"],
        "weddingDate" => $site["wedding_date"],
        "inviteUrl" => $site["invite_url"],
        "deadline" => $site["rsvp_deadline"],
        "tier" => $site["tier"],
        "maxGuests" => $site["max_guests"],
    ],
    "responses" => aiv_responses($site["site_id"]),
]);
