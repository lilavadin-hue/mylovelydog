/* =========================================================
   Домашняя передержка собак мелких пород — script.js
   Vanilla JS, без зависимостей.
   ========================================================= */

(function () {
  'use strict';

  var HEADER_OFFSET_EXTRA = 16; // дополнительный отступ при скролле к якорю

  /* =======================================================
     1. БУРГЕР-МЕНЮ
     ======================================================= */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function openMenu() {
    nav.classList.add('is-open');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
  }

  function closeMenu() {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  function isMenuOpen() {
    return nav.classList.contains('is-open');
  }

  if (burger && nav) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      isMenuOpen() ? closeMenu() : openMenu();
    });

    // Закрытие по клику вне меню
    document.addEventListener('click', function (e) {
      if (!isMenuOpen()) return;
      if (!nav.contains(e.target) && !burger.contains(e.target)) {
        closeMenu();
      }
    });

    // Закрытие при клике по ссылке меню
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // Закрытие по Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isMenuOpen()) {
        closeMenu();
        burger.focus();
      }
    });

    // Сброс состояния при переходе на десктоп
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) closeMenu();
    });
  }

  /* =======================================================
     2. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ + OFFSET ОТ ХЕДЕРА
     ======================================================= */
  function headerHeight() {
    var h = document.querySelector('.header');
    return h ? h.offsetHeight : 0;
  }

  function smoothScrollTo(targetEl) {
    var top = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight() - HEADER_OFFSET_EXTRA;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    smoothScrollTo(target);
    // Обновляем URL без скачка
    if (history.pushState) history.pushState(null, '', id);
  });

  /* =======================================================
     3. АККОРДЕОН FAQ (только один открыт)
     ======================================================= */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));

  function closeFaq(item) {
    var btn = item.querySelector('.faq__question');
    var answer = item.querySelector('.faq__answer');
    btn.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight = '0px';
  }

  function openFaq(item) {
    var btn = item.querySelector('.faq__question');
    var answer = item.querySelector('.faq__answer');
    btn.setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq__question');
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Закрываем все
      faqItems.forEach(closeFaq);
      // Открываем этот, если был закрыт
      if (!isOpen) openFaq(item);
    });
  });

  // Пересчёт высоты открытого элемента при ресайзе
  window.addEventListener('resize', function () {
    faqItems.forEach(function (item) {
      var btn = item.querySelector('.faq__question');
      if (btn.getAttribute('aria-expanded') === 'true') {
        var answer = item.querySelector('.faq__answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* =======================================================
     4. ВАЛИДАЦИЯ ФОРМЫ БРОНИРОВАНИЯ
     ======================================================= */
  var form = document.getElementById('bookingForm');

  if (form) {
    var fields = {
      name: {
        el: document.getElementById('fName'),
        err: document.getElementById('errName'),
        validate: function (v) {
          if (!v.trim()) return 'Пожалуйста, укажите имя';
          if (v.trim().length < 2) return 'Имя должно быть не короче 2 символов';
          return '';
        }
      },
      phone: {
        el: document.getElementById('fPhone'),
        err: document.getElementById('errPhone'),
        validate: function (v) {
          if (!v.trim()) return 'Укажите телефон или мессенджер, чтобы мы могли ответить';
          return '';
        }
      },
      dates: {
        el: document.getElementById('fDates'),
        err: document.getElementById('errDates'),
        validate: function (v) {
          if (!v.trim()) return 'Укажите даты передержки';
          return '';
        }
      }
    };

    function showError(field, message) {
      field.err.textContent = message;
      var group = field.el.closest('.form-group');
      if (message) {
        group.classList.add('has-error');
        field.el.setAttribute('aria-invalid', 'true');
      } else {
        group.classList.remove('has-error');
        field.el.removeAttribute('aria-invalid');
      }
    }

    // Валидация поля при потере фокуса
    Object.keys(fields).forEach(function (key) {
      var f = fields[key];
      f.el.addEventListener('blur', function () {
        showError(f, f.validate(f.el.value));
      });
      f.el.addEventListener('input', function () {
        if (f.el.closest('.form-group').classList.contains('has-error')) {
          showError(f, f.validate(f.el.value));
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      var isValid = true;

      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        var message = f.validate(f.el.value);
        showError(f, message);
        if (message) {
          isValid = false;
          if (!firstInvalid) firstInvalid = f.el;
        }
      });

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Здесь можно отправить данные на сервер (fetch/XHR) — см. README.
      var success = document.getElementById('formSuccess');
      success.hidden = false;
      form.reset();

      // Убрать сообщение об успехе через 8 секунд
      window.setTimeout(function () {
        success.hidden = true;
      }, 8000);
    });
  }

  // Кнопка «Добавить к брони» в блоке бонуса — отмечает чекбокс фотосессии
  var bonusBtn = document.getElementById('bonusBtn');
  var photoCheckbox = document.getElementById('fPhoto');
  if (bonusBtn && photoCheckbox) {
    bonusBtn.addEventListener('click', function () {
      photoCheckbox.checked = true;
    });
  }

  /* =======================================================
     5. INTERSECTIONOBSERVER — FADE-IN БЛОКОВ
     ======================================================= */
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) { fadeObserver.observe(el); });
  } else {
    // Фолбэк для старых браузеров — показать всё сразу
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* =======================================================
     6. ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ ПРИ СКРОЛЛЕ
     ======================================================= */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return document.querySelector(id);
    })
    .filter(Boolean);

  function updateActiveLink() {
    var pos = window.pageYOffset + headerHeight() + 60;
    var current = null;

    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      if (sec.offsetTop <= pos) current = sec;
    }

    // Если доскроллили до самого низа — активируем последний пункт
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 4) {
      current = sections[sections.length - 1];
    }

    navLinks.forEach(function (link) {
      var target = document.querySelector(link.getAttribute('href'));
      link.classList.toggle('is-active', target === current);
    });
  }

  /* =======================================================
     7. КНОПКА «НАВЕРХ» + ТЕНЬ ХЕДЕРА (единый scroll-listener)
     ======================================================= */
  var toTop = document.getElementById('toTop');
  var header = document.getElementById('header');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (toTop) toTop.classList.toggle('is-visible', y > 600);
    if (header) header.classList.toggle('is-scrolled', y > 8);

    updateActiveLink();
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  onScroll(); // первичная инициализация

  if (toTop) {
    toTop.addEventListener('click', function () {
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* =======================================================
     8. ЛАЙТБОКС ГАЛЕРЕИ
     ======================================================= */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbCounter = document.getElementById('lbCounter');
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery__item img'));
  var currentIndex = 0;
  var lastFocused = null;

  function largeSrc(img) {
    // picsum: заменяем размер на больший для полноэкранного просмотра
    return img.src.replace(/\/\d+\/\d+$/, '/1200/1200');
  }

  function showSlide(index) {
    if (index < 0) index = galleryItems.length - 1;
    if (index >= galleryItems.length) index = 0;
    currentIndex = index;
    var img = galleryItems[currentIndex];
    lbImg.src = largeSrc(img);
    lbImg.alt = img.alt;
    lbCounter.textContent = (currentIndex + 1) + ' / ' + galleryItems.length;
  }

  function openLightbox(index) {
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    // форсируем reflow для анимации opacity
    void lightbox.offsetWidth;
    lightbox.classList.add('is-open');
    document.body.classList.add('no-scroll');
    showSlide(index);
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    // ждём окончания transition, затем скрываем
    window.setTimeout(function () {
      lightbox.hidden = true;
      lbImg.src = '';
    }, 250);
    if (lastFocused) lastFocused.focus();
  }

  galleryItems.forEach(function (img, i) {
    var figure = img.closest('.gallery__item');
    figure.setAttribute('tabindex', '0');
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', 'Открыть фото: ' + img.alt);

    figure.addEventListener('click', function () { openLightbox(i); });
    figure.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  if (lightbox) {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { showSlide(currentIndex - 1); });
    lbNext.addEventListener('click', function () { showSlide(currentIndex + 1); });

    // Закрытие по клику вне изображения
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Управление с клавиатуры
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
    });
  }

  /* =======================================================
     9. КНОПКА TELEGRAM — ПОЯВЛЕНИЕ ЧЕРЕЗ 2.5 СЕК
     ======================================================= */
  var tgFab = document.getElementById('tgFab');
  if (tgFab) {
    window.setTimeout(function () {
      tgFab.classList.add('is-visible');
    }, 2500);
  }

})();
