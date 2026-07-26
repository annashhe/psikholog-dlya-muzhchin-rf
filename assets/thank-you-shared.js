/** Общие блоки для thank-you-callback и thank-you-booking */
(function (global) {
  var TG_URL = 'https://t.me/annashhe';
  var WA_URL = 'https://wa.me/79137556284';
  var MAX_URL =
    'https://max.ru/u/f9LHodD0cOKrHIa3XdZycCKQSXXx0dFf9Ck7hXPtx3Ti-6RSxFnoPC7d1Ag';

  global.thankYouMessengerLinks =
    '<a href="' +
    TG_URL +
    '" target="_blank" rel="noopener">Telegram</a>, <a href="' +
    WA_URL +
    '" target="_blank" rel="noopener">WhatsApp</a> или <a href="' +
    MAX_URL +
    '" target="_blank" rel="noopener">MAX</a>';

  var CONTACT_LABELS = {
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    max: 'MAX',
    sms: 'SMS',
    Telegram: 'Telegram',
    WhatsApp: 'WhatsApp',
    MAX: 'MAX',
    SMS: 'SMS',
  };

  /** Список способов связи для текста на thank-you (виджет и форма). */
  global.formatContactMethodsList = function (methods, fallback) {
    var fb = fallback || 'Telegram, WhatsApp или MAX';
    var list = Array.isArray(methods) ? methods : [];
    var labels = [];
    list.forEach(function (m) {
      var raw = String(m || '').trim();
      if (!raw) return;
      var key = raw.toLowerCase();
      labels.push(CONTACT_LABELS[raw] || CONTACT_LABELS[key] || raw);
    });
    if (!labels.length) return fb;
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return labels[0] + ' или ' + labels[1];
    return labels.slice(0, -1).join(', ') + ' или ' + labels[labels.length - 1];
  };

  global.BOOKING_THERAPY = {
    individual: { title: 'Индивидуальная консультация', duration: '50 минут', price: '4 500 ₽' },
    individual90: { title: 'Индивидуальная консультация', duration: '90 минут', price: '7 000 ₽' },
    individual_90: { title: 'Индивидуальная консультация', duration: '90 минут', price: '7 000 ₽' },
    family: { title: 'Семейная (парная) консультация', duration: '90 минут', price: '7 000 ₽' },
  };

  global.resolveBookingTherapy = function (data) {
    var map = global.BOOKING_THERAPY;
    var type = data && data.therapyType;
    if (type === 'individual_90') type = 'individual90';
    if (map[type]) return map[type];
    if (data && data.startIso && data.endIso) {
      var mins = Math.round((new Date(data.endIso) - new Date(data.startIso)) / 60000);
      if (mins >= 80) return map.individual90;
    }
    return map.individual;
  };

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
      '</div>' +
      '<p class="psi-thank-you-more"><a href="/blog/" class="psi-btn psi-btn-outline">Показать больше статей</a></p>' +
      '</section>'
    );
  };
})(window);
