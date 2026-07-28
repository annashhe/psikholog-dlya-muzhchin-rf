/** Единая шапка, подвал и CTA блога */
(function (global) {
  var SITE = (global.PSI_SITE_HOME || 'https://психолог-для-мужчин.рф/').replace(/\/?$/, '/');

  global.renderPsiHeader = function (opts) {
    opts = opts || {};
    var backOnly = opts.minimal;
    if (backOnly) {
      return (
        '<header class="psi-chrome-header">' +
        '<div class="psi-chrome-inner">' +
        '<a href="' +
        SITE +
        '" class="psi-chrome-brand">Анна Щеголихина <span>·</span> Психолог</a>' +
        '<a href="' +
        SITE +
        '" class="psi-chrome-back">← На главную</a>' +
        '</div></header>'
      );
    }
    return (
      '<header class="psi-chrome-header">' +
      '<div class="psi-chrome-inner">' +
      '<a href="' +
      SITE +
      '" class="psi-chrome-brand">Анна Щеголихина <span>·</span> Психолог</a>' +
      '<nav class="psi-chrome-nav" aria-label="Навигация">' +
      '<a href="' +
      SITE +
      '#spec">Запросы</a>' +
      '<a href="' +
      SITE +
      '#reviews">Отзывы</a>' +
      '<a href="' +
      SITE +
      '#pricing">Услуги</a>' +
      '<a href="/blog/">Блог</a>' +
      '<a href="' +
      SITE +
      '#contact">Контакты</a>' +
      '<a href="tel:+79137556284" class="psi-chrome-phone">+7 913 755 62 84</a>' +
      '<a href="' +
      SITE +
      '#booking" class="psi-btn psi-btn-primary">Записаться онлайн</a>' +
      '</nav>' +
      '<button type="button" class="psi-chrome-burger" id="psiChromeBurger" aria-label="Открыть меню" aria-expanded="false" aria-controls="psiChromeMobileNav">' +
      '<span></span><span></span><span></span>' +
      '</button>' +
      '</div>' +
      '<nav class="psi-chrome-mobile-nav" id="psiChromeMobileNav" aria-label="Мобильная навигация" hidden>' +
      '<a href="' +
      SITE +
      '#spec">Запросы</a>' +
      '<a href="' +
      SITE +
      '#reviews">Отзывы</a>' +
      '<a href="' +
      SITE +
      '#pricing">Услуги и цены</a>' +
      '<a href="/blog/">Блог</a>' +
      '<a href="' +
      SITE +
      '#contact">Контакты</a>' +
      '<a href="tel:+79137556284" class="psi-chrome-mobile-phone">+7 913 755 62 84</a>' +
      '<a href="' +
      SITE +
      '#booking" class="psi-chrome-mobile-cta">Записаться онлайн</a>' +
      '</nav></header>'
    );
  };

  global.renderPsiFooter = function () {
    return (
      '<footer class="psi-chrome-footer" role="contentinfo">' +
      '<div class="psi-chrome-inner">' +
      '<nav class="psi-chrome-footer-nav" aria-label="Нижняя навигация">' +
      '<a href="' +
      SITE +
      '#spec">Запросы</a>' +
      '<a href="' +
      SITE +
      '#reviews">Отзывы</a>' +
      '<a href="' +
      SITE +
      '#pricing">Услуги и цены</a>' +
      '<a href="/blog/">Блог</a>' +
      '<a href="' +
      SITE +
      '#contact">Контакты</a>' +
      '<a href="' +
      SITE +
      '#booking">Записаться онлайн</a>' +
      '</nav>' +
      '<p style="margin:0 0 0.5rem;">© 2026 Анна Щеголихина — клинический и семейный психолог</p>' +
      '<p style="margin:0 0 0.75rem;">Исполнитель: Щеголихина Анна Михайловна, самозанятая (плательщик НПД) · тел. <a href="tel:+79137556284">+7 913 755 62 84</a> · e-mail <a href="mailto:anna-psy-online@yandex.ru">anna-psy-online@yandex.ru</a> · Калининград, ул. Кирова, 1 (очно по записи)</p>' +
      '<p style="margin:0 0 0.75rem;">' +
      '<a href="' +
      SITE +
      '">Психолог для мужчин онлайн</a> · <a href="' +
      SITE +
      '#about">Об Анне</a> · <a href="/blog/">Блог</a> · <a href="/oferta/" target="_blank" rel="noopener">Публичная оферта</a> · <a href="/privacy-policy/" target="_blank" rel="noopener">Политика конфиденциальности</a> · <a href="/consent/" target="_blank" rel="noopener">Согласие на обработку данных</a> · <a href="#" class="js-cookie-settings">Настройки cookie</a>' +
      '</p>' +
      '<p style="margin:0;font-size:0.8rem;">Сайт носит информационный характер и не заменяет очную консультацию специалиста. Материалы не являются медицинской услугой и не содержат гарантий результата. · 18+</p>' +
      '</div></footer>'
    );
  };

  global.renderBlogCta = function () {
    return (
      '<div class="psi-blog-cta">' +
      '<p class="psi-blog-cta-lead">Статья носит ознакомительный характер. Чтобы разобрать именно вашу ситуацию — запишитесь на консультацию.</p>' +
      '<div class="psi-blog-cta-btns">' +
      '<a href="' +
      SITE +
      '#booking" class="psi-btn psi-btn-primary psi-btn-lg">Записаться онлайн</a>' +
      '<a href="' +
      SITE +
      '#contact" class="psi-btn psi-btn-outline psi-btn-lg">Очно в Калининграде</a>' +
      '</div>' +
      '</div>'
    );
  };

  function bindPsiChromeBurger() {
    var burger = document.getElementById('psiChromeBurger');
    var mobileNav = document.getElementById('psiChromeMobileNav');
    if (!burger || !mobileNav) return;

    function setOpen(isOpen) {
      burger.classList.toggle('open', isOpen);
      mobileNav.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
      if (isOpen) mobileNav.removeAttribute('hidden');
      else mobileNav.setAttribute('hidden', '');
      document.body.classList.toggle('psi-chrome-nav-open', isOpen);
    }

    burger.addEventListener('click', function () {
      setOpen(!mobileNav.classList.contains('open'));
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) setOpen(false);
    });
  }

  function bindPsiChromeHeaderScroll() {
    var header = document.querySelector('.psi-chrome-header');
    if (!header) return;
    var mobileNav = document.getElementById('psiChromeMobileNav');
    var lastY = global.scrollY || 0;
    var ticking = false;
    var releaseTimer = null;

    function show() {
      header.classList.remove('header-hidden');
    }

    function hide() {
      header.classList.add('header-hidden');
    }

    function update() {
      ticking = false;
      var y = global.scrollY || 0;
      if (global.innerWidth > 900) {
        show();
        lastY = y;
        return;
      }
      if (mobileNav && mobileNav.classList.contains('open')) {
        show();
        lastY = y;
        return;
      }
      if (y <= 64) {
        show();
        lastY = y;
        return;
      }
      var delta = y - lastY;
      if (delta > 1) hide();
      if (delta < -1) show();
      lastY = y;
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      global.requestAnimationFrame(update);
    }

    global.addEventListener('scroll', schedule, { passive: true });
    global.addEventListener('touchmove', schedule, { passive: true });
    global.addEventListener('wheel', schedule, { passive: true });
    global.addEventListener('touchend', function () {
      if (releaseTimer) global.clearTimeout(releaseTimer);
      releaseTimer = global.setTimeout(function () {
        if (global.innerWidth > 900) return;
        if (mobileNav && mobileNav.classList.contains('open')) return;
        show();
      }, 160);
    }, { passive: true });
    global.addEventListener('resize', function () {
      show();
      lastY = global.scrollY || 0;
    });

    update();
  }

  global.mountPsiChrome = function () {
    var headerEl = document.getElementById('psi-chrome-header');
    var footerEl = document.getElementById('psi-chrome-footer');
    var blogCtaEl = document.getElementById('psi-blog-cta');
    var minimal = document.body && document.body.getAttribute('data-psi-header') === 'minimal';
    if (headerEl && typeof global.renderPsiHeader === 'function') {
      headerEl.outerHTML = global.renderPsiHeader({ minimal: minimal });
    }
    if (footerEl && typeof global.renderPsiFooter === 'function') {
      footerEl.outerHTML = global.renderPsiFooter();
    }
    if (blogCtaEl && typeof global.renderBlogCta === 'function') {
      if (!blogCtaEl.querySelector('.psi-blog-cta')) {
        blogCtaEl.innerHTML = global.renderBlogCta();
      }
    }
    if (document.body) {
      document.body.classList.add('psi-chrome-has-fixed-header');
    }
    bindPsiChromeBurger();
    bindPsiChromeHeaderScroll();
  };

  function bootChrome() {
    global.mountPsiChrome();
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.closest && t.closest('.js-cookie-settings')) {
        e.preventDefault();
        if (typeof global.psiOpenCookieSettings === 'function') {
          global.psiOpenCookieSettings();
        }
      }
    });
    if (typeof global.mountPsiCookieNotice === 'function') {
      global.mountPsiCookieNotice();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootChrome);
  } else {
    bootChrome();
  }
})(window);
