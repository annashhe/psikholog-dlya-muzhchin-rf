/**
 * Сдержанный motion: stagger карточек «С чем приходят»; шаги — только desktop.
 */
(function () {
  var DESKTOP_MIN = 901;

  function motionAllowed() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isDesktop() {
    return window.matchMedia('(min-width: ' + DESKTOP_MIN + 'px)').matches;
  }

  function observeReveal(root, selector) {
    var nodes = root.querySelectorAll(selector);
    if (!nodes.length) return;
    if (!motionAllowed() || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var idx = Number(el.getAttribute('data-motion-index') || 0);
          el.style.transitionDelay = idx * 70 + 'ms';
          el.classList.add('is-visible');
          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    nodes.forEach(function (el, i) {
      el.setAttribute('data-motion-index', String(i));
      io.observe(el);
    });
  }

  function initSpecGrid() {
    observeReveal(document, '.spec-card.motion-reveal');
  }

  function revealStepsImmediately(wrap) {
    wrap.classList.add('is-visible');
    wrap.querySelectorAll('.step.motion-reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  function initSteps() {
    var wrap = document.querySelector('.steps-wrap');
    if (!wrap) return;
    if (!isDesktop()) {
      revealStepsImmediately(wrap);
      return;
    }
    observeReveal(wrap, '.step.motion-reveal');
    if (!motionAllowed() || !('IntersectionObserver' in window)) {
      wrap.classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            wrap.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(wrap);
  }

  function init() {
    initSpecGrid();
    initSteps();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
