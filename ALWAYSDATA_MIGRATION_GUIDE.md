# alwaysdata Migration Guide

This document explains how this project was moved from a local or GitHub Pages style setup into a live `alwaysdata.net` deployment, and how to repeat the same process for another project.

It is written as both:

- a record of how the current NexLed EPREL Tools deployment works
- a reusable checklist for moving a different project from GitHub Pages to alwaysdata

Example live host used in this project:

`https://eprelnexled.alwaysdata.net/formgen.html`

## What changed when moving away from GitHub Pages

GitHub Pages is a static host. It is good for HTML, CSS, JS, and static assets, but it does not run PHP, does not keep server sessions, and does not let the app write generated files to disk.

This project needed more than static hosting because it uses:

- PHP routes in `api/index.php`
- Composer autoloading from `vendor/`
- `.env` secrets and runtime config
- session storage for the EPREL compliance flow
- writable folders under `downloads/` for labels, fiches, XML, ZIPs, logs, and attachments

That is why GitHub Pages was no longer enough for this app.

## What the live alwaysdata setup looks like

The live server hosts the full repository, not only the frontend pages.

Key parts of the deployment:

- frontend pages such as `index.html`, `search.html`, `folders.html`, and `formgen.html`
- JavaScript in `js/`
- PHP API entrypoint in `api/index.php`
- Apache rewrite rule in `api/.htaccess`
- Composer dependencies in `vendor/`
- server-only `.env`
- writable runtime folders in `downloads/`

The app flow is:

1. The browser loads a page such as `formgen.html`
2. Frontend JS calls `/api/...`
3. Apache rewrites those requests to `api/index.php`
4. PHP boots the app, loads `.env`, starts the session, and dispatches the route
5. Generated files are written into `downloads/`

## Files in this repo that matter for alwaysdata

These are the most important files behind the deployment:

- `docs/DEPLOY_ALWAYS_DATA.md`
  Short reference for the auto-deploy flow
- `.github/workflows/deploy-alwaysdata.yml`
  GitHub Actions deployment workflow
- `api/index.php`
  Main PHP API entrypoint
- `api/.htaccess`
  Apache rewrite file that routes API requests to `index.php`
- `app/Config/AppConfig.php`
  Runtime configuration loaded from `.env`
- `.env.example`
  Base environment template
- `js/api-client.js`
  Frontend API base resolution
- `app/Http/Router.php`
  Router logic that strips the runtime base path correctly

## Why alwaysdata works better for this project

alwaysdata solves the problems that GitHub Pages cannot:

- it runs PHP
- it supports Apache rewrite rules
- it supports SSH access
- it supports persistent files on disk
- it lets us keep a server-only `.env`
- it works well with GitHub Actions deployment over SSH and `rsync`

For a static-only website, GitHub Pages is usually simpler. For an app like this one, alwaysdata is the better fit.

## Final deployment model used here

This project uses an SSH deploy from GitHub Actions.

The sequence is:

1. Push to `master` or `main`
2. GitHub Actions checks out the repo
3. GitHub Actions runs `composer install --no-dev`
4. GitHub Actions connects to alwaysdata over SSH
5. The workflow ensures required runtime directories exist
6. `rsync` updates the live files
7. The server keeps `.env` and generated files in place

Important detail:

- `.env` is not deployed from GitHub
- `downloads/` is not overwritten on each deploy
- `docs/` and `designref/` are intentionally excluded from the server sync

## How we set it up step by step

### 1. Confirm the project is not static-only

Before moving off GitHub Pages, check whether the project needs server features.

For this project, the answer was yes because it needed:

- PHP API routes
- file uploads
- ZIP generation
- server-side downloads
- EPREL API secrets
- session-based compliance upload flow

If your project is only HTML, CSS, and JS, you may not need this migration.

### 2. Create the alwaysdata site

In alwaysdata, create the hosting target that will serve the app.

You need:

- an alwaysdata account
- a site or subdomain
- a public web directory
- SSH access enabled for deployment

In this project the public host is an alwaysdata subdomain:

`eprelnexled.alwaysdata.net`

You can also use a custom domain later, but the alwaysdata subdomain is the easiest place to start.

### 3. Decide whether the app lives at the domain root or in a subfolder

Two valid shapes:

- root hosting
  Example: `https://yourapp.alwaysdata.net/`
- subfolder hosting
  Example: `https://yourapp.alwaysdata.net/project-name/`

This project was designed safely for subfolder-aware API routing:

- `js/api-client.js` derives the API base from the current script/page path
- `app/Http/Router.php` strips the runtime API directory path before route matching

That means the app can work in a subfolder and can also be adapted to the domain root.

Recommended rule:

- use a dedicated subdomain if possible for the cleanest URLs
- use a subfolder if you are hosting multiple apps under one site

### 4. Keep secrets out of the repository

GitHub Pages encourages purely static deployment, but alwaysdata lets you keep secrets only on the server.

For this project, runtime configuration should come from `.env`, not from committed secrets.

At minimum the server `.env` should include:

```env
EPREL_API_KEY=your_api_key_here
EPREL_API_BASE=https://eprel.ec.europa.eu/api
EPREL_FILE_BASE=https://eprel.ec.europa.eu
DOWNLOAD_BASE=downloads
APP_DEBUG=false
```

Optional database values also exist in `.env.example`, but they are not required for the current EPREL tools flow unless your project uses them.

Important rule:

- do not commit real API keys
- do not deploy `.env` from GitHub Actions
- create the live `.env` manually on the server

### 5. Make sure the server can run the app

For this project, the server must support:

- PHP 8.2
- Apache with rewrite support
- filesystem writes inside the project runtime folders
- SSH access

This repo depends on Composer and `vlucas/phpdotenv`, so production must also have the installed `vendor/` directory.

That is why the workflow runs:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
```

before syncing files to alwaysdata.

### 6. Create the runtime directories on the server

This project writes real files to disk. Those folders must exist on the server and stay writable.

Required directories:

- `downloads/Labels`
- `downloads/Fiches`
- `downloads/XML`
- `downloads/attachments/TechnicalDoc`
- `downloads/attachments/spectral_graph`
- `downloads/logs`
- `downloads/eprel_zips`

The GitHub Actions workflow creates them before deploy so the app does not fail on first run.

This is one of the biggest differences from GitHub Pages. Static hosting does not give you this type of writable runtime filesystem.

### 7. Add an Apache rewrite for the API

The API needs all non-file requests under `api/` to route through `api/index.php`.

This repo already includes:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php [QSA,L]
```

Without that file, routes like `/api/search` or `/api/compliance/status` will fail.

### 8. Set up SSH deployment

This project deploys over SSH, not by FTP and not by copying files manually.

The clean process is:

1. generate a dedicated deploy key locally
2. add the public key to your alwaysdata SSH account
3. add the private key to GitHub repository secrets

Why this matters:

- the deploy stays automated
- no password is stored in the workflow
- the key can be revoked later without changing your alwaysdata account password

### 9. Add the GitHub repository secrets

This repo uses these secrets:

- `ALWAYSDATA_HOST`
  Example: `ssh-youraccount.alwaysdata.net`
- `ALWAYSDATA_PORT`
  Usually `22`
- `ALWAYSDATA_USER`
  Your SSH username
- `ALWAYSDATA_SSH_KEY`
  Private deploy key in OpenSSH format
- `ALWAYSDATA_TARGET_DIR`
  The remote directory where the app should be deployed

`ALWAYSDATA_TARGET_DIR` is important. It must point to the directory that your site is actually serving.

Examples:

- if the app lives at a subfolder, target the matching public subfolder directory
- if the app lives at the domain root, target the site root directory

### 10. Add the GitHub Actions workflow

This repo uses `.github/workflows/deploy-alwaysdata.yml`.

What the workflow does:

- checks out the repository
- installs PHP 8.2 and Composer
- installs production PHP dependencies
- writes the SSH private key on the runner
- trusts the alwaysdata host key with `ssh-keyscan`
- creates missing runtime directories on the server
- runs `rsync -az --delete` to publish the app

Important exclusions in this workflow:

- `.git/`
- `.github/`
- `.agents/`
- `.claude/`
- `.env`
- `downloads/`
- `designref/`
- `docs/`
- `composer.phar`

Why the exclusions matter:

- `.env` must remain server-only
- `downloads/` contains live runtime output and should not be destroyed every deploy
- `docs/` and `designref/` are not required for production

### 11. Perform the first deploy

Once the secrets and target directory are correct:

1. push to `master` or `main`
2. open GitHub Actions
3. watch `Deploy To alwaysdata`
4. confirm the job passes
5. open the live URL

If you prefer, you can also trigger the workflow manually through `workflow_dispatch`.

### 12. Create the server `.env` manually

After the first file deploy, log into alwaysdata and create the `.env` file directly on the server.

This file should live at the project root, not inside `api/`.

For this project, `.env` is loaded in `api/index.php` with:

```php
$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();
```

That means PHP expects `.env` one level above `api/`.

### 13. Smoke test the live app

Do not treat a green deploy job as enough. Check the live behavior.

Recommended test list for this project:

1. open `search.html`
2. search a known EPREL product
3. download a label
4. download a fiche
5. open `formgen.html`
6. generate XML
7. generate a ZIP
8. open `folders.html`
9. confirm files appear in the correct folders
10. call `/api/health` and verify the JSON response

If the project uses EPREL compliance upload, also test the login and upload flow after the basic checks pass.

### 14. Handle the GitHub Pages cutover safely

If the old project was previously live on GitHub Pages, do not switch everything off before the alwaysdata version is proven stable.

Safer order:

1. deploy the alwaysdata version first
2. test the live app fully
3. update DNS or links if you use a custom domain
4. only then disable or retire the GitHub Pages deployment

If the old GitHub Pages site used a custom domain, update that domain to point where the alwaysdata version should live.

## What was specific to this project

This migration was not just a host change. It matched the architecture of the EPREL tools app.

Project-specific points:

- the app needs PHP because the EPREL API key should not live in frontend code
- the app generates labels, fiches, XML, ZIPs, and attachments on the server
- the compliance uploader uses sessions, which GitHub Pages cannot provide
- the Linux host cannot use Windows-only desktop integrations such as `explorer.exe`

One known Linux hosting limitation in this repo:

- `api/index.php` includes an `open-folder` route that calls `explorer.exe`
- that route is useful locally on Windows
- it will not work on alwaysdata Linux hosting

So when moving from local Windows development to alwaysdata, do not expect desktop-only helper routes to work on production.

## How to reuse this process for another project

If you are moving a different project from GitHub Pages to alwaysdata, use this decision tree.

### If the new project is still static-only

You can still host it on alwaysdata, but you may not need:

- PHP
- Composer
- `.env`
- API routing
- writable runtime folders

In that case the migration is mostly:

1. create the alwaysdata site
2. upload static files
3. point the domain
4. optionally automate deploy from GitHub

### If the new project needs backend features

Follow the full pattern used in this repo:

1. keep backend code in the repo
2. keep secrets in `.env`
3. add rewrite rules if routes are not file-based
4. automate deployment with GitHub Actions plus SSH
5. create runtime folders on the server
6. exclude runtime and secret files from deployment

## Recommended migration checklist

Use this list before calling the migration complete.

- alwaysdata site created
- live URL decided
- root vs subfolder decided
- SSH access working
- deploy key created
- GitHub secrets added
- workflow added and passing
- server `.env` created
- required runtime directories created
- API routes working
- file writes working
- health check working
- old GitHub Pages deployment either retired or clearly marked as old

## Rollback plan

Do not migrate without a rollback path.

Recommended rollback approach:

1. keep the GitHub Pages version available until alwaysdata is fully validated
2. do not delete the old custom domain mapping until the new host is stable
3. keep the previous working `.env` values saved securely
4. keep a copy of the old workflow or deployment path
5. if production issues appear, point traffic back to the old live host while fixing alwaysdata

If you are using a custom domain, rollback usually means:

- restore the previous DNS target
- restore the previous active hosting platform
- verify the old site still serves the expected content

If you are using the default `*.github.io` or `*.alwaysdata.net` URLs only, rollback is simpler because both can exist at the same time while you test.

## Troubleshooting

### The frontend loads but API calls fail

Check:

- `api/.htaccess` exists
- Apache rewrite is enabled
- `vendor/` was deployed
- `.env` exists at the project root
- the API path matches the live folder structure

### The deploy passes but generated files do not appear

Check:

- `downloads/` subfolders exist
- the web server user can write to those folders
- `DOWNLOAD_BASE` is correct in `.env`

### Search works locally but fails on alwaysdata

Check:

- `EPREL_API_KEY` exists in `.env`
- `EPREL_API_BASE` and `EPREL_FILE_BASE` are correct
- `APP_DEBUG=true` temporarily if you need a more detailed server error during debugging

Remember to turn debug back off on production afterward.

### A feature worked on Windows but not on alwaysdata

Check whether the feature depends on desktop-only commands.

In this repo, `open-folder` uses `explorer.exe`, so it is expected to fail on Linux hosting.

## Recommended improvements for future migrations

If you repeat this pattern on more projects, these improvements are worth keeping:

- keep a clean `.env.example`
- keep deploy secrets only in GitHub and alwaysdata
- keep the app root and API base path runtime-aware
- add a `/api/health` route early
- keep runtime output folders outside the destructive part of the deploy
- document the target directory and domain mapping from day one

## Short version

The move from GitHub Pages to alwaysdata worked because we changed from a static host model to a real application host model:

- GitHub Pages served frontend files only
- alwaysdata serves frontend plus PHP
- GitHub Actions deploys the app over SSH
- `.env` stays on the server
- `downloads/` stays persistent on the server

That is the core pattern to reuse on the next project.
