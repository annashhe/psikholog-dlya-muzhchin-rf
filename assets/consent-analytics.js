/**
 * Загрузка Метрики/GTM только после согласия на cookie/аналитику.
 * localStorage.cookieConsentV1: '1' = accept, '0' = decline
 */
(function (global) {
  var METRIKA_ID = 110969154;
  var GTAG_ID = 'GT-TNH4ZN2N';
  var started = false;

  function hasConsent() {
    try {
      return localStorage.getItem('cookieConsentV1') === '1';
    } catch (e) {
      return false;
    }
  }

  function loadGtag() {
    if (global.__psiGtagLoaded) return;
    global.__psiGtagLoaded = true;
    global.dataLayer = global.dataLayer || [];
    global.gtag =
      global.gtag ||
      function () {
        global.dataLayer.push(arguments);
      };
    global.gtag('js', new Date());
    global.gtag('config', GTAG_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GTAG_ID;
    document.head.appendChild(s);
  }

  function loadMetrika() {
    if (global.__psiMetrikaLoaded) return;
    global.__psiMetrikaLoaded = true;
    (function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + METRIKA_ID, 'ym');

    global.ym(METRIKA_ID, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
      ecommerce: 'dataLayer',
    });
  }

  global.psiLoadAnalytics = function () {
    if (started || !hasConsent()) return;
    started = true;
    loadGtag();
    loadMetrika();
  };

  global.psiHasAnalyticsConsent = hasConsent;

  if (hasConsent()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        global.psiLoadAnalytics();
      });
    } else {
      global.psiLoadAnalytics();
    }
  }
})(window);
