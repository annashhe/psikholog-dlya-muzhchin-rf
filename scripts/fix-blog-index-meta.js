const fs = require('fs');
const p = require('path').join(__dirname, '..', 'blog', 'index.html');
let t = fs.readFileSync(p, 'utf8');
const d =
  'Статьи про отношения, развод, ревность, тревогу и кризис — без скриптов «как вернуть» и без обещаний результата. Читайте и записывайтесь, если нужен разбор вашей ситуации.';
t = t.replace(/content="Статьи про отношения,[^"]+"/g, 'content="' + d + '"');
const lead =
  'Статьи про отношения, развод, ревность, тревогу и кризис — без скриптов «как вернуть» и без обещаний результата';
t = t.replace(/<p class="lead">Статьи про отношения,[^<]+<\/p>/, '<p class="lead">' + lead + '</p>');
fs.writeFileSync(p, t, 'utf8');
console.log('fixed');
