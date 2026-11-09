<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . "/private/lib/mail.php";

session_start([
    "cookie_httponly" => true,
    "cookie_samesite" => "Strict",
    "use_strict_mode" => true,
]);

header("X-Robots-Tag: noindex, nofollow");
header("Referrer-Policy: no-referrer");

$config = aiv_config();
$password = (string) ($config["admin_password"] ?? "");
if ($password === "" || $password === "смените-этот-пароль") {
    http_response_code(403);
    header("Content-Type: text/plain; charset=utf-8");
    echo "Админка закрыта: задайте admin_password в private/config.php.";
    exit;
}

if (empty($_SESSION["csrf"])) {
    $_SESSION["csrf"] = bin2hex(random_bytes(16));
}

if (($_POST["action"] ?? "") === "login") {
    if (hash_equals($password, (string) ($_POST["password"] ?? ""))) {
        $_SESSION["admin"] = true;
        session_regenerate_id(true);
    }
    header("Location: admin.php");
    exit;
}

if (empty($_SESSION["admin"])) {
    header("Content-Type: text/html; charset=utf-8");
    echo "<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex, nofollow\"><title>Клиенты</title></head><body>";
    echo "<form method=\"post\"><input type=\"hidden\" name=\"action\" value=\"login\"><label>Пароль<input type=\"password\" name=\"password\" required></label><button>Войти</button></form></body></html>";
    exit;
}

function aiv_admin_csrf(): void
{
    $sent = (string) ($_POST["csrf"] ?? "");
    $real = (string) ($_SESSION["csrf"] ?? "");
    if ($real === "" || $sent === "" || !hash_equals($real, $sent)) {
        http_response_code(400);
        exit("Сессия устарела. Обновите страницу.");
    }
}

function aiv_csv(array $rows): never
{
    header("Content-Type: text/csv; charset=utf-8");
    header("Content-Disposition: attachment; filename=\"clients.csv\"");
    echo "\xEF\xBB\xBF";
    $out = fopen("php://output", "wb");
    $header = ["site_id", "slug", "partner1", "partner2", "email", "phone", "wedding_date", "tier", "pay_status", "marketing_consent", "consent_at", "consent_text_version", "created_at"];
    fputcsv($out, $header, ";");
    foreach ($rows as $site) {
        fputcsv($out, [
            $site["site_id"], $site["slug"], $site["partner1"], $site["partner2"], $site["email"], $site["phone"],
            $site["wedding_date"], $site["tier"], $site["pay_status"], $site["marketing_consent"] ? "1" : "0",
            $site["consent_at"], $site["consent_text_version"], $site["created_at"],
        ], ";");
    }
    fclose($out);
    exit;
}

function aiv_filter_sites(array $sites, string $query, string $tier, string $status): array
{
    $query = mb_strtolower(trim($query));
    return array_values(array_filter($sites, function (array $site) use ($query, $tier, $status) {
        if ($tier !== "" && $site["tier"] !== $tier) {
            return false;
        }
        if ($status !== "" && $site["pay_status"] !== $status) {
            return false;
        }
        if ($query === "") {
            return true;
        }
        $hay = mb_strtolower(implode(" ", [$site["partner1"], $site["partner2"], $site["couple"], $site["email"], $site["phone"]]));
        return str_contains($hay, $query);
    }));
}

$export = (string) ($_GET["export"] ?? "");
if ($export === "all" || $export === "consent") {
    $rows = aiv_list_sites();
    if ($export === "consent") {
        $rows = array_values(array_filter($rows, fn ($site) => !empty($site["marketing_consent"])));
    }
    aiv_csv($rows);
}

$notice = "";
$error = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    aiv_admin_csrf();
    $action = (string) ($_POST["action"] ?? "");
    try {
        if ($action === "logout") {
            $_SESSION = [];
            session_destroy();
            header("Location: admin.php");
            exit;
        }
        $site = aiv_site((string) ($_POST["site_id"] ?? ""));
        if ($site === null) {
            throw new RuntimeException("Клиент не найден.");
        }
        if ($action === "save") {
            $status = (string) ($_POST["pay_status"] ?? $site["pay_status"]);
            if (!in_array($status, ["new", "waiting", "paid", "cancelled"], true)) {
                throw new RuntimeException("Неизвестный статус.");
            }
            $site["pay_status"] = $status;
            $site["paid"] = $status === "paid";
            $site["invite_url"] = trim((string) ($_POST["invite_url"] ?? $site["invite_url"]));
            $site["rsvp_deadline"] = trim((string) ($_POST["rsvp_deadline"] ?? ""));
            $site["max_guests"] = max(1, (int) ($_POST["max_guests"] ?? 6));
            $site["note"] = trim((string) ($_POST["note"] ?? ""));
            if ($status === "paid" && $site["token"] === "") {
                $site["token"] = bin2hex(random_bytes(32));
            }
            aiv_save_site($site);
            $notice = "Карточка сохранена.";
        } elseif ($action === "rotate") {
            if ($site["pay_status"] !== "paid") {
                throw new RuntimeException("Токен выдаётся после статуса «оплачен».");
            }
            $site["token"] = bin2hex(random_bytes(32));
            aiv_save_site($site);
            $notice = "Токен перевыпущен. Старые ссылки на ответы и отписку больше не работают.";
        } elseif ($action === "send") {
            if ($site["pay_status"] !== "paid") {
                throw new RuntimeException("Письмо со ссылками уходит после оплаты.");
            }
            if (!aiv_mail_welcome($site)) {
                throw new RuntimeException("Письмо не ушло. Смотрите private/logs.");
            }
            $notice = "Письмо отправлено на " . $site["email"];
        } elseif ($action === "news") {
            $text = trim((string) ($_POST["news"] ?? ""));
            if ($text === "") {
                throw new RuntimeException("Пустое письмо.");
            }
            if (!aiv_mail_marketing($site, "Новости AIVISION STUDIO", $text)) {
                throw new RuntimeException("Нет согласия на рассылку или почты.");
            }
            $notice = "Рекламное письмо отправлено, внизу есть отписка.";
        }
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
    }
}

$query = (string) ($_GET["q"] ?? "");
$tier = (string) ($_GET["tier"] ?? "");
$status = (string) ($_GET["status"] ?? "");
$open = (string) ($_GET["id"] ?? $_POST["site_id"] ?? "");
$csrf = aiv_h((string) $_SESSION["csrf"]);
$sites = aiv_filter_sites(aiv_list_sites(), $query, $tier, $status);

header("Content-Type: text/html; charset=utf-8");
echo "<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex, nofollow\"><meta name=\"referrer\" content=\"no-referrer\"><title>Клиенты</title>";
echo "<style>body{margin:0;background:#fffaf8;color:#2a2224;font:16px/1.45 Georgia,serif}main{max-width:980px;margin:0 auto;padding:28px 18px}h1{font-weight:400}label{display:block;margin:10px 0;font-size:14px}input,select,textarea{display:block;width:100%;max-width:460px;margin-top:4px;padding:8px;border:1px solid #eadcd8;background:#fff}button{min-height:38px;margin:4px 6px 4px 0;padding:0 12px;border:1px solid #a85d6c;background:#a85d6c;color:#fffaf8;cursor:pointer}button.ghost{background:#fffaf8;color:#2a2224}table{width:100%;border-collapse:collapse;font-size:14px}td,th{border-top:1px solid #eadcd8;padding:8px 6px;text-align:left;vertical-align:top}code{font-size:12px;word-break:break-all}.note{border:1px solid #eadcd8;padding:12px;background:#fff}</style></head><body><main>";
echo "<h1>Клиенты</h1>";
if ($notice !== "") {
    echo "<p class=\"note\">" . aiv_h($notice) . "</p>";
}
if ($error !== "") {
    echo "<p class=\"note\">" . aiv_h($error) . "</p>";
}
echo "<p><a href=\"admin.php?export=all\">CSV все</a> · <a href=\"admin.php?export=consent\">CSV только с согласием на рассылку</a></p>";
echo "<form method=\"get\"><label>Поиск<input name=\"q\" value=\"" . aiv_h($query) . "\" placeholder=\"имя, телефон, почта\"></label>";
echo "<label>Тариф<select name=\"tier\"><option value=\"\">все</option>";
foreach (["economy", "middle", "premium", "lux"] as $item) {
    echo "<option value=\"{$item}\"" . ($tier === $item ? " selected" : "") . ">{$item}</option>";
}
echo "</select></label><label>Оплата<select name=\"status\"><option value=\"\">все</option>";
foreach (["new", "waiting", "paid", "cancelled"] as $item) {
    echo "<option value=\"{$item}\"" . ($status === $item ? " selected" : "") . ">{$item}</option>";
}
echo "</select></label><button class=\"ghost\">Найти</button></form>";
echo "<table><tr><th>Пара</th><th>Контакт</th><th>Тариф</th><th>Оплата</th><th>Рассылка</th></tr>";
foreach ($sites as $site) {
    $id = aiv_h($site["site_id"]);
    echo "<tr><td><a href=\"admin.php?id={$id}\">" . aiv_h(trim($site["partner1"] . " " . $site["partner2"])) . "</a><br><code>{$id}</code></td>";
    echo "<td>" . aiv_h($site["email"]) . "<br>" . aiv_h($site["phone"]) . "</td><td>" . aiv_h($site["tier"]) . "</td><td>" . aiv_h($site["pay_status"]) . "</td><td>" . ($site["marketing_consent"] ? "да" : "нет") . "</td></tr>";
}
echo "</table>";

$card = $open !== "" ? aiv_site($open) : null;
if ($card !== null) {
    $id = aiv_h($card["site_id"]);
    echo "<h2>Карточка</h2><p>" . aiv_h($card["partner1"]) . " и " . aiv_h($card["partner2"]) . "</p>";
    echo "<p>Почта " . aiv_h($card["email"]) . "<br>Телефон " . aiv_h($card["phone"]) . "<br>Дата " . aiv_h($card["wedding_date"]) . "<br>Источник " . aiv_h($card["source"]) . "</p>";
    echo "<p>Согласие на рассылку: " . ($card["marketing_consent"] ? "да" : "нет");
    if ($card["consent_at"] !== "") {
        echo ", " . aiv_h($card["consent_at"]) . ", текст " . aiv_h($card["consent_text_version"]);
    }
    echo "</p>";
    if ($card["pay_status"] === "paid") {
        echo "<p>siteId<br><code>{$id}</code><br>endpoint<br><code>https://aivision.by/api/rsvp.php</code><br>ответы<br><code>" . aiv_h(aiv_answers_url($card["token"])) . "</code>";
        $tg = aiv_telegram_url($card["site_id"]);
        if ($tg !== "") {
            echo "<br>Telegram<br><code>" . aiv_h($tg) . "</code>";
        }
        echo "<br>отписка<br><code>" . aiv_h(aiv_unsubscribe_url($card["token"])) . "</code></p>";
    } else {
        echo "<p>siteId и токен ответов показываются после статуса «paid».</p>";
    }
    echo "<form method=\"post\"><input type=\"hidden\" name=\"csrf\" value=\"{$csrf}\"><input type=\"hidden\" name=\"site_id\" value=\"{$id}\"><input type=\"hidden\" name=\"action\" value=\"save\">";
    echo "<label>Статус оплаты<select name=\"pay_status\">";
    foreach (["new" => "new", "waiting" => "waiting", "paid" => "paid", "cancelled" => "cancelled"] as $value => $label) {
        echo "<option value=\"{$value}\"" . ($card["pay_status"] === $value ? " selected" : "") . ">{$label}</option>";
    }
    echo "</select></label>";
    echo "<label>Ссылка на приглашение<input name=\"invite_url\" value=\"" . aiv_h($card["invite_url"]) . "\"></label>";
    echo "<label>Ответить до<input name=\"rsvp_deadline\" value=\"" . aiv_h($card["rsvp_deadline"]) . "\"></label>";
    echo "<label>Гостей в одном ответе<input name=\"max_guests\" type=\"number\" min=\"1\" max=\"20\" value=\"" . (int) $card["max_guests"] . "\"></label>";
    echo "<label>Заметка<textarea name=\"note\">" . aiv_h($card["note"]) . "</textarea></label>";
    echo "<button>Сохранить</button></form>";
    if ($card["pay_status"] === "paid") {
        echo "<form method=\"post\"><input type=\"hidden\" name=\"csrf\" value=\"{$csrf}\"><input type=\"hidden\" name=\"site_id\" value=\"{$id}\"><input type=\"hidden\" name=\"action\" value=\"rotate\"><button class=\"ghost\">Новый токен</button></form>";
        echo "<form method=\"post\"><input type=\"hidden\" name=\"csrf\" value=\"{$csrf}\"><input type=\"hidden\" name=\"site_id\" value=\"{$id}\"><input type=\"hidden\" name=\"action\" value=\"send\"><button class=\"ghost\">Письмо со ссылками</button></form>";
    }
    echo "<form method=\"post\"><input type=\"hidden\" name=\"csrf\" value=\"{$csrf}\"><input type=\"hidden\" name=\"site_id\" value=\"{$id}\"><input type=\"hidden\" name=\"action\" value=\"news\"><label>Рекламное письмо, только если есть согласие<textarea name=\"news\"></textarea></label><button class=\"ghost\">Отправить</button></form>";
}
echo "<form method=\"post\"><input type=\"hidden\" name=\"csrf\" value=\"{$csrf}\"><input type=\"hidden\" name=\"action\" value=\"logout\"><button class=\"ghost\">Выйти</button></form>";
echo "</main></body></html>";
