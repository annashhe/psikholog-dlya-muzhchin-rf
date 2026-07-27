# Apply blog pages from UTF-8 template (no Cyrillic in this script).
$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
$Utf8 = New-Object System.Text.UTF8Encoding $false
$BodiesDir = Join-Path $PSScriptRoot 'blog-bodies'
$MetaPath = Join-Path $PSScriptRoot 'blog-articles.json'
$TplPath = Join-Path $PSScriptRoot 'blog-page.tpl'
$JsonTplPath = Join-Path $PSScriptRoot 'blog-json.tpl'
$SitePath = Join-Path $PSScriptRoot 'site-base-url.txt'

function Read-Utf8([string]$path) {
  $bytes = [IO.File]::ReadAllBytes($path)
  return [Text.Encoding]::UTF8.GetString($bytes)
}

$Site = (Read-Utf8 $SitePath).Trim()
$Tpl = Read-Utf8 $TplPath
$JsonTpl = Read-Utf8 $JsonTplPath
$Articles = (Get-Content -LiteralPath $MetaPath -Raw -Encoding UTF8 | ConvertFrom-Json)

function Escape-Json([string]$s) {
  if ($null -eq $s) { return '' }
  return ($s -replace '\\', '\\\\' -replace '"', '\"')
}

foreach ($a in $Articles) {
  $bodyPath = Join-Path $BodiesDir ($a.slug + '.html')
  $bodyInner = Read-Utf8 $bodyPath
  $heartIdx = $bodyInner.IndexOf('&#10084;')
  if ($heartIdx -ge 0) { $bodyInner = $bodyInner.Substring(0, $heartIdx).TrimEnd() }
  $markPath = Join-Path $PSScriptRoot 'blog-trim-marker.txt'
  $mark = (Read-Utf8 $markPath).Trim()
  $buduIdx = $bodyInner.IndexOf($mark)
  if ($buduIdx -ge 0) { $bodyInner = $bodyInner.Substring(0, $buduIdx).TrimEnd() }
  $coverPath = "/assets/images/blog/$($a.slug).jpg"
  $bodyInner = $bodyInner -replace "(?s)<p[^>]*>\s*(?:&nbsp;\s*)*<img[^>]+src=[`"']$([regex]::Escape($coverPath))[`"'][^>]*>\s*</p>", ''
  $bodyInner = $bodyInner -replace "<img[^>]+src=[`"']$([regex]::Escape($coverPath))[`"'][^>]*>", ''
  $bodyInner = $bodyInner -replace '(?s)<p>\s*(?:&nbsp;\s*)*</p>', ''
  $canonical = "$Site/blog/$($a.slug)/"
  $coverUrl = "$Site/assets/images/blog/$($a.slug).jpg"
  $titleAttr = ($a.title -replace '"', '&quot;')

  $jsonLd = $JsonTpl
  $jsonLd = $jsonLd.Replace('{{HEADLINE}}', (Escape-Json $a.title))
  $jsonLd = $jsonLd.Replace('{{DESCRIPTION}}', (Escape-Json $a.desc))
  $jsonLd = $jsonLd.Replace('{{DATE}}', $a.date)
  $jsonLd = $jsonLd.Replace('{{COVER_URL}}', $coverUrl)
  $jsonLd = $jsonLd.Replace('{{SITE}}', $Site)
  $jsonLd = $jsonLd.Replace('{{CANONICAL}}', $canonical)
  $jsonLd = $jsonLd.Replace('{{BREADCRUMB}}', (Escape-Json $a.breadcrumb))

  $html = $Tpl
  $html = $html.Replace('{{TITLE}}', $a.title)
  $html = $html.Replace('{{DESC}}', $a.desc)
  $html = $html.Replace('{{CANONICAL}}', $canonical)
  $html = $html.Replace('{{COVER_URL}}', $coverUrl)
  $html = $html.Replace('{{SITE}}', $Site)
  $html = $html.Replace('{{BREADCRUMB}}', $a.breadcrumb)
  $html = $html.Replace('{{DATE}}', $a.date)
  $html = $html.Replace('{{DISPLAY}}', $a.display)
  $html = $html.Replace('{{SLUG}}', $a.slug)
  $html = $html.Replace('{{TITLE_ATTR}}', $titleAttr)
  $html = $html.Replace('{{BODY}}', $bodyInner)
  $html = $html.Replace('{{JSON_LD}}', $jsonLd)

  $outPath = Join-Path $Root "blog\$($a.slug)\index.html"
  [IO.File]::WriteAllText($outPath, $html, $Utf8)
  Write-Host $a.slug
}

Write-Host 'done'
