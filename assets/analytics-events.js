/**
 * Яндекс.Метрика + Google Tag: цели и клики по контактам.
 * Цели Метрики: lead_callback, lead_booking, click_phone, click_telegram, click_max, click_whatsapp, click_blog_cta
 */
window.psiMetrikaGoal = function (goalId, params) {
  if (!goalId) return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', goalId, params || {});
    } else if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      var payload = { event: goalId };
      if (params) {
        for (var k in params) {
          if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
        }
      }
      window.dataLayer.push(payload);
    }
  } catch (e0) {}
  if (typeof ym === 'function') {
    try {
      ym(110969154, 'reachGoal', goalId, params || {});
    } catch (e) {}
  }
};

(function () {
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link || typeof window.psiMetrikaGoal !== 'function') return;
    var href = link.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) window.psiMetrikaGoal('click_phone');
    else if (/t\.me\/|telegram\.me\//i.test(href)) window.psiMetrikaGoal('click_telegram');
    else if (/wa\.me\/|whatsapp\.com\//i.test(href)) window.psiMetrikaGoal('click_whatsapp');
    else if (href.indexOf('max.ru/') !== -1) window.psiMetrikaGoal('click_max');
    else if (href.indexOf('#booking') !== -1 || /\/#booking/.test(href)) {
      if (link.closest('.psi-blog-cta') || link.closest('.article-cta') || /\/blog\//.test(location.pathname)) {
        window.psiMetrikaGoal('click_blog_cta');
      }
    }
  });
})();
