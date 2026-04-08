<?php

declare(strict_types=1);

require __DIR__ . '/src/SupportRuntimeEnv.php';
require __DIR__ . '/src/SupportRequestValidator.php';
require __DIR__ . '/src/SupportEmailService.php';

SupportRuntimeEnv::load(__DIR__ . '/.env');

/**
 * @param array<string, mixed> $payload
 */
function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * @param mixed $value
 */
function normalizeString($value): string
{
    return trim((string) $value);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(405, [
        'ok' => false,
        'type' => 'delivery',
        'message_code' => 'submit_failed',
    ]);
}

$honeypot = normalizeString($_POST['company'] ?? '');
if ($honeypot !== '') {
    error_log('[SupportContact] Honeypot triggered for support contact form.');
    respond(200, [
        'ok' => true,
        'message_code' => 'submitted',
    ]);
}

$validator = new SupportRequestValidator();
$validation = $validator->validate($_POST);

if ($validation['errors'] !== []) {
    respond(422, [
        'ok' => false,
        'type' => 'validation',
        'summary_code' => 'validation_summary',
        'errors' => $validation['errors'],
    ]);
}

$submittedAt = (int) normalizeString($_POST['submitted_at'] ?? '');
$nowMilliseconds = (int) round(microtime(true) * 1000);
$minimumSubmitMilliseconds = 1500;

if ($submittedAt > 0 && ($nowMilliseconds - $submittedAt) < $minimumSubmitMilliseconds) {
    error_log('[SupportContact] Minimum submit time triggered for support contact form.');
    respond(200, [
        'ok' => true,
        'message_code' => 'submitted',
    ]);
}

$mailConfig = require __DIR__ . '/config/mail.php';
$service = new SupportEmailService($mailConfig);
$payload = $validation['data'];

try {
    $service->sendSupportRequest($payload, [
        'source' => 'contact.html',
        'submitted_at' => gmdate('c'),
        'ip' => normalizeString($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
        'user_agent' => normalizeString($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'),
    ]);
} catch (\Throwable $exception) {
    error_log('[SupportContact] Delivery failed: ' . $exception->getMessage());
    respond(500, [
        'ok' => false,
        'type' => 'delivery',
        'message_code' => 'submit_failed',
    ]);
}

respond(200, [
    'ok' => true,
    'message_code' => 'submitted',
]);
