#Requires -Version 5.1
<#
.SYNOPSIS
  Sync LEADS_INGEST_SECRET from VPS .env → Cloudflare Worker + redeploy psi-leads.

.WHY
  Form Telegram works but /leads/ stays empty when Worker is missing/mismatched
  LEADS_INGEST_SECRET → POST https://anna-backend.ru/public/leads returns 401,
  Worker still sends Telegram.

.RUN (Anna, interactive PowerShell):
  cd C:\Users\ANNA\SITES\psikholog-dlya-muzhchin-rf\cloudflare
  .\sync-leads-secret.ps1
#>
$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\nodejs;" + $env:Path

$KeyPath = Join-Path $env:USERPROFILE ".ssh\anna_vps_ed25519"
$Vps = "anna@92.63.99.93"
$EnvPath = "/home/anna/anna_project/backend/anna-psy-schedule-backend/.env"

Write-Host "==> Cloudflare login (browser once if needed)" -ForegroundColor Cyan
npx wrangler whoami 2>$null
if ($LASTEXITCODE -ne 0) {
  npx wrangler login
}

Write-Host "==> Read LEADS_INGEST_SECRET from VPS (not printed)" -ForegroundColor Cyan
if (-not (Test-Path $KeyPath)) {
  throw "Missing SSH key $KeyPath — use password SSH or create deploy key first."
}

$secret = ssh -i $KeyPath -o IdentitiesOnly=yes -o BatchMode=yes $Vps @"
python3 - <<'PY'
import re
from pathlib import Path
t = Path('$EnvPath').read_text()
m = re.search(r'^LEADS_INGEST_SECRET=(.*)$', t, re.M)
if not m:
    raise SystemExit('LEADS_INGEST_SECRET missing on VPS')
v = m.group(1).strip().strip('\"').strip(\"'\")
if not v:
    raise SystemExit('LEADS_INGEST_SECRET empty on VPS')
print(v)
PY
"@
$secret = ($secret | Select-Object -Last 1).Trim()
if (-not $secret -or $secret.Length -lt 16) {
  throw "Failed to read secret from VPS (len=$($secret.Length))"
}
Write-Host "VPS secret length=$($secret.Length) (value not shown)" -ForegroundColor Green

Write-Host "==> wrangler secret put LEADS_INGEST_SECRET" -ForegroundColor Cyan
$secret | npx wrangler secret put LEADS_INGEST_SECRET
$secret = $null

Write-Host "==> wrangler deploy" -ForegroundColor Cyan
npx wrangler deploy

Write-Host @"

Done. Verify:
1) Submit a form on a site (or muzhskoy-psikholog.ru)
2) Telegram message arrives
3) https://anna-backend.ru/leads/ — if name contains «тест», turn OFF «Скрыть тестовые»
4) Optional: npx wrangler tail   (look for «Backend leads save ok» / failed status+body)

"@ -ForegroundColor Green
