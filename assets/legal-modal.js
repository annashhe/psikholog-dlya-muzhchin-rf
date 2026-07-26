/** Политика, оферта, согласие — в новой вкладке; виджет календаря */
(function (global) {
  var PRIVACY_URL = '/privacy-policy/';
  var OFERTA_URL = '/oferta/';
  var CONSENT_URL = '/consent/';

  function patchAnchor(a) {
    if (!a || a.tagName !== 'A') return;
    var href = (a.getAttribute('href') || '').trim();
    if (href === '#popup:agreement' || href.indexOf('popup:agreement') !== -1) {
      a.setAttribute('href', CONSENT_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      return;
    }
    if (
      href.indexOf('anna-psy.online/privacy') !== -1 ||
      (href.indexOf('/privacy') !== -1 && a.closest('[data-anna-psy-widget]'))
    ) {
      a.setAttribute('href', PRIVACY_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
    if (href.indexOf('/oferta') !== -1 && a.closest('[data-anna-psy-widget]')) {
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
        .querySelectorAll('a[href="#popup:agreement"], a[href*="anna-psy.online/privacy"]')
        .forEach(patchAnchor);
    };
    run();
    var obs = new MutationObserver(run);
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function initLegalLinksNewTab() {
    document.querySelectorAll('a[href="/privacy-policy/"], a[href="/oferta/"], a[href="/consent/"]').forEach(function (a) {
      if (!a.getAttribute('target')) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
    });
  }

  function init() {
    patchLegalLinksIn(document);
    initWidgetLegalPatch();
    initLegalLinksNewTab();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
