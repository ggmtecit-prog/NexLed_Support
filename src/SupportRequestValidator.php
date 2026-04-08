<?php

declare(strict_types=1);

final class SupportRequestValidator
{
    private const ALLOWED_LANGS = ['pt', 'en', 'es', 'fr'];

    /**
     * @param array<string, mixed> $input
     * @return array{data: array<string, string>, errors: array<string, string>}
     */
    public function validate(array $input): array
    {
        $data = [
            'full_name' => $this->sanitizeSingleLine($input['full_name'] ?? ''),
            'email' => $this->sanitizeEmail($input['email'] ?? ''),
            'subject' => $this->sanitizeSingleLine($input['subject'] ?? ''),
            'message' => $this->sanitizeMultiline($input['message'] ?? ''),
            'details' => $this->sanitizeMultiline($input['details'] ?? ''),
            'lang' => $this->sanitizeLanguage($input['lang'] ?? ''),
        ];

        $errors = [];

        $this->validateRequiredLength($data['full_name'], 120, 'full_name', $errors);
        $this->validateEmail($data['email'], 190, $errors);
        $this->validateRequiredLength($data['subject'], 160, 'subject', $errors);
        $this->validateRequiredLength($data['message'], 1000, 'message', $errors);

        if ($data['details'] !== '' && mb_strlen($data['details']) > 3000) {
            $errors['details'] = 'max_length';
        }

        if ($data['lang'] === '') {
            $data['lang'] = 'pt';
        }

        return [
            'data' => $data,
            'errors' => $errors,
        ];
    }

    /**
     * @param array<string, string> $errors
     */
    private function validateRequiredLength(string $value, int $maxLength, string $field, array &$errors): void
    {
        if ($value === '') {
            $errors[$field] = 'required';
            return;
        }

        if (mb_strlen($value) > $maxLength) {
            $errors[$field] = 'max_length';
        }
    }

    /**
     * @param array<string, string> $errors
     */
    private function validateEmail(string $value, int $maxLength, array &$errors): void
    {
        if ($value === '') {
            $errors['email'] = 'required';
            return;
        }

        if (mb_strlen($value) > $maxLength) {
            $errors['email'] = 'max_length';
            return;
        }

        if (filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'invalid_email';
        }
    }

    /**
     * @param mixed $value
     */
    private function sanitizeSingleLine($value): string
    {
        $normalized = trim((string) $value);
        $normalized = str_replace(["\r", "\n"], ' ', $normalized);
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return $normalized ?? '';
    }

    /**
     * @param mixed $value
     */
    private function sanitizeMultiline($value): string
    {
        $normalized = trim((string) $value);
        $normalized = str_replace(["\r\n", "\r"], "\n", $normalized);
        $normalized = preg_replace("/\n{3,}/", "\n\n", $normalized);

        return $normalized ?? '';
    }

    /**
     * @param mixed $value
     */
    private function sanitizeEmail($value): string
    {
        $email = trim((string) $value);
        $email = str_replace(["\r", "\n"], '', $email);

        return filter_var($email, FILTER_SANITIZE_EMAIL) ?: '';
    }

    /**
     * @param mixed $value
     */
    private function sanitizeLanguage($value): string
    {
        $lang = strtolower(trim((string) $value));

        return in_array($lang, self::ALLOWED_LANGS, true) ? $lang : '';
    }
}
