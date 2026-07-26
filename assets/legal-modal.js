/** Политика, оферта, согласие — в новой вкладке; подмена ссылок виджета календаря на страницы .рф */
(function () {
  var SITE = 'https://психолог-для-мужчин.рф';
  var PRIVACY_URL = SITE + '/privacy-policy/';
  var OFERTA_URL = SITE + '/oferta/';
  var CONSENT_URL = SITE + '/consent/';

  function patchAnchor(a) {
    if (!a || a.tagName !== 'A') return;
    var href = (a.getAttribute('href') || '').trim();
    var inWidget = !!(a.closest && a.closest('[data-anna-psy-widget]'));

    if (href === '#popup:agreement' || href.indexOf('popup:agreement') !== -1) {
      a.setAttribute('href', CONSENT_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      return;
    }

    if (
      /anna-psy\.online\/privacy/i.test(href) ||
      /anna-psy\.online\/consent/i.test(href) ||
      /anna-psy\.online\/oferta/i.test(href) ||
      (inWidget && /privacy/i.test(href) && href.indexOf(SITE) === -1 && href.indexOf('/privacy-policy') === -1)
    ) {
      if (/oferta/i.test(href)) a.setAttribute('href', OFERTA_URL);
      else if (/consent|agreement|соглас/i.test(href)) a.setAttribute('href', CONSENT_URL);
      else a.setAttribute('href', PRIVACY_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      return;
    }

    if (inWidget && (/\/oferta/i.test(href) || /oferta/i.test(href))) {
      a.setAttribute('href', OFERTA_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  }

  function patchLegalLinksIn(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('a[href]').forEach(patchAnchor);
  }

  function initWidgetLegalPatch() {
    var run = function () {
      var mount = document.querySelector('[data-anna-psy-widget]');
      if (mount) patchLegalLinksIn(mount);
      document
        .querySelectorAll(
          'a[href="#popup:agreement"], a[href*="popup:agreement"], a[href*="anna-psy.online"]'
        )
        .forEach(patchAnchor);
    };
    run();
    if (!document.body) return;
    var obs = new MutationObserver(run);
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function initLegalLinksNewTab() {
    document
      .querySelectorAll('a[href="/privacy-policy/"], a[href="/oferta/"], a[href="/consent/"]')
      .forEach(function (a) {
        if (!a.getAttribute('target')) {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener');
        }
      });
  }

  function initConsentOpeners() {
    document.querySelectorAll('a.js-open-consent').forEach(function (a) {
      a.setAttribute('href', '/consent/');
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  function init() {
    patchLegalLinksIn(document);
    initWidgetLegalPatch();
    initLegalLinksNewTab();
    initConsentOpeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
