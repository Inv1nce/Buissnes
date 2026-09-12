/* =========================================================
   CA Group — скрипты лендинга
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     НАСТРОЙКИ — поменяйте здесь свои контакты, и они
     подставятся во все кнопки и ссылки на странице.
     --------------------------------------------------------- */
  var CONFIG = {
    brand:    'CA Group',
    telegram: 'cagroup_ekb',          // ник без @
    whatsapp: '79000000000',          // только цифры, начиная с 7
    phone:    '+7 (900) 000-00-00',
    email:    'hello@cagroup.ru'
  };

  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopMQ = window.matchMedia('(min-width: 940px)');

  function onMQ(mq, handler) {
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  function digits(value) { return String(value).replace(/\D/g, ''); }

  /* ---------------------------------------------------------
     1. Контакты в ссылках с data-contact
     --------------------------------------------------------- */
  function applyContacts() {
    document.querySelectorAll('[data-contact]').forEach(function (el) {
      var kind = el.getAttribute('data-contact');

      if (kind === 'telegram') {
        el.href = 'https://t.me/' + CONFIG.telegram;
      } else if (kind === 'whatsapp') {
        el.href = 'https://wa.me/' + digits(CONFIG.whatsapp);
      } else if (kind === 'phone') {
        el.href = 'tel:+' + digits(CONFIG.phone);
        if (el.textContent.indexOf('+') > -1) el.textContent = CONFIG.phone;
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

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    onMQ(desktopMQ, function (e) { if (e.matches) setOpen(false); });
  }

  /* ---------------------------------------------------------
     3. Шапка при скролле
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
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
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
        var delay = Math.min(siblings.indexOf(el), 5) * 65;
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
    if (!cta || !hero || desktopMQ.matches) return;

    cta.hidden = false;
    document.body.classList.add('has-mobile-cta');

    if (!('IntersectionObserver' in window)) {
      cta.classList.add('is-visible');
      return;
    }

    var pastHero = false, inContact = false;
    function sync() { cta.classList.toggle('is-visible', pastHero && !inContact); }

    new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting; sync(); },
      { threshold: 0 }).observe(hero);

    if (contact) {
      new IntersectionObserver(function (e) { inContact = e[0].isIntersecting; sync(); },
        { threshold: 0.12 }).observe(contact);
    }
  }

  /* ---------------------------------------------------------
     6. Бегущая строка: дублируем содержимое для бесшовной петли
     --------------------------------------------------------- */
  function initMarquee() {
    var track = document.querySelector('.marquee-track');
    if (!track) return;
    track.innerHTML += track.innerHTML;
  }

  /* ---------------------------------------------------------
     7. Ночная карта в шапке (canvas)
     Сетка улиц и светящиеся метки — фон, не данные.
     --------------------------------------------------------- */
  function initHeroCanvas() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1;
    var roads = [], pins = [];
    var raf = null, t = 0, visible = true;

    function rand(min, max) { return min + Math.random() * (max - min); }

    function build() {
      roads = [];
      pins = [];

      var stepX = Math.max(70, w / 9);
      var stepY = Math.max(70, h / 7);

      for (var x = -stepX; x < w + stepX * 2; x += stepX) {
        roads.push({ v: true, p: x + rand(-14, 14), big: Math.random() < 0.28 });
      }
      for (var y = -stepY; y < h + stepY * 2; y += stepY) {
        roads.push({ v: false, p: y + rand(-14, 14), big: Math.random() < 0.28 });
      }

      var palette = ['#C4F82A', '#35E0FF', '#FF3D8B'];
      var count = w < 620 ? 7 : 12;
      // на широком экране держим метки правее — там, где нет текста
      var minX = w >= 940 ? 0.42 : 0.04;
      for (var i = 0; i < count; i++) {
        pins.push({
          x: rand(minX, 0.96) * w,
          y: rand(0.08, 0.92) * h,
          color: palette[i % palette.length],
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.5, 1.1),
          r: rand(2.2, 3.6)
        });
      }
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      draw(0);
    }

    function draw(time) {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      // улицы
      var drift = reduceMotion ? 0 : (time * 0.006) % 60;
      ctx.lineCap = 'round';
      roads.forEach(function (road) {
        ctx.beginPath();
        ctx.strokeStyle = road.big ? 'rgba(150,180,255,.13)' : 'rgba(150,180,255,.07)';
        ctx.lineWidth = road.big ? 2.2 : 1;
        if (road.v) {
          var x = road.p + drift * 0.4;
          ctx.moveTo(x, -20);
          ctx.lineTo(x, h + 20);
        } else {
          var y = road.p - drift * 0.25;
          ctx.moveTo(-20, y);
          ctx.lineTo(w + 20, y);
        }
        ctx.stroke();
      });

      // метки
      pins.forEach(function (pin) {
        var pulse = reduceMotion ? 0.5
          : (Math.sin(time * 0.0016 * pin.speed + pin.phase) + 1) / 2;

        // ореол
        var halo = ctx.createRadialGradient(pin.x, pin.y, 0, pin.x, pin.y, 22 + pulse * 12);
        halo.addColorStop(0, pin.color + '55');
        halo.addColorStop(1, pin.color + '00');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, 22 + pulse * 12, 0, Math.PI * 2);
        ctx.fill();

        // кольцо
        ctx.beginPath();
        ctx.strokeStyle = pin.color + '66';
        ctx.lineWidth = 1.2;
        ctx.arc(pin.x, pin.y, 7 + pulse * 7, 0, Math.PI * 2);
        ctx.stroke();

        // точка
        ctx.beginPath();
        ctx.fillStyle = pin.color;
        ctx.arc(pin.x, pin.y, pin.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function loop(now) {
      t = now;
      draw(t);
      raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (raf || reduceMotion) return;
      raf = window.requestAnimationFrame(loop);
    }
    function stop() {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = null;
    }

    resize();

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (visible) start();
    });

    // не крутим анимацию, когда шапка ушла с экрана
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    } else {
      start();
    }
  }

  /* ---------------------------------------------------------
     8. Экспресс-проверка карточки
     Считаем только то, что отметил сам посетитель.
     --------------------------------------------------------- */
  var auditScore = null;

  function initCheck() {
    var form = document.getElementById('checkForm');
    var ring = document.getElementById('gaugeValue');
    var num = document.getElementById('gaugeNum');
    var verdict = document.getElementById('gaugeVerdict');
    var summary = document.getElementById('checkSummary');
    if (!form || !ring || !num) return;

    var GROUPS = [
      { key: 'info',   name: 'Информация' },
      { key: 'photo',  name: 'Фото' },
      { key: 'review', name: 'Отзывы' },
      { key: 'live',   name: 'Активность' }
    ];

    var CIRCUMFERENCE = 2 * Math.PI * 70;   // r = 70 в разметке
    var boxes = form.querySelectorAll('input[type="checkbox"]');
    var shown = 0, numAnim = null, touched = false;

    function verdictFor(score) {
      if (!touched) return 'Отметьте пункты слева — посчитаем';
      if (score < 38) return 'Карточку почти не видно';
      if (score < 63) return 'Есть заметные пробелы';
      if (score < 88) return 'Неплохо, но есть что добрать';
      return 'Сильная карточка — держите так';
    }

    function animateNumber(to) {
      if (reduceMotion) { num.textContent = String(to); shown = to; return; }
      if (numAnim) window.cancelAnimationFrame(numAnim);
      var from = shown, start = null, dur = 500;
      function step(ts) {
        if (start === null) start = ts;
        var k = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - k, 3);
        shown = Math.round(from + (to - from) * eased);
        num.textContent = String(shown);
        if (k < 1) numAnim = window.requestAnimationFrame(step);
        else { shown = to; num.textContent = String(to); numAnim = null; }
      }
      numAnim = window.requestAnimationFrame(step);
    }

    function update() {
      var total = 0, parts = [];

      GROUPS.forEach(function (group) {
        var inGroup = form.querySelectorAll('input[data-group="' + group.key + '"]');
        var checked = form.querySelectorAll('input[data-group="' + group.key + '"]:checked');
        var pct = inGroup.length ? Math.round(checked.length / inGroup.length * 100) : 0;
        total += checked.length;

        var fill = document.querySelector('[data-bar="' + group.key + '"]');
        var value = document.querySelector('[data-value="' + group.key + '"]');
        if (fill) fill.style.width = pct + '%';
        if (value) value.textContent = pct + '%';
        parts.push(group.name + ' ' + pct + '%');
      });

      var score = boxes.length ? Math.round(total / boxes.length * 100) : 0;
      auditScore = touched ? score : null;

      ring.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - score / 100));
      animateNumber(score);
      if (verdict) verdict.textContent = verdictFor(score);
      if (summary) {
        summary.textContent = touched
          ? 'Оценка ' + score + ' из 100. ' + parts.join(', ') + '.'
          : '';
      }
    }

    // задаём длину окружности программно, чтобы разметка и радиус не разъезжались
    ring.style.strokeDasharray = String(CIRCUMFERENCE);
    ring.style.strokeDashoffset = String(CIRCUMFERENCE);

    form.addEventListener('change', function () {
      touched = true;
      update();
    });

    // сбрасываем состояние после перезагрузки с автозаполнением
    boxes.forEach(function (box) { box.checked = false; });
    update();
  }

  /* ---------------------------------------------------------
     9. Форма заявки
     Бэкенда нет: собираем сообщение, копируем в буфер
     и открываем мессенджер по тому, что человек указал.
     --------------------------------------------------------- */
  function initForm() {
    var form = document.getElementById('auditForm');
    if (!form) return;

    var status = document.getElementById('formStatus');

    var RULES = {
      fName: 'Напишите, как к вам обращаться',
      fPlace: 'Без названия или адреса мы не найдём вашу карточку',
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

    form.addEventListener('input', function (e) {
      var field = e.target;
      if (field.closest('.field.has-error') && field.value.trim().length >= 2) setError(field, '');
    });

    // куда отвечать, решаем по тому, что человек написал в «способе связи»
    function channelFor(contact) {
      var text = contact.toLowerCase();
      if (text.indexOf('@') > -1 || text.indexOf('t.me') > -1 || text.indexOf('telegram') > -1) return 'telegram';
      if (text.indexOf('whatsapp') > -1 || text.indexOf('вацап') > -1 || text.indexOf('ватсап') > -1) return 'whatsapp';
      if (digits(contact).length >= 10) return 'whatsapp';
      return 'telegram';
    }

    function buildMessage(data) {
      var lines = [
        'Заявка на бесплатный аудит карточки',
        '',
        'Имя: ' + data.name,
        'Заведение: ' + data.place,
        'Связь: ' + data.contact
      ];
      if (auditScore !== null) lines.push('Экспресс-проверка на сайте: ' + auditScore + ' из 100');
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
        contact: document.getElementById('fContact').value.trim()
      };

      var channel = channelFor(data.contact);
      var message = buildMessage(data);

      copy(message).then(function (copied) {
        var url, where, hint;

        if (channel === 'whatsapp') {
          url = 'https://wa.me/' + digits(CONFIG.whatsapp) + '?text=' + encodeURIComponent(message);
          where = 'WhatsApp';
          hint = 'Текст заявки уже подставлен — остаётся нажать «отправить».';
        } else {
          url = 'https://t.me/' + CONFIG.telegram;
          where = 'Telegram';
          hint = copied
            ? 'Заявка скопирована — вставьте её в чат и отправьте.'
            : 'Скопируйте заявку из полей выше и вставьте в чат.';
        }

        showStatus(
          '<p><strong>Открываем ' + where + '.</strong> Если окно не открылось, ' +
          'напишите нам напрямую: <a href="' + url + '" target="_blank" rel="noopener">' + where + '</a>.</p>' +
          '<p class="copy-hint">' + hint + '</p>',
          'ok'
        );

        window.open(url, '_blank', 'noopener');
      });
    });
  }

  /* ---------------------------------------------------------
     10. Год в подвале
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
  initMarquee();
  initHeroCanvas();
  initCheck();
  initForm();
  initYear();
})();
