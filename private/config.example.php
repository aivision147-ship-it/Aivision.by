<?php
/**
 * Скопируйте в private/config.php (рядом с public_html, не в вебе).
 * В репозиторий config.php не кладётся.
 */
return [
    "admin_password" => "смените-этот-пароль",
    "studio_email" => "aivision147@gmail.com",
    "public_origin" => "https://aivision.by",
    // true только на локальной проверке. На hosting.by оставьте false.
    "allow_dev_origins" => false,
    // auto | sqlite | json. json — если на хостинге нет pdo_sqlite.
    "store" => "auto",
    "smtp" => [
        // host = log пишет письмо в private/logs/mail.log и никуда не отправляет.
        "host" => "mail.hosting.by",
        "port" => 465,
        "secure" => "ssl",
        "user" => "noreply@aivision.by",
        "pass" => "",
        "from" => "noreply@aivision.by",
        "from_name" => "AIVISION STUDIO",
    ],
    "telegram_bot_token" => "",
    "telegram_bot_username" => "",
    "telegram_webhook_secret" => "",
];
