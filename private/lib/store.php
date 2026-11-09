<?php
declare(strict_types=1);

require_once __DIR__ . "/bootstrap.php";

function aiv_backend(): string
{
    static $backend;
    if ($backend !== null) {
        return $backend;
    }
    $choice = (string) (aiv_config()["store"] ?? "auto");
    if ($choice === "json") {
        return $backend = "json";
    }
    if ($choice === "sqlite" || $choice === "auto") {
        if (extension_loaded("pdo_sqlite")) {
            return $backend = "sqlite";
        }
        if ($choice === "sqlite") {
            aiv_log("pdo_sqlite нет, пишем JSON");
        }
        return $backend = "json";
    }
    return $backend = "json";
}

function aiv_data_dir(): string
{
    $dir = aiv_private() . "/data";
    if (!is_dir($dir)) {
        mkdir($dir, 0750, true);
    }
    return $dir;
}

function aiv_db(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $pdo = new PDO("sqlite:" . aiv_data_dir() . "/rsvp.sqlite");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA journal_mode=WAL");
    $pdo->exec("CREATE TABLE IF NOT EXISTS sites (
        site_id TEXT PRIMARY KEY,
        slug TEXT NOT NULL DEFAULT '',
        couple TEXT NOT NULL DEFAULT '',
        partner1 TEXT NOT NULL DEFAULT '',
        partner2 TEXT NOT NULL DEFAULT '',
        wedding_date TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        telegram_chat_id TEXT NOT NULL DEFAULT '',
        token TEXT NOT NULL,
        tier TEXT NOT NULL DEFAULT 'middle',
        pay_status TEXT NOT NULL DEFAULT 'new',
        paid INTEGER NOT NULL DEFAULT 0,
        marketing_consent INTEGER NOT NULL DEFAULT 0,
        consent_at TEXT NOT NULL DEFAULT '',
        consent_text_version TEXT NOT NULL DEFAULT '',
        invite_url TEXT NOT NULL DEFAULT '',
        rsvp_deadline TEXT NOT NULL DEFAULT '',
        max_guests INTEGER NOT NULL DEFAULT 6,
        source TEXT NOT NULL DEFAULT '',
        note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT ''
    )");
    foreach ([
        "partner1 TEXT NOT NULL DEFAULT ''",
        "partner2 TEXT NOT NULL DEFAULT ''",
        "phone TEXT NOT NULL DEFAULT ''",
        "pay_status TEXT NOT NULL DEFAULT 'new'",
        "marketing_consent INTEGER NOT NULL DEFAULT 0",
        "consent_at TEXT NOT NULL DEFAULT ''",
        "consent_text_version TEXT NOT NULL DEFAULT ''",
        "source TEXT NOT NULL DEFAULT ''",
        "note TEXT NOT NULL DEFAULT ''",
        "updated_at TEXT NOT NULL DEFAULT ''",
    ] as $column) {
        try {
            $pdo->exec("ALTER TABLE sites ADD COLUMN {$column}");
        } catch (Throwable) {
        }
    }
    $pdo->exec("CREATE TABLE IF NOT EXISTS responses (
        site_id TEXT NOT NULL,
        guest_key TEXT NOT NULL,
        name TEXT NOT NULL,
        attending TEXT NOT NULL,
        guests INTEGER NOT NULL,
        food TEXT NOT NULL DEFAULT '',
        allergies TEXT NOT NULL DEFAULT '',
        drinks TEXT NOT NULL DEFAULT '[]',
        comment TEXT NOT NULL DEFAULT '',
        couple TEXT NOT NULL DEFAULT '',
        submitted_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (site_id, guest_key)
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS rate (
        ip TEXT PRIMARY KEY,
        window_start INTEGER NOT NULL,
        hits INTEGER NOT NULL
    )");
    return $pdo;
}

function aiv_json_path(): string
{
    return aiv_data_dir() . "/store.json";
}

/** @param callable(array):mixed $fn */
function aiv_json_tx(callable $fn): mixed
{
    $lockPath = aiv_data_dir() . "/store.lock";
    $handle = fopen($lockPath, "c");
    if ($handle === false) {
        throw new RuntimeException("Не открыть lock");
    }
    flock($handle, LOCK_EX);
    $path = aiv_json_path();
    $raw = is_file($path) ? file_get_contents($path) : "";
    $data = json_decode($raw === false || $raw === "" ? "{}" : $raw, true);
    if (!is_array($data)) {
        $data = [];
    }
    $data += ["sites" => [], "responses" => [], "rate" => []];
    $result = $fn($data);
    file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE), LOCK_EX);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $result;
}

function aiv_consent_version(): string
{
    return "2026-11-09";
}

function aiv_site_row(array $row): array
{
    $partner1 = trim((string) ($row["partner1"] ?? ""));
    $partner2 = trim((string) ($row["partner2"] ?? ""));
    $couple = trim((string) ($row["couple"] ?? ""));
    if ($couple === "") {
        $couple = trim($partner1 . ($partner2 !== "" ? " и " . $partner2 : ""));
    }
    if ($partner1 === "" && $couple !== "") {
        $parts = preg_split("/\\s+и\\s+/u", $couple, 2) ?: [$couple];
        $partner1 = trim((string) $parts[0]);
        $partner2 = trim((string) ($parts[1] ?? $partner2));
    }
    $status = (string) ($row["pay_status"] ?? "");
    if (!in_array($status, ["new", "waiting", "paid", "cancelled"], true)) {
        $status = ((int) ($row["paid"] ?? 0) === 1) ? "paid" : "new";
    }
    $tier = (string) ($row["tier"] ?? "middle");
    if ($tier === "luxury") {
        $tier = "lux";
    }
    if (!in_array($tier, ["economy", "middle", "premium", "lux"], true)) {
        $tier = "middle";
    }
    return [
        "site_id" => (string) $row["site_id"],
        "slug" => (string) ($row["slug"] ?? ""),
        "couple" => $couple,
        "partner1" => $partner1,
        "partner2" => $partner2,
        "wedding_date" => (string) ($row["wedding_date"] ?? ""),
        "email" => (string) ($row["email"] ?? ""),
        "phone" => (string) ($row["phone"] ?? ""),
        "telegram_chat_id" => (string) ($row["telegram_chat_id"] ?? ""),
        "token" => (string) ($row["token"] ?? ""),
        "tier" => $tier,
        "pay_status" => $status,
        "paid" => $status === "paid",
        "marketing_consent" => (int) ($row["marketing_consent"] ?? 0) === 1,
        "consent_at" => (string) ($row["consent_at"] ?? ""),
        "consent_text_version" => (string) ($row["consent_text_version"] ?? ""),
        "invite_url" => (string) ($row["invite_url"] ?? ""),
        "rsvp_deadline" => (string) ($row["rsvp_deadline"] ?? ""),
        "max_guests" => max(1, (int) ($row["max_guests"] ?? 6)),
        "source" => (string) ($row["source"] ?? ""),
        "note" => (string) ($row["note"] ?? ""),
        "created_at" => (string) ($row["created_at"] ?? ""),
        "updated_at" => (string) ($row["updated_at"] ?? ""),
    ];
}

function aiv_site(string $siteId): ?array
{
    if (aiv_backend() === "sqlite") {
        $stmt = aiv_db()->prepare("SELECT * FROM sites WHERE site_id = :id");
        $stmt->execute([":id" => $siteId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return is_array($row) ? aiv_site_row($row) : null;
    }
    return aiv_json_tx(function (array $data) use ($siteId) {
        $row = $data["sites"][$siteId] ?? null;
        return is_array($row) ? aiv_site_row($row) : null;
    });
}

function aiv_site_by_token(string $token): ?array
{
    if ($token === "") {
        return null;
    }
    if (aiv_backend() === "sqlite") {
        $stmt = aiv_db()->prepare("SELECT * FROM sites");
        $stmt->execute();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            if (is_string($row["token"] ?? null) && strlen($row["token"]) === strlen($token) && hash_equals($row["token"], $token)) {
                return aiv_site_row($row);
            }
        }
        return null;
    }
    return aiv_json_tx(function (array $data) use ($token) {
        foreach ($data["sites"] as $row) {
            if (is_array($row) && is_string($row["token"] ?? null) && strlen($row["token"]) === strlen($token) && hash_equals($row["token"], $token)) {
                return aiv_site_row($row);
            }
        }
        return null;
    });
}

function aiv_save_site(array $site): void
{
    $site = aiv_site_row(array_merge($site, [
        "pay_status" => $site["pay_status"] ?? (!empty($site["paid"]) ? "paid" : "new"),
        "marketing_consent" => !empty($site["marketing_consent"]) ? 1 : 0,
    ]));
    $site["paid"] = $site["paid"] ? 1 : 0;
    $site["marketing_consent"] = $site["marketing_consent"] ? 1 : 0;
    $site["updated_at"] = gmdate("c");
    if (($site["created_at"] ?? "") === "") {
        $site["created_at"] = $site["updated_at"];
    }
    if (aiv_backend() === "sqlite") {
        $sql = "INSERT INTO sites (
            site_id, slug, couple, partner1, partner2, wedding_date, email, phone, telegram_chat_id, token, tier,
            pay_status, paid, marketing_consent, consent_at, consent_text_version, invite_url, rsvp_deadline,
            max_guests, source, note, created_at, updated_at
        ) VALUES (
            :site_id, :slug, :couple, :partner1, :partner2, :wedding_date, :email, :phone, :telegram_chat_id, :token, :tier,
            :pay_status, :paid, :marketing_consent, :consent_at, :consent_text_version, :invite_url, :rsvp_deadline,
            :max_guests, :source, :note, :created_at, :updated_at
        ) ON CONFLICT(site_id) DO UPDATE SET
            slug = excluded.slug,
            couple = excluded.couple,
            partner1 = excluded.partner1,
            partner2 = excluded.partner2,
            wedding_date = excluded.wedding_date,
            email = excluded.email,
            phone = excluded.phone,
            telegram_chat_id = excluded.telegram_chat_id,
            token = excluded.token,
            tier = excluded.tier,
            pay_status = excluded.pay_status,
            paid = excluded.paid,
            marketing_consent = excluded.marketing_consent,
            consent_at = excluded.consent_at,
            consent_text_version = excluded.consent_text_version,
            invite_url = excluded.invite_url,
            rsvp_deadline = excluded.rsvp_deadline,
            max_guests = excluded.max_guests,
            source = excluded.source,
            note = excluded.note,
            updated_at = excluded.updated_at";
        $stmt = aiv_db()->prepare($sql);
        $params = [];
        foreach ([
            "site_id", "slug", "couple", "partner1", "partner2", "wedding_date", "email", "phone", "telegram_chat_id",
            "token", "tier", "pay_status", "paid", "marketing_consent", "consent_at", "consent_text_version",
            "invite_url", "rsvp_deadline", "max_guests", "source", "note", "created_at", "updated_at",
        ] as $key) {
            $params[":" . $key] = $site[$key] ?? "";
        }
        $stmt->execute($params);
        return;
    }
    aiv_json_tx(function (array &$data) use ($site) {
        $id = $site["site_id"];
        $prev = is_array($data["sites"][$id] ?? null) ? $data["sites"][$id] : [];
        if (($prev["created_at"] ?? "") !== "") {
            $site["created_at"] = $prev["created_at"];
        }
        $data["sites"][$id] = array_merge($prev, $site);
        return null;
    });
}

function aiv_list_sites(): array
{
    if (aiv_backend() === "sqlite") {
        $rows = aiv_db()->query("SELECT * FROM sites ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
        return array_map("aiv_site_row", $rows);
    }
    return aiv_json_tx(function (array $data) {
        $rows = array_values($data["sites"]);
        usort($rows, fn ($a, $b) => strcmp((string) ($b["created_at"] ?? ""), (string) ($a["created_at"] ?? "")));
        return array_map(fn ($row) => aiv_site_row($row), $rows);
    });
}

function aiv_set_telegram(string $siteId, string $chatId): bool
{
    $site = aiv_site($siteId);
    if ($site === null) {
        return false;
    }
    $site["telegram_chat_id"] = $chatId;
    aiv_save_site($site);
    return true;
}

function aiv_slug(string $value): string
{
    $slug = strtolower(trim($value));
    $slug = preg_replace("/[^a-z0-9-]+/", "-", $slug) ?? "";
    return trim($slug, "-");
}

function aiv_create_order(array $input): array
{
    $partner1 = trim((string) ($input["partner1"] ?? ""));
    $partner2 = trim((string) ($input["partner2"] ?? ""));
    $slug = aiv_slug((string) ($input["slug"] ?? ""));
    if ($slug === "") {
        $slug = aiv_slug($partner1 . "-" . $partner2);
    }
    if ($slug === "") {
        $slug = "order";
    }
    $consent = !empty($input["marketing_consent"]);
    $version = (string) ($input["consent_text_version"] ?? "");
    if ($consent && !preg_match("/^\\d{4}-\\d{2}-\\d{2}$/", $version)) {
        $version = aiv_consent_version();
    }
    if (!$consent) {
        $version = "";
    }
    $now = gmdate("c");
    $site = [
        "site_id" => $slug . "-" . bin2hex(random_bytes(3)),
        "slug" => $slug,
        "partner1" => $partner1,
        "partner2" => $partner2,
        "couple" => trim($partner1 . ($partner2 !== "" ? " и " . $partner2 : "")),
        "wedding_date" => trim((string) ($input["wedding_date"] ?? "")),
        "email" => trim((string) ($input["email"] ?? "")),
        "phone" => trim((string) ($input["phone"] ?? "")),
        "telegram_chat_id" => "",
        "token" => bin2hex(random_bytes(32)),
        "tier" => (string) ($input["tier"] ?? "middle"),
        "pay_status" => "new",
        "paid" => 0,
        "marketing_consent" => $consent ? 1 : 0,
        "consent_at" => $consent ? $now : "",
        "consent_text_version" => $version,
        "invite_url" => trim((string) ($input["invite_url"] ?? "")),
        "rsvp_deadline" => "",
        "max_guests" => 6,
        "source" => trim((string) ($input["source"] ?? "")),
        "note" => trim((string) ($input["note"] ?? "")),
        "created_at" => $now,
    ];
    aiv_save_site($site);
    $saved = aiv_site($site["site_id"]);
    if ($saved === null) {
        throw new RuntimeException("Заказ не сохранился");
    }
    return $saved;
}

function aiv_clear_marketing(string $token): bool
{
    $site = aiv_site_by_token($token);
    if ($site === null) {
        return false;
    }
    $site["marketing_consent"] = 0;
    aiv_save_site($site);
    return true;
}

function aiv_rate_hit(string $ip): int
{
    $now = time();
    if (aiv_backend() === "sqlite") {
        $db = aiv_db();
        $db->beginTransaction();
        $stmt = $db->prepare("SELECT window_start, hits FROM rate WHERE ip = :ip");
        $stmt->execute([":ip" => $ip]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!is_array($row) || ($now - (int) $row["window_start"]) >= 60) {
            $hits = 1;
            $db->prepare("INSERT INTO rate (ip, window_start, hits) VALUES (:ip, :start, 1)
                ON CONFLICT(ip) DO UPDATE SET window_start = excluded.window_start, hits = 1")
                ->execute([":ip" => $ip, ":start" => $now]);
        } else {
            $hits = (int) $row["hits"] + 1;
            $db->prepare("UPDATE rate SET hits = :hits WHERE ip = :ip")->execute([":hits" => $hits, ":ip" => $ip]);
        }
        $db->commit();
        return $hits;
    }
    return (int) aiv_json_tx(function (array &$data) use ($ip, $now) {
        $row = $data["rate"][$ip] ?? null;
        if (!is_array($row) || ($now - (int) ($row["window_start"] ?? 0)) >= 60) {
            $data["rate"][$ip] = ["window_start" => $now, "hits" => 1];
            return 1;
        }
        $hits = (int) $row["hits"] + 1;
        $data["rate"][$ip]["hits"] = $hits;
        return $hits;
    });
}

function aiv_response_row(array $row): array
{
    $drinks = $row["drinks"] ?? [];
    if (is_string($drinks)) {
        $decoded = json_decode($drinks, true);
        $drinks = is_array($decoded) ? $decoded : [];
    }
    return [
        "name" => (string) ($row["name"] ?? ""),
        "attending" => (string) ($row["attending"] ?? ""),
        "guests" => (int) ($row["guests"] ?? 0),
        "food" => (string) ($row["food"] ?? ""),
        "allergies" => (string) ($row["allergies"] ?? ""),
        "drinks" => array_values(array_map("strval", $drinks)),
        "comment" => (string) ($row["comment"] ?? ""),
        "submittedAt" => (string) ($row["submitted_at"] ?? ""),
        "updatedAt" => (string) ($row["updated_at"] ?? ""),
    ];
}

function aiv_upsert_response(array $row): void
{
    $row["drinks"] = json_encode($row["drinks"] ?? [], JSON_UNESCAPED_UNICODE);
    if (aiv_backend() === "sqlite") {
        $sql = "INSERT INTO responses (site_id, guest_key, name, attending, guests, food, allergies, drinks, comment, couple, submitted_at, updated_at)
            VALUES (:site_id, :guest_key, :name, :attending, :guests, :food, :allergies, :drinks, :comment, :couple, :submitted_at, :updated_at)
            ON CONFLICT(site_id, guest_key) DO UPDATE SET
                name = excluded.name,
                attending = excluded.attending,
                guests = excluded.guests,
                food = excluded.food,
                allergies = excluded.allergies,
                drinks = excluded.drinks,
                comment = excluded.comment,
                couple = excluded.couple,
                updated_at = excluded.updated_at";
        aiv_db()->prepare($sql)->execute([
            ":site_id" => $row["site_id"],
            ":guest_key" => $row["guest_key"],
            ":name" => $row["name"],
            ":attending" => $row["attending"],
            ":guests" => $row["guests"],
            ":food" => $row["food"],
            ":allergies" => $row["allergies"],
            ":drinks" => $row["drinks"],
            ":comment" => $row["comment"],
            ":couple" => $row["couple"],
            ":submitted_at" => $row["submitted_at"],
            ":updated_at" => $row["updated_at"],
        ]);
        return;
    }
    aiv_json_tx(function (array &$data) use ($row) {
        $found = false;
        foreach ($data["responses"] as $index => $item) {
            if (($item["site_id"] ?? "") === $row["site_id"] && ($item["guest_key"] ?? "") === $row["guest_key"]) {
                $row["submitted_at"] = $item["submitted_at"] ?? $row["submitted_at"];
                $data["responses"][$index] = $row;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $data["responses"][] = $row;
        }
        return null;
    });
}

function aiv_responses(string $siteId): array
{
    if (aiv_backend() === "sqlite") {
        $stmt = aiv_db()->prepare("SELECT * FROM responses WHERE site_id = :id ORDER BY updated_at DESC");
        $stmt->execute([":id" => $siteId]);
        return array_map("aiv_response_row", $stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    return aiv_json_tx(function (array $data) use ($siteId) {
        $rows = array_values(array_filter($data["responses"], fn ($row) => ($row["site_id"] ?? "") === $siteId));
        usort($rows, fn ($a, $b) => strcmp((string) ($b["updated_at"] ?? ""), (string) ($a["updated_at"] ?? "")));
        return array_map("aiv_response_row", $rows);
    });
}
