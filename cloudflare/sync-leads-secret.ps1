# Sync LEADS_INGEST_SECRET to Cloudflare Worker + redeploy
#
# Root cause of form→Telegram OK but /leads/ empty:
# VPS has LEADS_INGEST_SECRET; Worker was missing it (or mismatched) → POST /public/leads returned 401,
# Worker still sent Telegram and logged the failure.
#
# Run in PowerShell (Anna must be logged into Cloudflare once):

$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\nodejs;" + $env:Path

cd C:\Users\ANNA\SITES\psikholog-dlya-muzhchin-rf\cloudflare

# 1) Login once (opens browser) if needed:
# npx wrangler login

# 2) Put the SAME secret as VPS .env LEADS_INGEST_SECRET
#    (value is also in anna-psy-schedule\scripts\vps-deploy-leads-dashboard.sh as SECRET_VALUE —
#     paste it when prompted; do not commit a new .env)
Write-Host "Paste LEADS_INGEST_SECRET (same as VPS), then Enter:" -ForegroundColor Cyan
npx wrangler secret put LEADS_INGEST_SECRET

# 3) Deploy worker (includes better ingest error logging for wrangler tail)
npx wrangler deploy

# 4) Optional: watch ingest
# npx wrangler tail

Write-Host "`nThen submit a form on a site → check https://anna-backend.ru/leads/ (turn off hide-test if name has тест)." -ForegroundColor Green
