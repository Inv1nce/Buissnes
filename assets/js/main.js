/* =========================================================
   «На виду» — скрипты лендинга
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     НАСТРОЙКИ — поменяйте здесь свои контакты, и они
     подставятся во все кнопки и ссылки на странице.
     --------------------------------------------------------- */
  var CONFIG = {
    brand:    'На виду',
    telegram: 'na_vidu_ekb',          // ник без @
    whatsapp: '79000000000',          // только цифры, начиная с 7
    phone:    '+7 (900) 000-00-00',
    email:    'hello@navidu.ru'
  };

  var root = document.documentElement;
  root.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. Подставляем контакты в ссылки с data-contact
     --------------------------------------------------------- */
  function digits(value) {
    return String(value).replace(/\D/g, '');
  }

  function applyContacts() {
    document.querySelectorAll('[data-contact]').forEach(function (el) {
      var kind = el.getAttribute('data-contact');

      if (kind === 'telegram') {
        el.href = 'https://t.me/' + CONFIG.telegram;
      } else if (kind === 'whatsapp') {
        el.href = 'https://wa.me/' + digits(CONFIG.whatsapp);
      } else if (kind === 'phone') {
        el.href = 'tel:+' + digits(CONFIG.phone);
        if (el.dataset.keepText !== 'true') el.textContent = CONFIG.phone;
      } else if (kind === 'email') {
        el.href = 'mailto:' + CONFIG.email;
        if (el.textContent.indexOf('@') > -1) el.textContent = CONFIG.email;
      }
    });
  }

  /* ---------------------------------------------------------
     2. Мобильное меню
     --------------------------------------------------------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // закрываем после перехода по ссылке
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // закрываем по клику вне меню и по Esc
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // при возврате на десктоп сбрасываем состояние
    var desktop = window.matchMedia('(min-width: 900px)');
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------------------------------------------------------
     3. Тень у шапки при скролле
     --------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     4. Появление блоков при прокрутке
     --------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.slice.call(el.parentElement.children).filter(function (n) {
          return n.classList && n.classList.contains('reveal');
        });
        var delay = Math.min(siblings.indexOf(el), 4) * 70;
        setTimeout(function () { el.classList.add('is-in'); }, delay);
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------
     5. Липкая кнопка внизу на телефоне
     --------------------------------------------------------- */
  function initMobileCta() {
    var cta = document.getElementById('mobileCta');
    var hero = document.querySelector('.hero');
    var contact = document.getElementById('contact');
    if (!cta || !hero) return;

    var desktop = window.matchMedia('(min-width: 900px)');
    if (desktop.matches) return;

    cta.hidden = false;
    document.body.classList.add('has-mobile-cta');

    if (!('IntersectionObserver' in window)) {
      cta.classList.add('is-visible');
      return;
    }

    var pastHero = false;
    var inContact = false;

    function sync() {
      cta.classList.toggle('is-visible', pastHero && !inContact);
    }

    new IntersectionObserver(function (entries) {
      pastHero = !entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(hero);

    if (contact) {
      new IntersectionObserver(function (entries) {
        inContact = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.12 }).observe(contact);
    }
  }

  /* ---------------------------------------------------------
     6. Форма заявки
     Бэкенда нет: собираем аккуратное сообщение, копируем его
     в буфер и открываем выбранный мессенджер.
     --------------------------------------------------------- */
  function initForm() {
    var form = document.getElementById('auditForm');
    if (!form) return;

    var status = document.getElementById('formStatus');

    var RULES = {
      fName: 'Напишите, как к вам обращаться',
      fPlace: 'Без названия мы не найдём вашу карточку',
      fContact: 'Оставьте телефон или ник — иначе не сможем ответить'
    };

    function setError(field, message) {
      var wrap = field.closest('.field');
      var box = wrap.querySelector('.field-error');
      wrap.classList.toggle('has-error', Boolean(message));
      if (box) box.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validate() {
      var firstBad = null;

      Object.keys(RULES).forEach(function (id) {
        var field = document.getElementById(id);
        if (!field) return;
        var empty = field.value.trim().length < 2;
        setError(field, empty ? RULES[id] : '');
        if (empty && !firstBad) firstBad = field;
      });

      return firstBad;
    }

    // снимаем ошибку, как только человек начал исправлять
    form.addEventListener('input', function (e) {
      var field = e.target;
      if (field.closest('.field.has-error') && field.value.trim().length >= 2) {
        setError(field, '');
      }
    });

    function buildMessage(data) {
      var lines = [
        'Заявка на бесплатный аудит карточки',
        '',
        'Имя: ' + data.name,
        'Заведение: ' + data.place,
        'Связь: ' + data.contact
      ];
      if (data.link) lines.push('Карточка: ' + data.link);
      if (data.comment) lines.push('Вопрос: ' + data.comment);
      return lines.join('\n');
    }

    function copy(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(function () { return true; })
          .catch(function () { return false; });
      }
      return Promise.resolve(false);
    }

    function showStatus(html, state) {
      if (!status) return;
      status.innerHTML = html;
      status.hidden = false;
      status.setAttribute('data-state', state || 'ok');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = validate();
      if (firstBad) {
        showStatus('<p>Проверьте отмеченные поля — без них мы не сможем ответить.</p>', 'error');
        firstBad.focus();
        return;
      }

      var data = {
        name: document.getElementById('fName').value.trim(),
        place: document.getElementById('fPlace').value.trim(),
        contact: document.getElementById('fContact').value.trim(),
        link: document.getElementById('fLink').value.trim(),
        comment: document.getElementById('fComment').value.trim()
      };

      var channel = (form.querySelector('input[name="channel"]:checked') || {}).value || 'telegram';
      var message = buildMessage(data);

      copy(message).then(function (copied) {
        var url, where;

        if (channel === 'whatsapp') {
          url = 'https://wa.me/' + digits(CONFIG.whatsapp) + '?text=' + encodeURIComponent(message);
          where = 'WhatsApp';
        } else {
          url = 'https://t.me/' + CONFIG.telegram;
          where = 'Telegram';
        }

        var hint = channel === 'whatsapp'
          ? '<p class="copy-hint">Текст заявки уже подставлен — остаётся нажать «отправить».</p>'
          : '<p class="copy-hint">' + (copied
              ? 'Заявка скопирована — вставьте её в чат и отправьте.'
              : 'Скопируйте текст заявки из полей выше и вставьте в чат.') + '</p>';

        showStatus(
          '<p><strong>Открываем ' + where + '.</strong> Если окно не открылось, ' +
          'напишите нам напрямую: <a href="' + url + '" target="_blank" rel="noopener">' + where + '</a>.</p>' + hint,
          'ok'
        );

        window.open(url, '_blank', 'noopener');
      });
    });
  }

  /* ---------------------------------------------------------
     7. Год в подвале
     --------------------------------------------------------- */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --------------------------------------------------------- */
  applyContacts();
  initNav();
  initHeader();
  initReveal();
  initMobileCta();
  initForm();
  initYear();
})();
