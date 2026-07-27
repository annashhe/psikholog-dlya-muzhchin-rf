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

  global.renderThankYouArticles = function () {
    if (typeof global.renderPsiBlogCards === 'function') {
      return global.renderPsiBlogCards({
        limit: 4,
        showAllBtn: true,
        headingId: 'thank-you-articles-title',
      });
    }
    return '';
  };
})(window);
