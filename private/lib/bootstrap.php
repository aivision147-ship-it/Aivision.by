<?php
declare(strict_types=1);

function aiv_private(): string
{
    return dirname(__DIR__);
}

function aiv_config(): array
{
    $file = aiv_private() . "/config.php";
    if (!is_file($file)) {
        throw new RuntimeException("Нет private/config.php");
    }
    $config = require $file;
    if (!is_array($config)) {
        throw new RuntimeException("config.php должен вернуть массив");
    }
    return $config;
}

function aiv_origin(): string
{
    $config = aiv_config();
    $origin = rtrim((string) ($config["public_origin"] ?? "https://aivision.by"), "/");
    return $origin !== "" ? $origin : "https://aivision.by";
}

function aiv_log(string $line): void
{
    $dir = aiv_private() . "/logs";
    if (!is_dir($dir)) {
        mkdir($dir, 0750, true);
    }
    file_put_contents($dir . "/notify.log", gmdate("c") . " " . $line . "\n", FILE_APPEND | LOCK_EX);
}

function aiv_h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}

function aiv_origin_allowed(string $origin): bool
{
    if ($origin === "https://aivision.by" || $origin === aiv_origin()) {
        return true;
    }
    if (preg_match("#^https://[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)*\\.aivision\\.by$#", $origin) === 1) {
        return true;
    }
    $config = aiv_config();
    if (!empty($config["allow_dev_origins"]) && preg_match("#^http://(127\\.0\\.0\\.1|localhost)(:\\d+)?$#", $origin) === 1) {
        return true;
    }
    return false;
}

function aiv_cors(string $methods = "POST, OPTIONS"): void
{
    $origin = (string) ($_SERVER["HTTP_ORIGIN"] ?? "");
    $allowed = $origin !== "" && aiv_origin_allowed($origin);
    if ($allowed) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Vary: Origin");
        header("Access-Control-Allow-Methods: " . $methods);
        header("Access-Control-Allow-Headers: Content-Type");
        header("Access-Control-Max-Age: 600");
    }
    if (($_SERVER["REQUEST_METHOD"] ?? "") === "OPTIONS") {
        http_response_code($allowed ? 204 : 403);
        exit;
    }
    if ($origin !== "" && !$allowed) {
        aiv_json(403, ["ok" => false, "error" => "forbidden"]);
    }
}

function aiv_json(int $status, array $body): never
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    header("X-Robots-Tag: noindex, nofollow");
    header("Cache-Control: no-store");
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    exit;
}

function aiv_read_json(): array
{
    $raw = file_get_contents("php://input");
    $data = json_decode($raw === false ? "" : $raw, true);
    return is_array($data) ? $data : [];
}

function aiv_client_ip(): string
{
    $ip = (string) ($_SERVER["REMOTE_ADDR"] ?? "");
    return $ip !== "" ? $ip : "0.0.0.0";
}
