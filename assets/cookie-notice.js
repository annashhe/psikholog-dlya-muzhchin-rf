/**
 * Cookie-уведомление и выбор категорий.
 * Аналитика (Метрика/GTM) подключается только при согласии пользователя.
 */
(function (global) {
  var STORAGE_KEY = 'psiCookiePrefs';
  var BANNER_KEY = 'psiCookieBannerClosed';

  function readPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  global.psiGetCookiePrefs = function () {
    return readPrefs();
  };

  global.psiHasAnalyticsConsent = function () {
    var p = readPrefs();
    return !!(p && p.analytics === true);
  };

  function notifyAnalyticsGate() {
    if (typeof global.psiOnAnalyticsConsentChange === 'function') {
      global.psiOnAnalyticsConsentChange(global.psiHasAnalyticsConsent());
    }
    if (global.psiHasAnalyticsConsent() && typeof global.psiLoadAnalytics === 'function') {
      global.psiLoadAnalytics();
    }
  }

  function savePrefs(analytics, source) {
    writePrefs({
      analytics: !!analytics,
      essential: true,
      updated: new Date().toISOString(),
      source: source || 'banner',
    });
    notifyAnalyticsGate();
  }

  function bannerClosed() {
    try {
      return sessionStorage.getItem(BANNER_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function closeBanner() {
    try {
      sessionStorage.setItem(BANNER_KEY, '1');
    } catch (e) {}
    var el = document.getElementById('psiCookieNotice');
    if (el) {
      el.classList.remove('open');
      el.setAttribute('hidden', 'hidden');
    }
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
      '.psi-cookie-notice-actions{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}' +
      '.psi-cookie-notice .psi-cookie-ok,.psi-cookie-notice .psi-cookie-settings{flex:0 0 auto;padding:.45rem 1rem;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;font-family:inherit;border:1px solid transparent}' +
      '.psi-cookie-ok{background:#802d4b;color:#fff;border-color:#802d4b}' +
      '.psi-cookie-settings{background:transparent;color:#802d4b;border-color:#d8cfd3;opacity:.85}' +
      '.psi-cookie-settings:hover{opacity:1;background:#faf8f9}' +
      '.psi-cookie-modal-overlay{position:fixed;inset:0;z-index:1300;background:rgba(26,26,26,.45);display:none;align-items:center;justify-content:center;padding:16px}' +
      '.psi-cookie-modal-overlay.open{display:flex}' +
      '.psi-cookie-modal{background:#fff;border-radius:14px;max-width:440px;width:100%;padding:1.25rem 1.35rem;box-shadow:0 20px 50px rgba(26,26,26,.18);font-family:Manrope,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
      '.psi-cookie-modal h2{font-size:1.05rem;margin:0 0 .75rem;color:#1a1a1a}' +
      '.psi-cookie-modal p{font-size:.85rem;color:#3d3d3d;line-height:1.55;margin:0 0 1rem}' +
      '.psi-cookie-row{display:flex;gap:.75rem;align-items:flex-start;padding:.75rem 0;border-top:1px solid #eae7ea}' +
      '.psi-cookie-row:first-of-type{border-top:0}' +
      '.psi-cookie-row label{flex:1;font-size:.85rem;color:#3d3d3d;line-height:1.45;cursor:pointer}' +
      '.psi-cookie-row strong{display:block;color:#1a1a1a;margin-bottom:.2rem}' +
      '.psi-cookie-row input{margin-top:.2rem;accent-color:#802d4b}' +
      '.psi-cookie-modal-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem;justify-content:flex-end}' +
      '.psi-cookie-modal-actions button{padding:.5rem 1rem;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;font-family:inherit;border:1px solid #d8cfd3;background:#fff;color:#3d3d3d}' +
      '.psi-cookie-modal-actions .psi-cookie-save{background:#802d4b;color:#fff;border-color:#802d4b}';
    document.head.appendChild(style);
  }

  function openSettingsModal() {
    ensureStyles();
    var existing = document.getElementById('psiCookieModal');
    if (existing) {
      existing.classList.add('open');
      return;
    }
    var prefs = readPrefs();
    var analyticsOn = prefs ? !!prefs.analytics : false;

    var overlay = document.createElement('div');
    overlay.id = 'psiCookieModal';
    overlay.className = 'psi-cookie-modal-overlay open';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Настройки cookie');
    overlay.innerHTML =
      '<div class="psi-cookie-modal">' +
      '<h2>Настройки cookie</h2>' +
      '<p>Выберите, что разрешить. Подробнее — в <a href="/privacy-policy/" target="_blank" rel="noopener">политике конфиденциальности</a>.</p>' +
      '<div class="psi-cookie-row">' +
      '<input type="checkbox" id="psiCookieEssential" checked disabled aria-disabled="true" />' +
      '<label for="psiCookieEssential"><strong>Необходимые</strong>Нужны для работы сайта (например, запись и формы). Отключить нельзя.</label>' +
      '</div>' +
      '<div class="psi-cookie-row">' +
      '<input type="checkbox" id="psiCookieAnalytics"' +
      (analyticsOn ? ' checked' : '') +
      ' />' +
      '<label for="psiCookieAnalytics"><strong>Статистика посещений</strong>Обезличенная аналитика (Яндекс.Метрика, Google Tag Manager), чтобы понимать, как пользуются сайтом.</label>' +
      '</div>' +
      '<div class="psi-cookie-modal-actions">' +
      '<button type="button" class="psi-cookie-reject-analytics">Только необходимые</button>' +
      '<button type="button" class="psi-cookie-save">Сохранить</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    var analyticsEl = document.getElementById('psiCookieAnalytics');
    overlay.querySelector('.psi-cookie-save').addEventListener('click', function () {
      savePrefs(analyticsEl && analyticsEl.checked, 'settings');
      overlay.classList.remove('open');
      closeBanner();
    });
    overlay.querySelector('.psi-cookie-reject-analytics').addEventListener('click', function () {
      if (analyticsEl) analyticsEl.checked = false;
      savePrefs(false, 'reject-analytics');
      overlay.classList.remove('open');
      closeBanner();
    });
  }

  global.mountPsiCookieNotice = function () {
    var prefs = readPrefs();
    if (prefs) {
      notifyAnalyticsGate();
    }

    if (bannerClosed()) return;
    if (document.getElementById('psiCookieNotice')) return;

    ensureStyles();

    var el = document.createElement('div');
    el.id = 'psiCookieNotice';
    el.className = 'psi-cookie-notice open';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Уведомление о cookie');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<p>Мы используем cookie. Необходимые нужны для работы сайта; статистику можно включить или отключить. Подробнее — в <a href="/privacy-policy/" target="_blank" rel="noopener">политике</a> и <a href="/oferta/" target="_blank" rel="noopener">оферте</a>.</p>' +
      '<div class="psi-cookie-notice-actions">' +
      '<button type="button" class="psi-cookie-settings" id="psiCookieSettings">Настроить</button>' +
      '<button type="button" class="psi-cookie-ok" id="psiCookieNoticeOk">Принять все</button>' +
      '</div>';

    document.body.appendChild(el);

    document.getElementById('psiCookieNoticeOk').addEventListener('click', function () {
      savePrefs(true, 'accept-all');
      closeBanner();
    });
    document.getElementById('psiCookieSettings').addEventListener('click', function () {
      openSettingsModal();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', global.mountPsiCookieNotice);
  } else {
    global.mountPsiCookieNotice();
  }
})(window);
