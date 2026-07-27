# Extract articleBody from b17, sanitize for psi blog (author's own articles).
$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
$Map = @(
  @{ slug = 'zhena-hochet-razvoda'; path = 'zhena_hochet_razvoda_chto_delat'; date = '2026-06-17'; display = '17 июня 2026' },
  @{ slug = 'zhena-ne-hochet-imet-detey'; path = 'zhena_ne_hochet_imet_detey'; date = '2026-06-10'; display = '10 июня 2026' },
  @{ slug = 'govorit-li-zhene-ob-izmene'; path = 'govorit_li_zhene_ob_izmene'; date = '2026-06-23'; display = '23 июня 2026' },
  @{ slug = 'hochu-razvestis-s-zhenoy'; path = 'hochu_razvestis_s_zhenoy_statya_dlya_muzhchin'; date = '2026-06-01'; display = '1 июня 2026' },
  @{ slug = 'psiholog-dlya-muzhchin-v-krizise'; path = 'psiholog_dlya_muzhchin_v_krizise'; date = '2026-05-15'; display = '15 мая 2026' },
  @{ slug = 'hochu-izbavitsya-ot-revnosti'; path = 'hochu_izbavitsya_ot_revnosti'; date = '2026-05-10'; display = '10 мая 2026' },
  @{ slug = 'v-chem-smysl-zhizni'; path = 'v_chem_smysl_zhizni_vzglyad_psihologa'; date = '2026-05-06'; display = '6 мая 2026' },
  @{ slug = 'trevoga-chto-eto-otkuda'; path = 'trevoga_chto_eto_otkuda'; date = '2026-04-29'; display = '29 апреля 2026' },
  @{ slug = 'kak-zabyt-cheloveka'; path = 'kak_zabyt_cheloveka_lyubimuyu'; date = '2026-04-27'; display = '27 апреля 2026' }
)

function Get-ArticleBodyHtml([string]$url) {
  $h = (Invoke-WebRequest -Uri $url -UseBasicParsing).Content
  $m = [regex]::Match($h, 'itmprp="articleBody">(.*?)<hr class=class_cut>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if (-not $m.Success) {
    $m = [regex]::Match($h, 'itmprp="articleBody">(.*?)</div>\s*</td>\s*</tr>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  }
  if (-not $m.Success) { throw "articleBody not found: $url" }
  return $m.Groups[1].Value
}

function Sanitize-ArticleHtml([string]$html, [string]$slug) {
  $x = $html
  $x = $x -replace '<div class=class_blue>', '<div class="note-box">'
  $x = $x -replace '<div class=class_green>', '<div class="note-box">'
  $x = $x -replace '<div class=class_avtor>.*$', ''
  $x = $x -replace '<p>\s*&nbsp;\s*</p>', ''
  $x = $x -replace '<u>', '<strong>'
  $x = $x -replace '</u>', '</strong>'
  $x = $x -replace '<font[^>]*>', ''
  $x = $x -replace '</font>', ''
  $x = $x -replace '(?s)<p><img[^>]*></p>', ''
  $x = $x -replace '(?s)<p>\s*&#10084;.*$', ''
  $x = $x -replace '<p>\s*&nbsp;&nbsp;\s*</p>', ''
  $x = $x -replace '<b>\s*', '<strong>'
  $x = $x -replace '\s*</b>', '</strong>'
  $x = $x -replace '<i>\s*', '<em>'
  $x = $x -replace '\s*</i>', '</em>'
  $x = $x -replace '<blockquote>', '<div class="quote-box">'
  $x = $x -replace '</blockquote>', '</div>'
  $x = $x -replace "src='/foto/uploaded/[^']+'", "src=""/assets/images/blog/$slug.jpg"" class=""inline-photo"""
  $x = $x -replace 'src="/foto/uploaded/[^"]+"', "src=""/assets/images/blog/$slug.jpg"" class=""inline-photo"""
  $x = $x -replace 'https://www\.b17\.ru/article/[^"\s>]+', '/blog/'
  $x = $x -replace 'anna-psy\.online', 'психолог-для-мужчин.рф'
  return $x.Trim()
}

$OutDir = Join-Path (Join-Path $Root 'scripts') 'blog-bodies'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

foreach ($item in $Map) {
  $url = "https://www.b17.ru/article/$($item.path)/"
  Write-Host $item.slug
  $body = Get-ArticleBodyHtml $url
  $body = Sanitize-ArticleHtml $body $item.slug
  $path = Join-Path $OutDir ($item.slug + '.html')
  [IO.File]::WriteAllText($path, $body, [Text.UTF8Encoding]::new($false))
}

Write-Host 'Done'
