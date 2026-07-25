/** Общие блоки для thank-you-callback и thank-you-booking */
(function (global) {
  var TG_URL = 'https://t.me/annashhe';
  var MAX_URL =
    'https://max.ru/u/f9LHodD0cOKrHIa3XdZycCKQSXXx0dFf9Ck7hXPtx3Ti-6RSxFnoPC7d1Ag';

  global.thankYouMessengerLinks =
    '<a href="' +
    TG_URL +
    '" target="_blank" rel="noopener">Telegram</a> или <a href="' +
    MAX_URL +
    '" target="_blank" rel="noopener">MAX</a>';

  var ARTICLES = [
    {
      url: '/blog/zhena-hochet-razvoda/',
      title: 'Жена хочет развода: типичные реакции и ошибки',
      desc: 'Типичные ловушки в кризисе, когда партнёрша говорит о разводе — без готовых скриптов и гарантий.',
      date: '23 июля 2026',
    },
    {
      url: '/blog/psiholog-dlya-muzhchin-v-krizise/',
      title: 'Психолог для мужчин в кризисе: как устроена помощь',
      desc: 'Почему мужчины приходят поздно и как выглядит работа без ярлыков.',
      date: '15 мая 2026',
    },
    {
      url: '/blog/trevoga-chto-eto-otkuda/',
      title: 'Тревога: что это, откуда берётся и что можно сделать',
      desc: 'Ситуативная и хроническая тревога — признаки и бережные шаги.',
      date: '29 апреля 2026',
    },
  ];

  global.renderThankYouArticles = function () {
    if (!ARTICLES.length) return '';
    var items = ARTICLES.map(function (a) {
      return (
        '<article class="article-card">' +
        '<h3><a href="' +
        a.url +
        '">' +
        a.title +
        '</a></h3>' +
        '<p>' +
        a.desc +
        '</p>' +
        '<time>' +
        a.date +
        '</time>' +
        '</article>'
      );
    }).join('');
    return (
      '<section class="articles-block" aria-labelledby="thank-you-articles-title">' +
      '<h2 id="thank-you-articles-title">Также вы можете почитать мои статьи</h2>' +
      '<div class="articles-list">' +
      items +
      '</div></section>'
    );
  };
})(window);
