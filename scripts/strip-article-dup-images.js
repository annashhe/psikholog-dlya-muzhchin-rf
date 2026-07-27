/** Убрать из тел статей дубли обложки (/assets/images/blog/{slug}.jpg) */
const fs = require('fs');
const path = require('path');

const bodiesDir = path.join(__dirname, 'blog-bodies');
const files = fs.readdirSync(bodiesDir).filter((f) => f.endsWith('.html'));

function stripBody(html, slug) {
  let x = html;
  const coverNeedle = '/assets/images/blog/' + slug + '.jpg';
  const coverEsc = coverNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  x = x.replace(new RegExp('<p[^>]*>\\s*(?:&nbsp;\\s*)*<img[^>]*src=["\']' + coverEsc + '["\'][^>]*>\\s*</p>', 'gi'), '');
  x = x.replace(new RegExp('<img[^>]*src=["\']' + coverEsc + '["\'][^>]*>', 'gi'), '');
  x = x.replace(/<p>\s*(?:&nbsp;\s*)*<\/p>/gi, '');
  return x.trim();
}

files.forEach((file) => {
  const slug = file.replace(/\.html$/, '');
  const p = path.join(bodiesDir, file);
  const before = fs.readFileSync(p, 'utf8');
  const after = stripBody(before, slug);
  if (after !== before) {
    fs.writeFileSync(p, after, 'utf8');
    console.log('stripped:', slug);
  }
});
