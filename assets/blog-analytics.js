/** Аналитика блога: загрузка счётчиков + цели CTA (см. analytics-events.js) */
(function () {
  function boot() {
    if (typeof window.psiLoadAnalytics === 'function') window.psiLoadAnalytics();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
