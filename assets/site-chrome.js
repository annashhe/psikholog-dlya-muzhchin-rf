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
      '</nav></div></header>'
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
      '#about">Об Анне</a> · <a href="/blog/">Блог</a> · <a href="/oferta/" target="_blank" rel="noopener">Публичная оферта</a> · <a href="/privacy-policy/" target="_blank" rel="noopener">Политика конфиденциальности</a> · <a href="/consent/" target="_blank" rel="noopener">Согласие на обработку данных</a>' +
      '</p>' +
      '<p style="margin:0;font-size:0.8rem;">Сайт носит информационный характер и не заменяет очную консультацию специалиста. Материалы не являются медицинской услугой и не содержат гарантий результата. · 18+</p>' +
      '</div></footer>'
    );
  };

  global.renderBlogCta = function () {
    return (
      '<div class="psi-blog-cta">' +
      '<p>Если после статьи хотите разобрать свою ситуацию — можно записаться на онлайн-консультацию в календаре на главной.</p>' +
      '<div class="psi-blog-cta-btns">' +
      '<a href="' +
      SITE +
      '#booking" class="psi-btn psi-btn-primary">Записаться на консультацию</a>' +
      '</div>' +
      '<p class="psi-blog-cta-note">Очно в Калининграде — по записи через <a href="' +
      SITE +
      '#contact">раздел «Свяжитесь со мной»</a> (календарь только для онлайн).</p>' +
      '</div>'
    );
  };

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
      blogCtaEl.innerHTML = global.renderBlogCta();
    }
  };

  function bootChrome() {
    global.mountPsiChrome();
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
