(function (global) {
    'use strict';

    var MODAL_ID = 'psiValidationModal';
    var ERROR_CLASS = 'form-field-error';
    var WIDGET_ROOT = '[data-anna-psy-widget]';

    var FIELD_HINTS = {
        name: 'Укажите ваше имя',
        phone: 'Укажите телефон в формате +7 (900) 123-45-67',
        contactMethod: 'Выберите хотя бы один способ связи (Telegram, WhatsApp, MAX или SMS)',
        consent: 'Подтвердите согласие на обработку персональных данных',
        therapyType: 'Выберите формат консультации (50 мин, 90 мин или парная)',
        contactMethods: 'Выберите, как с вами связаться',
        comment: 'При необходимости уточните комментарий'
    };

    function $(id) {
        return document.getElementById(id);
    }

    function ensureModal() {
        var modal = $(MODAL_ID);
        if (modal) return modal;
        modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'diploma-modal consent-modal-layer psi-validation-layer';
        modal.setAttribute('role', 'alertdialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'psiValidationModalTitle');
        modal.innerHTML =
            '<div class="diploma-modal-inner legal-modal-inner psi-validation-modal">' +
            '<button type="button" class="diploma-modal-close" id="psiValidationModalClose" aria-label="Закрыть">&times;</button>' +
            '<h2 id="psiValidationModalTitle">Дозаполните форму</h2>' +
            '<ul id="psiValidationModalList" class="psi-validation-list"></ul>' +
            '<button type="button" class="btn btn-primary psi-validation-ok" id="psiValidationModalOk">Понятно</button>' +
            '</div>';
        document.body.appendChild(modal);

        function close() {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }

        modal.querySelector('#psiValidationModalClose').addEventListener('click', close);
        modal.querySelector('#psiValidationModalOk').addEventListener('click', close);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('open')) close();
        });

        return modal;
    }

    function showModal(opts) {
        var modal = ensureModal();
        var title = (opts && opts.title) || 'Дозаполните форму';
        var messages = (opts && opts.messages) || [];
        if (!messages.length && opts && opts.message) messages = [opts.message];

        $('psiValidationModalTitle').textContent = title;
        var list = $('psiValidationModalList');
        list.innerHTML = messages
            .map(function (m) {
                return '<li>' + escapeHtml(String(m)) + '</li>';
            })
            .join('');

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        var ok = $('psiValidationModalOk');
        if (ok) ok.focus();
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function clearFormErrors(form) {
        if (!form) return;
        form.querySelectorAll('.' + ERROR_CLASS).forEach(function (el) {
            el.classList.remove(ERROR_CLASS);
            el.removeAttribute('aria-invalid');
        });
    }

    function markError(el) {
        if (!el) return;
        el.classList.add(ERROR_CLASS);
        el.setAttribute('aria-invalid', 'true');
    }

    function fieldLabel(el) {
        if (!el) return 'поле';
        if (el.id) {
            var lab = document.querySelector('label[for="' + el.id + '"]');
            if (lab) return lab.textContent.replace(/\s+/g, ' ').trim();
        }
        var wrapLabel = el.closest('label');
        if (wrapLabel) return wrapLabel.textContent.replace(/\s+/g, ' ').trim();
        if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
        if (el.placeholder) return el.placeholder;
        var legend = el.closest('fieldset');
        if (legend) {
            var lg = legend.querySelector('legend');
            if (lg) return lg.textContent.trim();
        }
        return el.name || 'поле';
    }

    function messageForInvalidField(el) {
        var name = (el.name || el.id || '').toLowerCase();
        if (FIELD_HINTS[name]) {
            if (el.validity && el.validity.patternMismatch) {
                return el.title || FIELD_HINTS[name];
            }
            return FIELD_HINTS[name];
        }
        if (el.type === 'checkbox' && el.validity && el.validity.valueMissing) {
            return FIELD_HINTS.consent;
        }
        if (el.validity) {
            if (el.validity.valueMissing) return 'Заполните: «' + fieldLabel(el) + '»';
            if (el.validity.patternMismatch) return el.title || 'Проверьте формат: «' + fieldLabel(el) + '»';
            if (el.validity.typeMismatch) return 'Некорректный формат: «' + fieldLabel(el) + '»';
        }
        return 'Проверьте поле «' + fieldLabel(el) + '»';
    }

    function isManagedForm(form) {
        if (!form || form.tagName !== 'FORM') return false;
        if (form.id === 'callbackForm') return true;
        if (form.closest('#booking') || form.closest(WIDGET_ROOT)) return true;
        return false;
    }

    function collectInvalidMessages(form) {
        var messages = [];
        var seen = Object.create(null);
        var invalid = form.querySelectorAll(':invalid');
        invalid.forEach(function (el) {
            if (el.type === 'hidden' || el.closest('.hp-field')) return;
            var msg = messageForInvalidField(el);
            if (!seen[msg]) {
                seen[msg] = true;
                messages.push(msg);
            }
            markError(el);
            if (el.type === 'checkbox' && el.name === 'consent') {
                markError(el.closest('.checkbox-group'));
            }
        });
        return messages;
    }

    function validateCallbackForm(form) {
        clearFormErrors(form);
        var messages = [];
        var nameEl = form.querySelector('#formName');
        var phoneEl = form.querySelector('#formPhone');
        var consentEl = form.querySelector('#formConsent');
        var methodsFieldset = form.querySelector('.contact-methods');
        var consentGroup = form.querySelector('.checkbox-group');

        var name = nameEl ? nameEl.value.trim() : '';
        var phone = phoneEl ? phoneEl.value.trim() : '';
        var consent = consentEl ? consentEl.checked : false;
        var contactMethods = [];
        form.querySelectorAll('input[name="contactMethod"]:checked').forEach(function (el) {
            contactMethods.push(el.value);
        });

        if (!name) {
            messages.push(FIELD_HINTS.name);
            markError(nameEl);
        }
        if (!phone) {
            messages.push('Укажите номер телефона');
            markError(phoneEl);
        } else if (!/^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/.test(phone)) {
            messages.push(FIELD_HINTS.phone);
            markError(phoneEl);
        }
        if (contactMethods.length === 0) {
            messages.push(FIELD_HINTS.contactMethod);
            markError(methodsFieldset);
        }
        if (!consent) {
            messages.push(FIELD_HINTS.consent);
            markError(consentGroup || consentEl);
        }

        if (messages.length) {
            showModal({ title: 'Дозаполните форму обратной связи', messages: messages });
            var firstBad = form.querySelector('.' + ERROR_CLASS);
            if (firstBad && typeof firstBad.focus === 'function') {
                try {
                    firstBad.focus({ preventScroll: false });
                } catch (e1) {
                    firstBad.focus();
                }
            }
            return false;
        }
        return true;
    }

    function handleInvalidEvent(e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) {
            return;
        }
        var form = el.form || el.closest('form');
        if (!isManagedForm(form)) return;
        e.preventDefault();

        clearTimeout(handleInvalidEvent._t);
        handleInvalidEvent._t = setTimeout(function () {
            clearFormErrors(form);
            var messages = collectInvalidMessages(form);
            if (!messages.length) {
                messages = [messageForInvalidField(el)];
                markError(el);
            }
            showModal({
                title: form.id === 'callbackForm' ? 'Дозаполните форму обратной связи' : 'Дозаполните форму записи',
                messages: messages
            });
        }, 0);
    }

    function normalizeAlertMessage(msg) {
        return String(msg || '')
            .split(/\n+/)
            .map(function (line) {
                return line.trim();
            })
            .filter(Boolean);
    }

    function shouldBrandAlert(msg) {
        var s = String(msg || '');
        if (!s) return false;
        if (/^Не удалось отправить заявку|^Запись в календаре прошла|^Форма временно недоступна/i.test(s)) {
            return true;
        }
        return /пожалуйста|выберите|укажите|заполните|необходимо|дозаполн|формат|консультац|соглас|телефон|имя|способ связи/i.test(s);
    }

    function installAlertBridge() {
        if (global.__psiAlertBridgeInstalled) return;
        global.__psiAlertBridgeInstalled = true;
        var nativeAlert = global.alert.bind(global);
        global.alert = function (msg) {
            if (shouldBrandAlert(msg)) {
                var lines = normalizeAlertMessage(msg);
                var title = 'Обратите внимание';
                if (/пожалуйста|выберите|заполните|укажите|дозаполн|формат консультации/i.test(String(msg))) {
                    title = 'Дозаполните форму записи';
                }
                if (/^Не удалось отправить/i.test(String(msg))) title = 'Не удалось отправить';
                if (/^Запись в календаре прошла/i.test(String(msg))) title = 'Запись создана';
                showModal({ title: title, messages: lines.length ? lines : [String(msg)] });
                return;
            }
            nativeAlert(msg);
        };
    }

    function wireFormClearErrors(form) {
        if (!form || form.__psiValidationWired) return;
        form.__psiValidationWired = true;
        form.addEventListener('input', function (e) {
            var t = e.target;
            if (!t || !t.classList || !t.classList.contains(ERROR_CLASS)) return;
            t.classList.remove(ERROR_CLASS);
            t.removeAttribute('aria-invalid');
            if (t.name === 'consent') {
                var g = t.closest('.checkbox-group');
                if (g) g.classList.remove(ERROR_CLASS);
            }
        });
        form.addEventListener('change', function (e) {
            var t = e.target;
            if (t && t.name === 'contactMethod') {
                var fs = form.querySelector('.contact-methods');
                if (fs) fs.classList.remove(ERROR_CLASS);
            }
        });
    }

    function observeWidgetForms() {
        var root = document.querySelector(WIDGET_ROOT);
        if (!root) return;
        var apply = function () {
            root.querySelectorAll('form').forEach(wireFormClearErrors);
        };
        apply();
        if (global.MutationObserver) {
            new MutationObserver(apply).observe(root, { childList: true, subtree: true });
        }
    }

    function init() {
        ensureModal();
        installAlertBridge();
        document.addEventListener('invalid', handleInvalidEvent, true);

        var callback = document.getElementById('callbackForm');
        if (callback) wireFormClearErrors(callback);

        observeWidgetForms();
        if (global.MutationObserver) {
            new MutationObserver(observeWidgetForms).observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    global.psiFormValidation = {
        show: showModal,
        clearFormErrors: clearFormErrors,
        markError: markError,
        validateCallbackForm: validateCallbackForm
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
