/** Политика и попап согласия (форма + виджет календаря) */
(function (global) {
  var PRIVACY_URL = '/privacy-policy/';

  function openConsentModal() {
    var modal = document.getElementById('consentModal');
    if (!modal) return;
    if (modal.parentNode !== document.body) {
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeConsentModal() {
    var modal = document.getElementById('consentModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  global.openConsentModal = openConsentModal;
  global.closeConsentModal = closeConsentModal;

  function patchAnchor(a) {
    if (!a || a.tagName !== 'A') return;
    var href = (a.getAttribute('href') || '').trim();
    if (href === '#popup:agreement' || href.indexOf('popup:agreement') !== -1) {
      a.setAttribute('href', '#');
      a.classList.add('js-consent-popup');
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
  }

  function patchLegalLinksIn(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('a[href]').forEach(patchAnchor);
  }

  function initConsentModalUi() {
    var modal = document.getElementById('consentModal');
    if (!modal) return;
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeConsentModal();
    });
    var closeBtn = document.getElementById('consentModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeConsentModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeConsentModal();
    });
  }

  function initConsentLinkDelegation() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a.js-open-consent, a.js-consent-popup');
      if (!link) return;
      e.preventDefault();
      openConsentModal();
    });
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

  function init() {
    initConsentModalUi();
    initConsentLinkDelegation();
    patchLegalLinksIn(document);
    initWidgetLegalPatch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
