<?php

declare(strict_types=1);

return [
    'host' => trim((string) getenv('SUPPORT_SMTP_HOST')),
    'port' => (int) (getenv('SUPPORT_SMTP_PORT') ?: 587),
    'username' => trim((string) getenv('SUPPORT_SMTP_USERNAME')),
    'password' => (string) getenv('SUPPORT_SMTP_PASSWORD'),
    'encryption' => strtolower(trim((string) (getenv('SUPPORT_SMTP_ENCRYPTION') ?: 'tls'))),
    'from_email' => trim((string) getenv('SUPPORT_SMTP_FROM_EMAIL')),
    'from_name' => trim((string) (getenv('SUPPORT_SMTP_FROM_NAME') ?: 'NexLed Support')),
    'support_inbox_email' => trim((string) getenv('SUPPORT_INBOX_EMAIL')),
    'support_inbox_name' => trim((string) (getenv('SUPPORT_INBOX_NAME') ?: 'NexLed Support')),
];
