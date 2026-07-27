/** Политика и оферта — новая вкладка; согласие — попап на главной (fallback /consent/). */
(function () {
  var SITE = 'https://психолог-для-мужчин.рф';
  var PRIVACY_URL = SITE + '/privacy-policy/';
  var OFERTA_URL = SITE + '/oferta/';
  var CONSENT_URL = SITE + '/consent/';

  function openConsentModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var modal = document.getElementById('consentModal');
    if (!modal) {
      window.open(CONSENT_URL, '_blank', 'noopener');
      return;
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    var closeBtn = document.getElementById('consentModalClose');
    if (closeBtn) closeBtn.focus();
  }

  function closeConsentModal() {
    var modal = document.getElementById('consentModal');
    if (!modal) return;
    modal.classList.remove('open');
    if (!document.getElementById('diplomaModal') || !document.getElementById('diplomaModal').classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  window.psiOpenConsentModal = openConsentModal;
  window.psiCloseConsentModal = closeConsentModal;

  function isConsentHref(href) {
    var h = String(href || '').trim().toLowerCase();
    if (!h) return false;
    if (h === '#consent' || h === '#popup:agreement') return true;
    if (h.indexOf('popup:agreement') !== -1) return true;
    if (/\/consent\/?/.test(h)) return true;
    if (/anna-psy\.online\/consent/i.test(h)) return true;
    if (/соглас|agreement/i.test(h) && /consent|agreement|соглас/i.test(h)) return true;
    return false;
  }

  function patchAnchor(a) {
    if (!a || a.tagName !== 'A') return;
    var href = (a.getAttribute('href') || '').trim();
    var inWidget = !!(a.closest && a.closest('[data-anna-psy-widget]'));

    if (
      href === '#popup:agreement' ||
      href.indexOf('popup:agreement') !== -1 ||
      a.classList.contains('js-open-consent')
    ) {
      a.setAttribute('href', '#consent');
      a.removeAttribute('target');
      a.setAttribute('role', 'button');
      return;
    }

    if (
      /anna-psy\.online\/privacy/i.test(href) ||
      /anna-psy\.online\/consent/i.test(href) ||
      /anna-psy\.online\/oferta/i.test(href) ||
      (inWidget && /privacy/i.test(href) && href.indexOf(SITE) === -1 && href.indexOf('/privacy-policy') === -1)
    ) {
      if (/oferta/i.test(href)) {
        a.setAttribute('href', OFERTA_URL);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      } else if (/consent|agreement|соглас/i.test(href)) {
        a.setAttribute('href', '#consent');
        a.removeAttribute('target');
        a.setAttribute('role', 'button');
      } else {
        a.setAttribute('href', PRIVACY_URL);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
      return;
    }

    if (inWidget && (/\/oferta/i.test(href) || /oferta/i.test(href))) {
      a.setAttribute('href', OFERTA_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }

    if (inWidget && isConsentHref(href)) {
      a.setAttribute('href', '#consent');
      a.removeAttribute('target');
      a.setAttribute('role', 'button');
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
          'a[href="#popup:agreement"], a[href*="popup:agreement"], a[href*="anna-psy.online"], a.js-open-consent'
        )
        .forEach(patchAnchor);
    };
    run();
    if (!document.body) return;
    var obs = new MutationObserver(run);
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function initLegalLinksNewTab() {
    document.querySelectorAll('a[href="/privacy-policy/"], a[href="/oferta/"]').forEach(function (a) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  function initConsentOpeners() {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a');
      if (!a) return;
      if (a.classList.contains('js-open-consent') || (a.getAttribute('href') || '') === '#consent') {
        openConsentModal(e);
        return;
      }
      var href = a.getAttribute('href') || '';
      if (href.indexOf('popup:agreement') !== -1) {
        openConsentModal(e);
      }
    });

    var modal = document.getElementById('consentModal');
    var closeBtn = document.getElementById('consentModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeConsentModal);
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeConsentModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var m = document.getElementById('consentModal');
      if (m && m.classList.contains('open')) closeConsentModal();
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
