/**
 * Информационный баннер cookie/аналитики.
 * Аналитика грузится независимо; «ОК» только скрывает баннер.
 * Не чаще одного раза за визит (sessionStorage).
 */
(function (global) {
  var KEY = 'psiCookieNoticeDismissed';

  function alreadyDismissed() {
    try {
      return sessionStorage.getItem(KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markDismissed() {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch (e) {}
  }

  function ensureStyles() {
    if (document.getElementById('psi-cookie-notice-style')) return;
    var style = document.createElement('style');
    style.id = 'psi-cookie-notice-style';
    style.textContent =
      '.psi-cookie-notice{position:fixed;left:16px;right:16px;bottom:16px;z-index:1200;max-width:560px;margin:0 auto;background:#fff;border:1px solid #eae7ea;border-radius:12px;box-shadow:0 12px 40px rgba(26,26,26,.12);padding:1rem 1.2rem;display:none;align-items:flex-start;gap:1rem;flex-wrap:wrap;font-family:Manrope,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
      '.psi-cookie-notice.open{display:flex}' +
      '.psi-cookie-notice p{flex:1 1 240px;margin:0;font-size:.85rem;color:#3d3d3d;line-height:1.5}' +
      '.psi-cookie-notice a{color:#802d4b}' +
      '.psi-cookie-notice-actions{display:flex;gap:.5rem;flex-wrap:wrap}' +
      '.psi-cookie-notice .psi-cookie-ok{flex:0 0 auto;padding:.45rem 1rem;background:#802d4b;color:#fff;border:0;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;font-family:inherit}';
    document.head.appendChild(style);
  }

  global.mountPsiCookieNotice = function () {
    if (alreadyDismissed()) return;
    if (document.getElementById('psiCookieNotice')) return;

    ensureStyles();

    var el = document.createElement('div');
    el.id = 'psiCookieNotice';
    el.className = 'psi-cookie-notice open';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Уведомление о cookie');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<p>На сайте используются cookie для аналитики посещений (Яндекс.Метрика, Google Tag). Подробнее — в <a href="/privacy-policy/" target="_blank" rel="noopener">политике конфиденциальности</a>.</p>' +
      '<div class="psi-cookie-notice-actions">' +
      '<button type="button" class="psi-cookie-ok" id="psiCookieNoticeOk">ОК</button>' +
      '</div>';

    document.body.appendChild(el);

    var btn = document.getElementById('psiCookieNoticeOk');
    if (btn) {
      btn.addEventListener('click', function () {
        markDismissed();
        el.classList.remove('open');
        el.setAttribute('hidden', 'hidden');
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', global.mountPsiCookieNotice);
  } else {
    global.mountPsiCookieNotice();
  }
})(window);
