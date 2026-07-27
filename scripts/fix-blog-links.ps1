# Strip external links from blog bodies; map to internal blog URLs.
$ErrorActionPreference = 'Stop'
$Utf8 = New-Object System.Text.UTF8Encoding $false
$BodiesDir = Join-Path $PSScriptRoot 'blog-bodies'

function Read-Utf8([string]$path) {
  $bytes = [IO.File]::ReadAllBytes($path)
  return [Text.Encoding]::UTF8.GetString($bytes)
}

function Fix-Links([string]$html) {
  $x = $html
  $x = $x -replace '(?s)<a[^>]+href="https://www\.b17\.ru/forum/[^"]*"[^>]*>(.*?)</a>', '$1'
  $x = $x -replace '(?s)<a[^>]+href=''https://www\.b17\.ru/forum/[^'']*''[^>]*>(.*?)</a>', '$1'
  $x = $x -replace 'href="/blog/"', 'href="/blog/psiholog-dlya-muzhchin-v-krizise/"'
  $x = $x -replace '(?s)<a[^>]+href="https://www\.b17\.ru/article/[^"]*"[^>]*>(.*?)</a>', '<a href="/blog/">$1</a>'
  $x = $x -replace '(?s)<a[^>]+href=''https://www\.b17\.ru/article/[^'']*''[^>]*>(.*?)</a>', '<a href="/blog/">$1</a>'
  $x = $x -replace 'https://www\.b17\.ru/trainings/[^"\s>]+', '/blog/'
  $x = $x -replace 'target="_blank"\s*rel="nofollow"', ''
  $x = $x -replace "target='_blank'\s*rel='nofollow'", ''
  $x = $x -replace '<p>\s*<img[^>]+class="inline-photo"[^>]*>\s*</p>', ''
  $x = $x -replace '<div class=class_gray>', '<div class="note-box">'
  return $x.Trim()
}

# Smarter b17 article slug map
$slugMap = @{
  'zhena_hochet_razvoda' = '/blog/zhena-hochet-razvoda/'
  'zhena_ne_hochet_imet_detey' = '/blog/zhena-ne-hochet-imet-detey/'
  'govorit_li_zhene_ob_izmene' = '/blog/govorit-li-zhene-ob-izmene/'
  'hochu_razvestis_s_zhenoy' = '/blog/hochu-razvestis-s-zhenoy/'
  'psiholog_dlya_muzhchin_v_krizise' = '/blog/psiholog-dlya-muzhchin-v-krizise/'
  'hochu_izbavitsya_ot_revnosti' = '/blog/hochu-izbavitsya-ot-revnosti/'
  'v_chem_smysl_zhizni' = '/blog/v-chem-smysl-zhizni/'
  'trevoga_chto_eto_otkuda' = '/blog/trevoga-chto-eto-otkuda/'
  'kak_zabyt_cheloveka' = '/blog/kak-zabyt-cheloveka/'
}

Get-ChildItem -Path (Join-Path $BodiesDir '*.html') | ForEach-Object {
  $x = Read-Utf8 $_.FullName
  $x = Fix-Links $x
  foreach ($key in $slugMap.Keys) {
    $x = $x -replace "https://www\.b17\.ru/article/$key[^`"'\s>]*", $slugMap[$key]
  }
  [IO.File]::WriteAllText($_.FullName, $x, $Utf8)
  Write-Host $_.Name
}

Write-Host 'links fixed'
