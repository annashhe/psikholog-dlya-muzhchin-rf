/** Лёгкая аналитика для блога: только после согласия cookieConsentV1=1 */
(function () {
  function boot() {
    if (typeof window.psiLoadAnalytics === 'function') window.psiLoadAnalytics();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link || typeof window.psiMetrikaGoal !== 'function') return;
    var href = link.getAttribute('href') || '';
    if (href.indexOf('#booking') !== -1 || /\/#booking/.test(href)) {
      window.psiMetrikaGoal('click_blog_cta');
    }
  });
})();
