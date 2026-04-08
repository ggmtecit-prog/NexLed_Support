<?php

declare(strict_types=1);

final class SupportRuntimeEnv
{
    public static function load(string $path): void
    {
        if (!is_file($path) || !is_readable($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || str_starts_with($trimmed, '#')) {
                continue;
            }

            if (str_starts_with($trimmed, 'export ')) {
                $trimmed = trim(substr($trimmed, 7));
            }

            $separatorPosition = strpos($trimmed, '=');
            if ($separatorPosition === false) {
                continue;
            }

            $name = trim(substr($trimmed, 0, $separatorPosition));
            $value = trim(substr($trimmed, $separatorPosition + 1));

            if ($name === '' || !preg_match('/^[A-Z0-9_]+$/i', $name)) {
                continue;
            }

            if (getenv($name) !== false) {
                continue;
            }

            $normalizedValue = self::normalizeValue($value);
            putenv($name . '=' . $normalizedValue);
            $_ENV[$name] = $normalizedValue;
            $_SERVER[$name] = $normalizedValue;
        }
    }

    private static function normalizeValue(string $value): string
    {
        $length = strlen($value);
        if ($length >= 2) {
            $first = $value[0];
            $last = $value[$length - 1];

            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        return strtr($value, [
            '\n' => "\n",
            '\r' => "\r",
            '\t' => "\t",
            '\"' => '"',
            '\\\\' => '\\',
        ]);
    }
}
