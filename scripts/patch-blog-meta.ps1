$path = Join-Path $PSScriptRoot '..\blog\index.html'
$t = [System.IO.File]::ReadAllText($path, [System.Text.UTF8Encoding]::new($false))
$oldDesc = 'Статьи о психологии для мужчин: отношения, кризис, тревога, развод, онлайн-консультации.'
$newDesc = 'Статьи про отношения, развод, ревность, тревогу и кризис — без скриптов «как вернуть» и без обещаний результата. Читайте и записывайтесь, если нужен разбор вашей ситуации.'
$oldTitle = 'Блог | Психолог для мужчин онлайн — Анна Щеголихина'
$newTitle = 'Блог психолога для мужчин | Анна Щеголихина'
$t = $t.Replace($oldDesc, $newDesc)
$t = $t.Replace($oldTitle, $newTitle)
[System.IO.File]::WriteAllText($path, $t, [System.Text.UTF8Encoding]::new($false))
Write-Output 'blog index meta patched'
