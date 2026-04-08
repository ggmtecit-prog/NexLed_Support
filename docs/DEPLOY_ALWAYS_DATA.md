# NexLed Support Alwaysdata Deploy

This project should be hosted on alwaysdata instead of GitHub Pages because `contact-submit.php` needs PHP plus server-side SMTP credentials.

## What Changed In This Repo

- Added `.github/workflows/deploy-alwaysdata.yml` for SSH plus `rsync` deploys.
- Added `.env.example` as the server-side mail configuration template.
- Added `.gitignore` so the real `.env` stays out of git.
- Added a lightweight `.env` loader for the contact endpoint.
- Added a root `.htaccess` rule to block direct access to `.env`.

## 1. Prepare alwaysdata

Create a new alwaysdata site or subdomain for NexLed Support and note the public directory that serves the site.

Recommended setup:

- use a dedicated subdomain such as `supportnexled.alwaysdata.net`
- point it to a dedicated target directory
- keep this app at the site root unless you need a shared subfolder install

## 2. Add The Server `.env`

Create a `.env` file in the project root on alwaysdata with real SMTP values:

```env
SUPPORT_SMTP_HOST=smtp.example.com
SUPPORT_SMTP_PORT=587
SUPPORT_SMTP_USERNAME=mailer@example.com
SUPPORT_SMTP_PASSWORD=replace-with-real-password
SUPPORT_SMTP_ENCRYPTION=tls
SUPPORT_SMTP_FROM_EMAIL=support@example.com
SUPPORT_SMTP_FROM_NAME=NexLed Support
SUPPORT_INBOX_EMAIL=support@example.com
SUPPORT_INBOX_NAME=NexLed Support
```

This file is loaded by `contact-submit.php` before the mail config is resolved.

## 3. Add GitHub Repository Secrets

Add these repository secrets:

- `ALWAYSDATA_HOST`
- `ALWAYSDATA_PORT`
- `ALWAYSDATA_USER`
- `ALWAYSDATA_SSH_KEY`
- `ALWAYSDATA_TARGET_DIR`

`ALWAYSDATA_TARGET_DIR` must be the exact alwaysdata directory served by the site.

## 4. Deploy

Push to `main` or run the `Deploy To alwaysdata` workflow manually.

The workflow:

- checks out the repo
- lints all PHP files
- writes the SSH deploy key
- trusts the alwaysdata host key
- ensures the remote target directory exists
- publishes the repo with `rsync`

The deploy excludes:

- `.git/`
- `.github/`
- `.env`
- `.env.example`
- `UI_SYSTEM/`
- `old/`
- `.codex-worktree-contact-panel-sticky/`
- `docs/`
- `*.md`

## 5. Validate The Live Site

Smoke test these URLs after deploy:

- `index.html`
- `repair.html`
- `downloads.html`
- `steps.html`
- `contact.html`

Then submit a real test request through the contact form and confirm:

- the request is accepted
- the support inbox receives the internal email
- the submitter receives the confirmation email

## 6. Retire GitHub Pages

Only disable GitHub Pages after alwaysdata is verified. Keep the old GitHub Pages site online until:

- page routing works
- data files load correctly
- the contact form works end to end
- the alwaysdata host is the URL you want to keep

After that, disable GitHub Pages in the repository settings and update any public links to the alwaysdata URL.

## Important Note About NexLed UI Assets

This repo still loads NexLed design-system assets from:

- `https://ggmtecit-prog.github.io/NexLed_UI_System/src/config-cdn.js?v=1.3`
- `https://ggmtecit-prog.github.io/NexLed_UI_System/src/nexled.css?v=1.3`
- `https://ggmtecit-prog.github.io/NexLed_UI_System/src/nexled.js?v=1.3`

That is separate from hosting NexLed Support itself on alwaysdata.

If you also want to remove the design-system dependency on GitHub Pages, the next step is to host those NexLed assets on alwaysdata or vendor them locally in this repo and then update all page `<head>` blocks.
