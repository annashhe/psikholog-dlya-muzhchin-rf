#Requires -Version 5.1
<#
.SYNOPSIS
  Put LEADS_INGEST_SECRET on the Cloudflare Worker and redeploy psi-leads.

.DESCRIPTION
  Requires:
  - $env:CLOUDFLARE_API_TOKEN set (or prior `npx wrangler login`)
  - Node.js / npx in PATH

  Secret sources (first match wins):
  1. -Secret parameter
  2. Optional SSH read from VPS if deploy key exists
  3. Interactive SecureString prompt

.EXAMPLE
  cd C:\Users\ANNA\SITES\psikholog-dlya-muzhchin-rf\cloudflare
  $env:CLOUDFLARE_API_TOKEN = "..."   # if not already set
  .\sync-leads-secret.ps1
  # paste secret when prompted

.EXAMPLE
  .\sync-leads-secret.ps1 -Secret "your-secret-here"
#>
param(
  [string]$Secret = ""
)

$ErrorActionPreference = "Stop"

# Prefer Node from Program Files if present
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) {
  $env:Path = $nodeDir + ";" + $env:Path
}

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw "npx not found. Install Node.js and ensure it is in PATH."
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$KeyPath = Join-Path $env:USERPROFILE ".ssh\anna_vps_ed25519"
$Vps = "anna@92.63.99.93"
$EnvPath = "/home/anna/anna_project/backend/anna-psy-schedule-backend/.env"

function Get-SecretFromVps {
  if (-not (Test-Path $KeyPath)) {
    return $null
  }
  Write-Host "==> Trying LEADS_INGEST_SECRET from VPS via SSH (value not printed)" -ForegroundColor Cyan
  # Simple remote one-liner only (no bash heredoc).
  $remoteCmd = "grep -E '^LEADS_INGEST_SECRET=' '$EnvPath' | head -1 | cut -d= -f2-"
  $out = & ssh -i $KeyPath -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=8 $Vps $remoteCmd 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $out) {
    Write-Host "SSH read failed or key unusable; will prompt instead." -ForegroundColor Yellow
    return $null
  }
  $line = ($out | Select-Object -Last 1).ToString().Trim().Trim('"').Trim("'")
  if ($line.Length -lt 16) {
    Write-Host "SSH returned empty/short secret; will prompt instead." -ForegroundColor Yellow
    return $null
  }
  return $line
}

function Get-SecretFromPrompt {
  Write-Host "==> Enter LEADS_INGEST_SECRET (same value as on VPS; input hidden)" -ForegroundColor Cyan
  $secure = Read-Host -AsSecureString "LEADS_INGEST_SECRET"
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

if ([string]::IsNullOrWhiteSpace($Secret)) {
  $Secret = Get-SecretFromVps
}
if ([string]::IsNullOrWhiteSpace($Secret)) {
  $Secret = Get-SecretFromPrompt
}

$Secret = $Secret.Trim()
if ($Secret.Length -lt 16) {
  throw "Secret is empty or too short (len=$($Secret.Length)). Aborting."
}

Write-Host "Secret length=$($Secret.Length) (value not shown)" -ForegroundColor Green

if (-not $env:CLOUDFLARE_API_TOKEN) {
  Write-Host "==> CLOUDFLARE_API_TOKEN not set; checking wrangler auth..." -ForegroundColor Yellow
  npx wrangler whoami 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Run: `$env:CLOUDFLARE_API_TOKEN = 'your-token'   or: npx wrangler login" -ForegroundColor Yellow
    throw "Cloudflare auth missing. Set CLOUDFLARE_API_TOKEN or run wrangler login."
  }
}

Write-Host "==> wrangler secret put LEADS_INGEST_SECRET" -ForegroundColor Cyan
# Pipe value to stdin (non-interactive on Windows)
$Secret | npx wrangler secret put LEADS_INGEST_SECRET
if ($LASTEXITCODE -ne 0) {
  throw "wrangler secret put failed (exit $LASTEXITCODE)."
}
$Secret = $null

Write-Host "==> wrangler deploy" -ForegroundColor Cyan
npx wrangler deploy
if ($LASTEXITCODE -ne 0) {
  throw "wrangler deploy failed (exit $LASTEXITCODE)."
}

Write-Host @"

Done. Verify:
1) Submit a form on a site (or muzhskoy-psikholog.ru)
2) Telegram message arrives
3) https://anna-backend.ru/leads/ - if name contains test, turn OFF hide-test filter
4) Optional: npx wrangler tail   (look for Backend leads save ok / failed status+body)

"@ -ForegroundColor Green
