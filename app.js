// ===================================================
// ATRION — App JavaScript v2
// SPA Hash Routing — Light Mode Only
// ===================================================

(function () {
  'use strict';

  var PAGES = ['inicio', 'servicios', 'fabricacion', 'ingenieria', 'productos', 'contacto'];
  var DEFAULT_PAGE = 'inicio';
  var metricsAnimated = false;

  // ─── Icon helpers ─────────────────────────────────
  function iconMenu() {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
  }
  function iconClose() {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  }

  // ─── Mobile menu ──────────────────────────────────
  function closeMobileNav() {
    var mobileNav    = document.getElementById('mobileNav');
    var mobileToggle = document.getElementById('mobileToggle');
    if (!mobileNav || !mobileToggle) return;
    mobileNav.classList.remove('is-open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.innerHTML = iconMenu();
  }

  // ─── SPA Page Routing ─────────────────────────────
  function showPage(pageId) {
    if (PAGES.indexOf(pageId) === -1) pageId = DEFAULT_PAGE;

    PAGES.forEach(function (id) {
      var el = document.getElementById('page-' + id);
      if (el) el.classList.remove('is-active');
    });

    var target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('is-active');

    document.querySelectorAll('[data-page]').forEach(function (link) {
      link.classList.toggle('nav__link--active', link.getAttribute('data-page') === pageId);
    });

    window.scrollTo({ top: 0, behavior: 'instant' });

    if (pageId === DEFAULT_PAGE) {
      setTimeout(animateMetrics, 200);
    }

    closeMobileNav();
  }

  function getPageFromHash() {
    var hash = window.location.hash.replace('#', '');
    return PAGES.indexOf(hash) !== -1 ? hash : DEFAULT_PAGE;
  }

  // Handle [data-page] clicks
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-page]');
    if (!link) return;
    var page = link.getAttribute('data-page');
    if (!page) return;
    e.preventDefault();
    if (window.location.hash !== '#' + page) {
      history.pushState(null, '', '#' + page);
    }
    showPage(page);
  });

  // Handle browser back/forward
  window.addEventListener('hashchange', function () {
    showPage(getPageFromHash());
  });

  // Initial page load
  showPage(getPageFromHash());

  // ─── Mobile Menu toggle ───────────────────────────
  var mobileToggle = document.getElementById('mobileToggle');
  var mobileNav    = document.getElementById('mobileNav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileToggle.innerHTML = isOpen ? iconClose() : iconMenu();
    });
  }

  // ─── Header scroll effect ─────────────────────────
  var header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    if (!header) return;
    header.classList.toggle('header--scrolled', window.scrollY > 40);
  }, { passive: true });

  // ─── Scroll Reveal ────────────────────────────────
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (!CSS.supports('animation-timeline', 'scroll()')) {
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
      revealEls.forEach(function (el) { revealObs.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  // ─── Counter Animation ────────────────────────────
  function animateMetrics() {
    if (metricsAnimated) return;
    var metricValues = document.querySelectorAll('.metric__value');
    if (!metricValues.length) return;
    metricsAnimated = true;

    metricValues.forEach(function (el) {
      var text  = el.textContent.trim();
      var match = text.match(/([\+]?)([0-9.,]+)(.*)/);
      if (!match) return;

      var prefix = match[1];
      var numStr = match[2].replace(/\./g, '').replace(/,/g, '');
      var suffix = match[3];
      var target = parseInt(numStr, 10);
      if (isNaN(target)) return;

      var duration = 1200;
      var startTime = performance.now();

      (function step(now) {
        var elapsed  = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3);
        var current  = Math.floor(target * eased);
        el.innerHTML = prefix + '<span>' + current.toLocaleString('es-ES') + '</span>' + suffix;
        if (progress < 1) requestAnimationFrame(step);
      })(startTime);
    });
  }

  var metricsSection = document.querySelector('.metrics');
  if (metricsSection) {
    var mo = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { animateMetrics(); mo.disconnect(); }
    }, { threshold: 0.3 });
    mo.observe(metricsSection);
  }

  // ─── Contact Form (Formspree) ─────────────────────
  var form      = document.getElementById('contactForm');
  var success   = document.getElementById('formSuccess');
  var submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = form.querySelector('[name="email"]');
      if (!emailInput || !emailInput.value) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          if (success) success.classList.add('is-visible');
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Error — intenta de nuevo';
          setTimeout(function () {
            submitBtn.textContent = 'Enviar mensaje';
          }, 3000);
        }
      }).catch(function () {
        // Fallback: open mailto directly
        var name    = (form.querySelector('[name="name"]') || {}).value || '';
        var company = (form.querySelector('[name="company"]') || {}).value || '';
        var msg     = (form.querySelector('[name="message"]') || {}).value || '';
        var subject = encodeURIComponent('Contacto web ATRION — ' + name);
        var body    = encodeURIComponent('Nombre: ' + name + '\nEmpresa: ' + company + '\n\nMensaje:\n' + msg);
        window.location.href = 'mailto:marketing@atrion.es?subject=' + subject + '&body=' + body;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
      });
    });
  }

})();
