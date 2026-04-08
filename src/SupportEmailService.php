<?php

declare(strict_types=1);

final class SupportEmailService
{
    /**
     * @var array<string, mixed>
     */
    private array $config;

    /**
     * @var array<string, array<string, string>>
     */
    private const CONFIRMATION_COPY = [
        'pt' => [
            'subject' => 'Recebemos o seu pedido de suporte',
            'greeting' => 'Ola %s,',
            'intro' => 'Recebemos o seu pedido de suporte e a nossa equipa vai analisar a informacao enviada.',
            'subject_label' => 'Assunto',
            'message_label' => 'Resumo',
            'reply' => 'Se precisar de acrescentar mais contexto, responda a este email.',
            'signature' => 'NexLed Support',
        ],
        'en' => [
            'subject' => 'We received your support request',
            'greeting' => 'Hello %s,',
            'intro' => 'We received your support request and our team will review the information you submitted.',
            'subject_label' => 'Subject',
            'message_label' => 'Summary',
            'reply' => 'If you need to add more context, reply to this email.',
            'signature' => 'NexLed Support',
        ],
        'es' => [
            'subject' => 'Hemos recibido su solicitud de soporte',
            'greeting' => 'Hola %s,',
            'intro' => 'Hemos recibido su solicitud de soporte y nuestro equipo revisara la informacion enviada.',
            'subject_label' => 'Asunto',
            'message_label' => 'Resumen',
            'reply' => 'Si necesita anadir mas contexto, responda a este correo electronico.',
            'signature' => 'NexLed Support',
        ],
        'fr' => [
            'subject' => 'Nous avons bien recu votre demande d assistance',
            'greeting' => 'Bonjour %s,',
            'intro' => 'Nous avons bien recu votre demande d assistance et notre equipe va examiner les informations transmises.',
            'subject_label' => 'Objet',
            'message_label' => 'Resume',
            'reply' => 'Si vous devez ajouter du contexte, repondez a cet e-mail.',
            'signature' => 'NexLed Support',
        ],
    ];

    /**
     * @param array<string, mixed> $config
     */
    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * @param array<string, string> $payload
     * @param array<string, string> $context
     */
    public function sendSupportRequest(array $payload, array $context = []): void
    {
        $this->assertConfigured();

        $internalMessage = $this->buildInternalMessage($payload, $context);
        $this->sendMessage($internalMessage);

        try {
            $confirmationMessage = $this->buildConfirmationMessage($payload);
            $this->sendMessage($confirmationMessage);
        } catch (\Throwable $exception) {
            error_log('[SupportContact] Confirmation email failed: ' . $exception->getMessage());
        }
    }

    private function assertConfigured(): void
    {
        $requiredKeys = [
            'host',
            'port',
            'from_email',
            'support_inbox_email',
        ];

        foreach ($requiredKeys as $key) {
            $value = $this->config[$key] ?? null;
            if ($value === null || $value === '' || $value === 0) {
                throw new \RuntimeException(sprintf('Missing mail configuration value: %s', $key));
            }
        }

        $encryption = (string) ($this->config['encryption'] ?? '');
        if ($encryption !== '' && !in_array($encryption, ['tls', 'ssl', 'none'], true)) {
            throw new \RuntimeException('Unsupported SMTP encryption mode.');
        }
    }

    /**
     * @param array<string, string> $payload
     * @param array<string, string> $context
     * @return array<string, string|null>
     */
    private function buildInternalMessage(array $payload, array $context): array
    {
        $subject = '[Support] ' . $this->sanitizeHeaderValue($payload['subject'] ?? 'Support request');
        $details = $payload['details'] !== '' ? $payload['details'] : 'Not provided.';
        $submittedAt = $context['submitted_at'] ?? gmdate('c');
        $source = $context['source'] ?? 'support-contact-form';
        $lang = $payload['lang'] ?? 'pt';

        $body = implode("\n", [
            'New support request received.',
            '',
            'Name: ' . ($payload['full_name'] ?? ''),
            'Email: ' . ($payload['email'] ?? ''),
            'Language: ' . $lang,
            'Subject: ' . ($payload['subject'] ?? ''),
            'Short message:',
            $payload['message'] ?? '',
            '',
            'Additional details:',
            $details,
            '',
            'Source: ' . $source,
            'Submitted at: ' . $submittedAt,
            'IP: ' . ($context['ip'] ?? 'unknown'),
            'User Agent: ' . ($context['user_agent'] ?? 'unknown'),
        ]);

        return [
            'to_email' => $this->sanitizeEmailAddress((string) ($this->config['support_inbox_email'] ?? '')),
            'to_name' => $this->sanitizeHeaderValue((string) ($this->config['support_inbox_name'] ?? '')),
            'subject' => $subject,
            'body' => $body,
            'reply_to' => $this->sanitizeEmailAddress($payload['email'] ?? ''),
        ];
    }

    /**
     * @param array<string, string> $payload
     * @return array<string, string|null>
     */
    private function buildConfirmationMessage(array $payload): array
    {
        $lang = $payload['lang'] ?? 'pt';
        $copy = self::CONFIRMATION_COPY[$lang] ?? self::CONFIRMATION_COPY['en'];
        $name = $payload['full_name'] !== '' ? $payload['full_name'] : 'there';

        $body = implode("\n", [
            sprintf($copy['greeting'], $name),
            '',
            $copy['intro'],
            '',
            $copy['subject_label'] . ': ' . ($payload['subject'] ?? ''),
            $copy['message_label'] . ': ' . ($payload['message'] ?? ''),
            '',
            $copy['reply'],
            '',
            $copy['signature'],
        ]);

        return [
            'to_email' => $this->sanitizeEmailAddress($payload['email'] ?? ''),
            'to_name' => $this->sanitizeHeaderValue($payload['full_name'] ?? ''),
            'subject' => $copy['subject'],
            'body' => $body,
            'reply_to' => $this->sanitizeEmailAddress((string) ($this->config['support_inbox_email'] ?? '')),
        ];
    }

    /**
     * @param array<string, string|null> $message
     */
    private function sendMessage(array $message): void
    {
        $socket = $this->connect();

        try {
            $this->command($socket, 'EHLO ' . $this->getEhloName(), [250]);

            $encryption = (string) ($this->config['encryption'] ?? 'tls');
            if ($encryption === 'tls') {
                $this->command($socket, 'STARTTLS', [220]);
                $cryptoEnabled = @stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                if ($cryptoEnabled !== true) {
                    throw new \RuntimeException('Unable to enable TLS encryption for SMTP connection.');
                }

                $this->command($socket, 'EHLO ' . $this->getEhloName(), [250]);
            }

            $username = trim((string) ($this->config['username'] ?? ''));
            $password = (string) ($this->config['password'] ?? '');
            if ($username !== '') {
                $this->command($socket, 'AUTH LOGIN', [334]);
                $this->command($socket, base64_encode($username), [334]);
                $this->command($socket, base64_encode($password), [235]);
            }

            $fromEmail = $this->sanitizeEmailAddress((string) ($this->config['from_email'] ?? ''));
            $this->command($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
            $this->command($socket, 'RCPT TO:<' . ($message['to_email'] ?? '') . '>', [250, 251]);
            $this->command($socket, 'DATA', [354]);
            $this->writeData($socket, $this->buildMimeMessage($message));
            $this->assertResponse($socket, [250]);
        } finally {
            try {
                $this->command($socket, 'QUIT', [221]);
            } catch (\Throwable $exception) {
            }

            fclose($socket);
        }
    }

    /**
     * @return resource
     */
    private function connect()
    {
        $host = (string) ($this->config['host'] ?? '');
        $port = (int) ($this->config['port'] ?? 587);
        $encryption = (string) ($this->config['encryption'] ?? 'tls');
        $transport = $encryption === 'ssl' ? 'ssl://' . $host : 'tcp://' . $host;

        $socket = @stream_socket_client(
            $transport . ':' . $port,
            $errorNumber,
            $errorMessage,
            15,
            STREAM_CLIENT_CONNECT
        );

        if (!is_resource($socket)) {
            throw new \RuntimeException(sprintf('Unable to connect to SMTP server: %s (%s)', (string) $errorMessage, (string) $errorNumber));
        }

        stream_set_timeout($socket, 15);
        $this->assertResponse($socket, [220]);

        return $socket;
    }

    /**
     * @param resource $socket
     * @param array<int, int> $expectedCodes
     */
    private function command($socket, string $command, array $expectedCodes): void
    {
        if (fwrite($socket, $command . "\r\n") === false) {
            throw new \RuntimeException('Unable to write SMTP command.');
        }

        $this->assertResponse($socket, $expectedCodes);
    }

    /**
     * @param resource $socket
     * @param array<int, int> $expectedCodes
     */
    private function assertResponse($socket, array $expectedCodes): void
    {
        $response = $this->readResponse($socket);
        $code = (int) substr($response, 0, 3);

        if (!in_array($code, $expectedCodes, true)) {
            throw new \RuntimeException('Unexpected SMTP response: ' . trim($response));
        }
    }

    /**
     * @param resource $socket
     */
    private function readResponse($socket): string
    {
        $response = '';

        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;

            if (preg_match('/^\d{3}\s/', $line) === 1) {
                break;
            }
        }

        if ($response === '') {
            throw new \RuntimeException('Empty SMTP response.');
        }

        return $response;
    }

    /**
     * @param resource $socket
     */
    private function writeData($socket, string $data): void
    {
        $lines = preg_split("/\r\n|\r|\n/", $data) ?: [];
        $escapedLines = array_map(static function (string $line): string {
            return str_starts_with($line, '.') ? '.' . $line : $line;
        }, $lines);

        $payload = implode("\r\n", $escapedLines) . "\r\n.\r\n";
        if (fwrite($socket, $payload) === false) {
            throw new \RuntimeException('Unable to write SMTP message body.');
        }
    }

    /**
     * @param array<string, string|null> $message
     */
    private function buildMimeMessage(array $message): string
    {
        $fromEmail = $this->sanitizeEmailAddress((string) ($this->config['from_email'] ?? ''));
        $fromName = $this->sanitizeHeaderValue((string) ($this->config['from_name'] ?? ''));
        $toEmail = $this->sanitizeEmailAddress((string) ($message['to_email'] ?? ''));
        $toName = $this->sanitizeHeaderValue((string) ($message['to_name'] ?? ''));
        $subject = $this->sanitizeHeaderValue((string) ($message['subject'] ?? ''));
        $replyTo = $message['reply_to'] ? $this->sanitizeEmailAddress((string) $message['reply_to']) : null;
        $body = (string) ($message['body'] ?? '');

        $headers = [
            'Date: ' . date(DATE_RFC2822),
            'From: ' . $this->formatAddress($fromEmail, $fromName),
            'To: ' . $this->formatAddress($toEmail, $toName),
            'Subject: ' . $this->encodeHeader($subject),
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
            'X-Mailer: NexLed Support Mailer',
        ];

        if ($replyTo !== null) {
            $headers[] = 'Reply-To: ' . $replyTo;
        }

        $encodedBody = rtrim(chunk_split(base64_encode($body), 76, "\r\n"));

        return implode("\r\n", $headers) . "\r\n\r\n" . $encodedBody;
    }

    private function formatAddress(string $email, string $name): string
    {
        if ($name === '') {
            return $email;
        }

        return $this->encodeHeader($name) . ' <' . $email . '>';
    }

    private function encodeHeader(string $value): string
    {
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }

    private function sanitizeHeaderValue(string $value): string
    {
        $clean = trim(str_replace(["\r", "\n"], ' ', $value));
        $clean = preg_replace('/\s+/', ' ', $clean);

        return $clean ?? '';
    }

    private function sanitizeEmailAddress(string $value): string
    {
        $email = filter_var(trim(str_replace(["\r", "\n"], '', $value)), FILTER_VALIDATE_EMAIL);
        if ($email === false) {
            throw new \RuntimeException('Invalid email address configured for SMTP delivery.');
        }

        return $email;
    }

    private function getEhloName(): string
    {
        $host = gethostname();

        return $host && $host !== '' ? $host : 'localhost';
    }
}
