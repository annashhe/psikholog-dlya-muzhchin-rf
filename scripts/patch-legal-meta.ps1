$root = Split-Path $PSScriptRoot -Parent

$privacy = Join-Path $root 'privacy-policy\index.html'
$t = [System.IO.File]::ReadAllText($privacy, [System.Text.UTF8Encoding]::new($false))
$t = $t.Replace(
  '<title>Политика конфиденциальности | Анна Щеголихина — психолог для мужчин</title>',
  '<title>Политика конфиденциальности | психолог-для-мужчин.рф</title>'
)
$t = $t.Replace(
  'content="Политика обработки персональных данных на сайте психолог-для-мужчин.рф."',
  'content="Как обрабатываются персональные данные, cookie, аналитика и формы записи на сайте Анны Щеголихиной."'
)
[System.IO.File]::WriteAllText($privacy, $t, [System.Text.UTF8Encoding]::new($false))

$oferta = Join-Path $root 'oferta\index.html'
$t = [System.IO.File]::ReadAllText($oferta, [System.Text.UTF8Encoding]::new($false))
$t = $t.Replace(
  '<title>Публичная оферта | Анна Щеголихина — психолог для мужчин</title>',
  '<title>Публичная оферта на психологические консультации | Анна Щеголихина</title>'
)
$t = $t.Replace(
  'content="Публичная оферта об оказании психологических услуг (онлайн и очно) Анны Щеголихиной."',
  'content="Условия онлайн- и очных консультаций: запись, оплата, отмена, конфиденциальность. Самозанятая (НПД), Калининград."'
)
[System.IO.File]::WriteAllText($oferta, $t, [System.Text.UTF8Encoding]::new($false))
Write-Output 'legal meta patched'
