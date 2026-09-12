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

  var root = document.documentElement;
  root.classList.remove('no-js');

  var desktopMQ = window.matchMedia('(min-width: 940px)');
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Движение разрешено, если система его не запрещает
     ИЛИ посетитель включил его кнопкой в шапке. */
  function motionOn() {
    return !reduceMQ.matches || root.getAttribute('data-motion') === 'on';
  }

  function onMQ(mq, handler) {
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  function digits(value) { return String(value).replace(/\D/g, ''); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* Один общий обработчик прокрутки — дешевле, чем пять разных */
  var scrollJobs = [];
  function onScroll(fn) { scrollJobs.push(fn); }

  var ticking = false;
  function runScrollJobs() {
    ticking = false;
    for (var i = 0; i < scrollJobs.length; i++) scrollJobs[i]();
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(runScrollJobs); }
  }, { passive: true });

  var resizeJobs = [];
  function onResize(fn) { resizeJobs.push(fn); }
  var resizeTimer;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      for (var i = 0; i < resizeJobs.length; i++) resizeJobs[i]();
      runScrollJobs();
    }, 160);
  });

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
     2. Переключатель движения
     Показываем только тем, у кого анимация выключена системно —
     иначе они увидят статичную картинку и решат, что сайт сломан.
     --------------------------------------------------------- */
  function initMotionToggle() {
    var toggle = document.getElementById('motionToggle');
    if (!toggle) return;

    var saved = null;
    try { saved = window.localStorage.getItem('ca-motion'); } catch (e) { saved = null; }
    if (saved === 'on') root.setAttribute('data-motion', 'on');

    function sync() {
      var systemOff = reduceMQ.matches;
      toggle.hidden = !systemOff;
      var on = root.getAttribute('data-motion') === 'on';
      toggle.setAttribute('aria-pressed', String(on));
      toggle.querySelector('.motion-label').textContent = on ? 'Анимация вкл.' : 'Анимация';
    }

    toggle.addEventListener('click', function () {
      var on = root.getAttribute('data-motion') === 'on';
      if (on) root.removeAttribute('data-motion');
      else root.setAttribute('data-motion', 'on');
      try { window.localStorage.setItem('ca-motion', on ? 'off' : 'on'); } catch (e) { /* приватный режим */ }
      sync();
      document.dispatchEvent(new CustomEvent('ca:motion'));
    });

    onMQ(reduceMQ, sync);
    sync();
  }

  /* ---------------------------------------------------------
     3. Мобильное меню
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
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    onMQ(desktopMQ, function (e) { if (e.matches) setOpen(false); });
  }

  /* ---------------------------------------------------------
     4. Шапка при прокрутке
     --------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    onScroll(function () { header.classList.toggle('is-scrolled', window.scrollY > 8); });
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  /* ---------------------------------------------------------
     5. Появление блоков
     Контент виден по умолчанию: прячем только если убедились,
     что документ прокручивается сам и наблюдатель сработает.
     --------------------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    function showAll() {
      root.removeAttribute('data-anim');
      items.forEach(function (el) { el.classList.add('is-in'); });
    }

    if (!motionOn() || !('IntersectionObserver' in window)) { showAll(); return; }
    if (root.scrollHeight <= window.innerHeight + 8) { showAll(); return; }

    root.setAttribute('data-anim', 'on');

    var vh = window.innerHeight || 800;
    var pending = [];
    items.forEach(function (el) {
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
    window.setTimeout(showAll, 3000);
  }

  /* ---------------------------------------------------------
     6. Липкая кнопка внизу на телефоне
     --------------------------------------------------------- */
  function initMobileCta() {
    var cta = document.getElementById('mobileCta');
    var hero = document.querySelector('.hero');
    var contact = document.getElementById('contact');
    if (!cta || !hero || desktopMQ.matches) return;

    cta.hidden = false;
    document.body.classList.add('has-mobile-cta');

    onScroll(function () {
      var heroBottom = hero.offsetTop + hero.offsetHeight;
      var contactTop = contact ? contact.offsetTop : Infinity;
      var y = window.scrollY;
      var show = y > heroBottom - 120 && y + window.innerHeight < contactTop + 200;
      cta.classList.toggle('is-visible', show);
    });
  }

  /* ---------------------------------------------------------
     7. Бегущая строка
     --------------------------------------------------------- */
  function initMarquee() {
    var track = document.querySelector('.marquee-track');
    if (track) track.innerHTML += track.innerHTML;
  }

  /* ---------------------------------------------------------
     8. Маршрут через страницу и крестик
     Пунктир идёт сверху вниз по полю страницы и прорисовывается
     по мере прокрутки. В конце — красный крестик у формы заявки.
     --------------------------------------------------------- */
  var routeEnd = { x: 0, y: 0 };

  function initRoute() {
    var layer = document.getElementById('routeLayer');
    var svg = document.getElementById('routeSvg');
    var ghost = document.getElementById('routeGhost');
    var path = document.getElementById('routePath');
    var mask = document.getElementById('routeMaskPath');
    var cross = document.getElementById('routeX');
    var formCard = document.getElementById('formCard');
    if (!layer || !svg || !path || !formCard) return;

    var startY = 0, endY = 0;

    function build() {
      // меряем высоту страницы БЕЗ самого слоя, иначе он меряет сам себя
      layer.style.height = '0px';
      var docH = Math.max(document.body.scrollHeight, root.scrollHeight);
      var W = root.clientWidth;
      layer.style.height = docH + 'px';
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + docH);
      svg.setAttribute('width', W);
      svg.setAttribute('height', docH);

      var wide = W >= 940;
      var lo = wide ? 30 : 11;
      var hi = wide ? 116 : 40;

      var anchors = Array.prototype.slice.call(document.querySelectorAll('[data-route]'));
      if (!anchors.length) return;

      var pts = [];
      anchors.forEach(function (el, i) {
        var top = el.getBoundingClientRect().top + window.scrollY;
        var h = el.offsetHeight;
        pts.push({ x: i % 2 ? hi : lo, y: top + h * 0.22 });
        pts.push({ x: i % 2 ? lo : hi, y: top + h * 0.78 });
      });

      // финальный отрезок уводит маршрут к карточке заявки
      var fr = formCard.getBoundingClientRect();
      var fx = fr.left + window.scrollX + Math.min(46, fr.width * 0.14);
      var fy = fr.top + window.scrollY - (wide ? 30 : 24);
      pts.push({ x: fx, y: fy });

      var d = 'M ' + pts[0].x + ' ' + pts[0].y;
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], mid = (a.y + b.y) / 2;
        d += ' C ' + a.x + ' ' + mid + ', ' + b.x + ' ' + mid + ', ' + b.x + ' ' + b.y;
      }

      path.setAttribute('d', d);
      ghost.setAttribute('d', d);
      mask.setAttribute('d', d);

      routeEnd = { x: fx, y: fy };
      cross.style.transform = '';
      cross.style.left = fx + 'px';
      cross.style.top = fy + 'px';

      startY = pts[0].y;
      endY = fy;
      update();
    }

    function update() {
      if (endY <= startY) return;
      var vh = window.innerHeight || 800;
      var seen = window.scrollY + vh * 0.78;
      var progress = clamp((seen - startY) / (endY - startY), 0, 1);
      mask.style.strokeDashoffset = String(1 - progress);
      cross.classList.toggle('is-in', progress > 0.985);
    }

    onScroll(update);
    onResize(build);
    document.addEventListener('ca:motion', build);

    build();
    // шрифты и картинки меняют высоту страницы — пересчитываем позже
    window.setTimeout(build, 500);
    window.setTimeout(build, 1600);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  }

  /* ---------------------------------------------------------
     9. Попугай
     Перелетает между ключевыми блоками и садится на крестик.
     Картинку внутри .parrot можно заменить на свою — см. README.
     --------------------------------------------------------- */
  function initParrot() {
    var parrot = document.getElementById('parrot');
    if (!parrot) return;

    var stops = [], current = -1, landTimer = null, actTimer = null;

    /* Поведение на месте: птица сидит, иногда осматривается,
       иногда чистит перья. Одна точка входа — setState(), поэтому
       при замене графики на спрайт или Rive меняется только она. */
    var ACTS = [
      { name: 'look',  ms: 2700, weight: 6 },
      { name: 'preen', ms: 3000, weight: 4 }
    ];

    function pickAct() {
      var total = 0, i;
      for (i = 0; i < ACTS.length; i++) total += ACTS[i].weight;
      var roll = Math.random() * total;
      for (i = 0; i < ACTS.length; i++) {
        roll -= ACTS[i].weight;
        if (roll <= 0) return ACTS[i];
      }
      return ACTS[0];
    }

    function stopIdle() {
      window.clearTimeout(actTimer);
      parrot.removeAttribute('data-act');
    }

    function idleLoop() {
      window.clearTimeout(actTimer);
      if (!motionOn() || !parrot.classList.contains('is-perched')) return;

      // пауза между действиями — от 3,5 до 9 секунд, чтобы не мельтешил
      actTimer = window.setTimeout(function () {
        if (!parrot.classList.contains('is-perched')) return;
        var act = pickAct();
        parrot.setAttribute('data-act', act.name);
        actTimer = window.setTimeout(function () {
          parrot.removeAttribute('data-act');
          idleLoop();
        }, act.ms);
      }, 3500 + Math.random() * 5500);
    }

    function setState(state) {
      if (state === 'fly') {
        stopIdle();
        parrot.classList.add('is-on', 'is-flying');
        parrot.classList.remove('is-perched');
      } else {
        parrot.classList.remove('is-flying');
        parrot.classList.add('is-perched');
        idleLoop();
      }
    }

    // Слушателей вешаем всегда: иначе попугай не оживёт после того,
    // как посетитель включит движение кнопкой в шапке.
    function apply() {
      if (!motionOn()) {
        stopIdle();
        parrot.style.display = 'none';
        parrot.classList.remove('is-on', 'is-flying', 'is-perched');
        return false;
      }
      parrot.style.display = '';
      return true;
    }

    function build() {
      if (!apply()) return;
      var wide = root.clientWidth >= 940;
      stops = [];

      document.querySelectorAll('[data-parrot]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        stops.push({
          y: r.top + window.scrollY,
          x: r.left + window.scrollX + r.width - (wide ? 6 : 26),
          ty: r.top + window.scrollY + (wide ? -6 : 2),
          land: false
        });
      });

      // последняя остановка — крестик у заявки
      if (routeEnd.y) {
        // садится чуть выше и правее крестика, чтобы крестик остался виден
        stops.push({ y: routeEnd.y - 200, x: routeEnd.x + 14, ty: routeEnd.y - 34, land: true });
      }

      stops.sort(function (a, b) { return a.y - b.y; });
      current = -1;
      update();
    }

    function update() {
      if (!stops.length || !motionOn()) return;
      var line = window.scrollY + (window.innerHeight || 800) * 0.62;

      var next = 0;
      for (var i = 0; i < stops.length; i++) {
        if (stops[i].y <= line) next = i;
      }
      if (next === current) return;
      current = next;

      var stop = stops[next];
      setState('fly');
      parrot.style.transform = 'translate3d(' + stop.x + 'px, ' + stop.ty + 'px, 0)';

      window.clearTimeout(landTimer);
      landTimer = window.setTimeout(function () { setState('perch'); }, 1150);
    }

    onScroll(update);
    onResize(build);
    document.addEventListener('ca:motion', build);

    build();
    window.setTimeout(build, 700);
    window.setTimeout(build, 1800);
  }

  /* ---------------------------------------------------------
     10. Форма заявки
     Бэкенда нет: собираем сообщение, копируем в буфер
     и открываем мессенджер по тому, что указал человек.
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

    function channelFor(contact) {
      var text = contact.toLowerCase();
      if (text.indexOf('@') > -1 || text.indexOf('t.me') > -1 || text.indexOf('telegram') > -1) return 'telegram';
      if (text.indexOf('whatsapp') > -1 || text.indexOf('вацап') > -1 || text.indexOf('ватсап') > -1) return 'whatsapp';
      if (digits(contact).length >= 10) return 'whatsapp';
      return 'telegram';
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

      var message = [
        'Заявка на бесплатный аудит карточки',
        '',
        'Имя: ' + data.name,
        'Заведение: ' + data.place,
        'Связь: ' + data.contact
      ].join('\n');

      var channel = channelFor(data.contact);

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
     11. Год в подвале
     --------------------------------------------------------- */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --------------------------------------------------------- */
  applyContacts();
  initMotionToggle();
  initNav();
  initHeader();
  initReveal();
  initMobileCta();
  initMarquee();
  initRoute();
  initParrot();
  initForm();
  initYear();
})();
