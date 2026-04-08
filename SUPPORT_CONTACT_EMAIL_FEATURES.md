# Support Contact Email Features

## Purpose

This note explains how to turn the current NexLed-style contact form into a working email submission flow for the support project.

The goal is to keep the implementation:

- aligned with the current `contact.php` field structure
- consistent with the existing NexLed support tone
- simple enough to build in plain PHP
- compatible with the SMTP approach already used in this repo

## Current Store Reference

The current contact page already defines the right support fields, but it does not submit yet.

Relevant references in this repo:

- `contact.php`
- `content/en/contact.json`
- `src/OrderEmailService.php`
- `config/mail.php`

Current form fields already present:

- `full_name`
- `email`
- `subject`
- `message`
- `details`

Current limitations on the page:

- the form has no `method` or `action`
- the submit button is `type="button"`
- there is no backend handler yet
- the content copy says the live submission workflow is still being finalized

## Recommended Feature Scope

Implement the contact flow as two email actions:

1. Send the support request to the NexLed/internal support inbox.
2. Send a confirmation email back to the user who filled the form.

This gives the page a complete support loop without adding unnecessary complexity.

## Expected Form Contract

Use this payload shape on submit:

```php
[
    'full_name' => 'Jane Smith',
    'email' => 'jane@example.com',
    'subject' => 'Need help with a product setup',
    'message' => 'Short summary of the issue.',
    'details' => 'Longer context, references, deadlines, quantities, links.'
]
```

Validation rules:

- `full_name`: required, trimmed, max length around `120`
- `email`: required, valid email format, max length around `190`
- `subject`: required, trimmed, max length around `160`
- `message`: required, trimmed, max length around `1000`
- `details`: optional, trimmed, max length around `3000`

If validation fails, the page should:

- keep the submitted values in the form
- show field-level errors near the relevant inputs
- show one clear form-level error summary

## Recommended Backend Structure

Reuse the same architecture style already present in checkout.

Suggested files for the support project:

- `config/mail.php`
- `src/SupportEmailService.php`
- `src/SupportRequestValidator.php`
- `contact.php` or `contact-submit.php`

Recommended responsibility split:

- `contact.php`: render the page, accept `POST`, redisplay values/errors
- `SupportRequestValidator`: sanitize and validate the payload
- `SupportEmailService`: build and send both emails
- `config/mail.php`: keep SMTP and destination mailbox settings in one place

## Best Reuse Path From This Repo

This repo already has a working SMTP sender in `src/OrderEmailService.php`.

For the support project, the cleanest approach is:

- keep the SMTP transport pattern
- do not copy checkout-specific naming into the contact flow
- extract or duplicate only the SMTP mechanics you actually need
- create a dedicated `SupportEmailService` for contact messages

That service can follow the same steps already used by `OrderEmailService`:

- load SMTP config
- open the socket
- negotiate SSL/TLS
- authenticate if needed
- send the email
- handle failures and log them

If you want the smallest change set, you can duplicate the class and rename the order-specific parts. If you want the cleaner long-term structure, extract a small shared SMTP transport class and let both order and support emails use it.

## Mail Configuration

The support project should keep mail settings centralized.

Minimum config values:

- `host`
- `port`
- `username`
- `password`
- `encryption`
- `from_email`
- `from_name`
- `support_inbox_email`
- `support_inbox_name`
- `reply_to_user`

Recommended improvement over the current store setup:

- do not hardcode live credentials directly in source code for new work
- load them from environment variables when possible

Example config contract:

```php
[
    'host' => getenv('SUPPORT_SMTP_HOST') ?: '',
    'port' => (int) (getenv('SUPPORT_SMTP_PORT') ?: 587),
    'username' => getenv('SUPPORT_SMTP_USERNAME') ?: '',
    'password' => getenv('SUPPORT_SMTP_PASSWORD') ?: '',
    'encryption' => getenv('SUPPORT_SMTP_ENCRYPTION') ?: 'tls',
    'from_email' => getenv('SUPPORT_SMTP_FROM_EMAIL') ?: '',
    'from_name' => getenv('SUPPORT_SMTP_FROM_NAME') ?: 'NexLed Support',
    'support_inbox_email' => getenv('SUPPORT_INBOX_EMAIL') ?: '',
    'support_inbox_name' => getenv('SUPPORT_INBOX_NAME') ?: 'NexLed Support',
]
```

## Email Behavior

### Internal support email

This is the main operational email.

Recommended subject:

`[Support] {subject}`

Recommended content:

- customer name
- customer email
- submitted subject
- short message
- additional details
- page/source identifier
- submission timestamp

Recommended headers:

- `From`: NexLed support sender
- `To`: support inbox
- `Reply-To`: user email

Using `Reply-To` is important because it lets the support team answer the requester directly from their mailbox.

### Customer confirmation email

This is the reassurance email.

Recommended subject:

`We received your support request`

Recommended body tone:

- short
- professional
- clear
- no promise of unrealistic response times

Recommended content:

- confirmation that the request was received
- the submitted subject
- a short summary of the message
- the business contact channel for urgent follow-up

Suggested tone example:

```text
Hello Jane,

We received your support request and our team will review it.

Subject: Need help with a product setup

If you need to add more context, reply to this email.

NexLed Support
```

## Submission Flow

Recommended request flow:

1. User fills the form.
2. Server validates and sanitizes the payload.
3. Server builds the internal support email.
4. Server sends the internal support email first.
5. If step 4 succeeds, server sends the customer confirmation email.
6. Server logs the result.
7. Server returns a success message on the page.

Recommended failure rule:

- if the internal support email fails, treat the whole submission as failed
- if the internal email succeeds but the confirmation email fails, you can still mark the request as accepted and log the confirmation failure separately

That rule protects the main business outcome, which is getting the support request into the team inbox.

## Validation, Safety, and Anti-Spam

Minimum protections:

- trim all inputs
- reject empty required fields
- validate email with `filter_var(..., FILTER_VALIDATE_EMAIL)`
- strip CR/LF from any value used in headers
- escape output when redisplaying values in HTML

Recommended anti-spam additions:

- hidden honeypot field
- minimum submit time check
- basic rate limiting by session or IP

Do not:

- inject raw user input into headers
- trust the browser-only `required` attribute as real validation
- silently swallow SMTP failures

## Logging

Log contact email failures to a dedicated file, for example:

- `storage/logs/support-email.log`

Each log line should include:

- timestamp
- requester email
- subject
- failure message

Keep logs operational, not verbose.

## Suggested UI States For The Contact Page

Success state:

- short confirmation message
- no technical jargon
- keep it consistent with the calm support copy already used in `content/en/contact.json`

Failure state:

- explain that the request could not be sent right now
- keep the form values populated
- direct the user to the fallback contact channel already shown in the aside

Suggested success copy:

`Your request has been sent. Our team will review it and follow up using the email address you provided.`

Suggested failure copy:

`We could not send your request right now. Please try again in a moment or use the direct support contact shown on this page.`

## Practical Implementation Notes

To activate the current page pattern, the contact form will need these changes:

- add `method="post"` to the form
- either post back to `contact.php` or send to a dedicated handler
- change the CTA to `type="submit"`
- keep sanitized submitted values in PHP variables
- render validation and delivery status messages near the form

For a straightforward implementation, the contact page should behave much like checkout:

- collect posted values
- validate them
- call a service class
- handle success or failure
- render the page again with the right state

## Recommended Order Of Work

1. Add server-side validation and sticky form values.
2. Build `SupportEmailService` using the same SMTP pattern as `OrderEmailService`.
3. Send the internal support email.
4. Add the customer confirmation email.
5. Add logging.
6. Update the page copy to remove the note that says the submission flow is still being finalized.

## Final Recommendation

For this project, the best implementation is not a new mail library. The best implementation is a contact-specific mail service that reuses the existing SMTP approach already present in this repo, keeps the logic simple, and sends:

- one operational email to the support inbox
- one confirmation email to the requester

That gives you a complete support contact workflow with minimal architectural drift.
