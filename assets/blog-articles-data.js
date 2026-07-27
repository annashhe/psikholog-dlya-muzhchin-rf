/** Список статей блога для карточек (thank-you, 404 и т.д.) */
(function (global) {
  global.PSI_BLOG_ARTICLES = [
    {
      slug: 'zhena-hochet-razvoda',
      url: '/blog/zhena-hochet-razvoda/',
      title: 'Жена хочет развода: типичные реакции и ошибки',
      desc: 'Когда партнёрша говорит о разводе — что часто происходит внутри и снаружи.',
      date: '2026-06-17',
      display: '17 июня 2026',
    },
    {
      slug: 'psiholog-dlya-muzhchin-v-krizise',
      url: '/blog/psiholog-dlya-muzhchin-v-krizise/',
      title: 'Психолог для мужчин в кризисе',
      desc: 'Как устроена помощь без ярлыков и давления — примеры из практики.',
      date: '2026-05-15',
      display: '15 мая 2026',
    },
    {
      slug: 'trevoga-chto-eto-otkuda',
      url: '/blog/trevoga-chto-eto-otkuda/',
      title: 'Тревога: что это и откуда берётся',
      desc: 'Признаки, отличие от стресса и что можно сделать самому.',
      date: '2026-04-29',
      display: '29 апреля 2026',
    },
    {
      slug: 'hochu-razvestis-s-zhenoy',
      url: '/blog/hochu-razvestis-s-zhenoy/',
      title: 'Хочу развестись с женой: как принять решение',
      desc: 'Как отличить усталость от решения и что проверить в себе.',
      date: '2026-06-01',
      display: '1 июня 2026',
    },
  ];

  global.renderPsiBlogCards = function (options) {
    var opts = options || {};
    var list = Array.isArray(opts.articles) ? opts.articles : global.PSI_BLOG_ARTICLES;
    var limit = typeof opts.limit === 'number' ? opts.limit : list.length;
    var showAllBtn = opts.showAllBtn !== false;
    var imgPrefix = opts.imgPrefix || '/assets/images/blog/';
    var heading = opts.heading || 'Также вы можете почитать мои статьи';
    var headingId = opts.headingId || 'psi-blog-cards-title';

    if (!list.length) return '';

    var slice = list.slice(0, limit);
    var cards = slice
      .map(function (a) {
        var slug = a.slug || '';
        var img = a.image || imgPrefix + slug + '.jpg';
        return (
          '<a class="psi-blog-card" href="' +
          a.url +
          '">' +
          '<div class="psi-blog-card__media"><img src="' +
          img +
          '" width="320" height="320" alt="" loading="lazy" decoding="async" /></div>' +
          '<div class="psi-blog-card__body">' +
          '<h3 class="psi-blog-card__title">' +
          a.title +
          '</h3>' +
          '<p class="psi-blog-card__desc">' +
          a.desc +
          '</p>' +
          '<time datetime="' +
          (a.date || '') +
          '">' +
          (a.display || '') +
          '</time>' +
          '</div></a>'
        );
      })
      .join('');

    var btn =
      showAllBtn
        ? '<p class="psi-blog-all-wrap"><a href="/blog/" class="psi-btn psi-btn-outline">Показать все статьи психолога</a></p>'
        : '';

    return (
      '<section class="articles-block psi-blog-section" aria-labelledby="' +
      headingId +
      '">' +
      '<h2 id="' +
      headingId +
      '">' +
      heading +
      '</h2>' +
      '<div class="psi-blog-grid">' +
      cards +
      '</div>' +
      btn +
      '</section>'
    );
  };
})(window);
