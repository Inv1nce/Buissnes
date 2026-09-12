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
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    function showAll() {
      document.documentElement.removeAttribute('data-anim');
      items.forEach(function (el) { el.classList.add('is-in'); });
    }

    if (reduceMotion || !('IntersectionObserver' in window)) { showAll(); return; }

    // Страница может быть встроена в высокий iframe, который сам не скроллится
    // (так работает просмотрщик артефактов). Тогда наблюдатель не сработает —
    // и прятать что-либо нельзя, иначе контента просто не будет видно.
    if (document.documentElement.scrollHeight <= window.innerHeight + 8) { showAll(); return; }

    document.documentElement.setAttribute('data-anim', 'on');

    var vh = window.innerHeight || 800;
    var pending = [];
    items.forEach(function (el) {
      // то, что уже на экране, показываем сразу — первый экран всегда полный
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-in');
      else pending.push(el);
    });

    if (!pending.length) return;

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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    pending.forEach(function (el) { observer.observe(el); });

    // подстраховка: если наблюдатель по любой причине молчит, показываем всё
    window.setTimeout(showAll, 3000);
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
    var w = 0, h = 0, dpr = 1, cell = 76;
    var streets = [], routes = [];
    var raf = null, last = 0, wasVisible = true;

    var COLORS = ['#C4F82A', '#35E0FF', '#FF3D8B'];

    function rand(min, max) { return min + Math.random() * (max - min); }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    /* Маршрут идёт по клеткам, как по улицам: только повороты под прямым углом */
    function makeRoute() {
      var cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      var x = Math.floor(rand(0, cols)), y = Math.floor(rand(0, rows));
      var pts = [{ x: x * cell, y: y * cell }];
      var horizontal = Math.random() < 0.5;
      var legs = Math.floor(rand(4, 8));

      for (var i = 0; i < legs; i++) {
        var span = Math.floor(rand(1, 4)) * (Math.random() < 0.5 ? -1 : 1);
        if (horizontal) x = Math.max(0, Math.min(cols, x + span));
        else y = Math.max(0, Math.min(rows, y + span));
        var next = { x: x * cell, y: y * cell };
        var prev = pts[pts.length - 1];
        if (next.x !== prev.x || next.y !== prev.y) pts.push(next);
        horizontal = !horizontal;
      }
      if (pts.length < 3) return makeRoute();

      var lengths = [], total = 0;
      for (var j = 1; j < pts.length; j++) {
        var d = Math.abs(pts[j].x - pts[j - 1].x) + Math.abs(pts[j].y - pts[j - 1].y);
        lengths.push(d);
        total += d;
      }

      return {
        pts: pts,
        lengths: lengths,
        total: total,
        color: pick(COLORS),
        drawn: 0,
        speed: rand(90, 165),      // пикселей в секунду
        hold: 0,
        holdFor: rand(1.1, 2.4),
        fade: 1,
        phase: 'draw'
      };
    }

    function build() {
      cell = w < 620 ? 58 : 82;
      streets = [];
      for (var x = 0; x <= w + cell; x += cell) streets.push({ v: true, p: x, big: Math.random() < 0.22 });
      for (var y = 0; y <= h + cell; y += cell) streets.push({ v: false, p: y, big: Math.random() < 0.22 });

      routes = [];
      var count = w < 620 ? 3 : (w < 1100 ? 5 : 7);
      for (var i = 0; i < count; i++) {
        var route = makeRoute();
        route.drawn = reduceMotion ? route.total : rand(0, route.total * 0.8);
        routes.push(route);
      }
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      render();
    }

    /* Рисуем маршрут до заданной длины, возвращаем точку «головы» */
    function strokeRoute(route, upTo, width, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = route.color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(route.pts[0].x, route.pts[0].y);

      var left = upTo, head = route.pts[0];
      for (var i = 0; i < route.lengths.length; i++) {
        var a = route.pts[i], b = route.pts[i + 1], len = route.lengths[i];
        if (left >= len) {
          ctx.lineTo(b.x, b.y);
          head = b;
          left -= len;
        } else {
          var k = len ? left / len : 0;
          head = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
          ctx.lineTo(head.x, head.y);
          left = 0;
          break;
        }
      }
      ctx.stroke();
      ctx.restore();
      return head;
    }

    function marker(x, y, color, alpha, r) {
      ctx.save();
      ctx.globalAlpha = alpha;
      var halo = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
      halo.addColorStop(0, color + '66');
      halo.addColorStop(1, color + '00');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, r * 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function render() {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      // сетка улиц
      ctx.lineCap = 'butt';
      streets.forEach(function (street) {
        ctx.beginPath();
        ctx.strokeStyle = street.big ? 'rgba(150,180,255,.11)' : 'rgba(150,180,255,.055)';
        ctx.lineWidth = street.big ? 2 : 1;
        if (street.v) { ctx.moveTo(street.p, 0); ctx.lineTo(street.p, h); }
        else { ctx.moveTo(0, street.p); ctx.lineTo(w, street.p); }
        ctx.stroke();
      });

      // маршруты: широкий мягкий след + яркая линия + светящаяся голова
      routes.forEach(function (route) {
        var a = route.fade;
        strokeRoute(route, route.drawn, 9, 0.12 * a);
        var head = strokeRoute(route, route.drawn, 2.2, 0.85 * a);

        marker(route.pts[0].x, route.pts[0].y, route.color, 0.5 * a, 2.4);

        if (route.phase === 'draw') {
          marker(head.x, head.y, route.color, 0.95 * a, 3.4);
        } else {
          // маршрут построен — ставим метку назначения
          var end = route.pts[route.pts.length - 1];
          marker(end.x, end.y, route.color, 0.95 * a, 4);
          ctx.save();
          ctx.globalAlpha = 0.5 * a;
          ctx.strokeStyle = route.color;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(end.x, end.y, 9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    function step(dt) {
      routes.forEach(function (route, i) {
        if (route.phase === 'draw') {
          route.drawn += route.speed * dt;
          if (route.drawn >= route.total) { route.drawn = route.total; route.phase = 'hold'; }
        } else if (route.phase === 'hold') {
          route.hold += dt;
          if (route.hold >= route.holdFor) route.phase = 'fade';
        } else {
          route.fade -= dt * 0.9;
          if (route.fade <= 0) routes[i] = makeRoute();
        }
      });
    }

    function loop(now) {
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      step(dt);
      render();
      raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (raf || reduceMotion) return;
      last = 0;
      raf = window.requestAnimationFrame(loop);
    }
    function stop() {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    start();   // стартуем сразу: наблюдатель в некоторых окружениях молчит

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (wasVisible) start();
    });

    // наблюдатель только останавливает анимацию за пределами экрана,
    // и только если он вообще работает в этом окружении
    if ('IntersectionObserver' in window) {
      var seen = false;
      new IntersectionObserver(function (entries) {
        var visible = entries[0].isIntersecting;
        if (visible) seen = true;
        if (!seen) return;
        wasVisible = visible;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
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
     10. Подсветка карточек под курсором (только мышь)
     --------------------------------------------------------- */
  function initSpotlight() {
    if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---------------------------------------------------------
     11. Год в подвале
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
  initSpotlight();
  initYear();
})();
