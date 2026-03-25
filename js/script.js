/* ═══════════════════════════════════════════════
   LUITECH SOLUTIONS  —  script.js
   Precision vanilla JS — no dependencies
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── HELPERS ─── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ═══════════════════════════════════════════════
   Pop up
   ═══════════════════════════════════════════════ */


  (function () {
  var overlay  = document.getElementById('certOverlay');
  var closeBtn = document.getElementById('certClose');

  if (overlay && closeBtn) {

    function open() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    setTimeout(open, 5000);

    closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });

  }
})();

  /* ═══════════════════════════════════════════════
     1. CUSTOM CURSOR
     ═══════════════════════════════════════════════ */
  const cursor = $('#cursor');
  const cursorDot = $('#cursor-dot');

  // Only on non-touch devices
  if (window.matchMedia('(pointer:fine)').matches && cursor) {
    let cx = 0, cy = 0;
    let tx = 0, ty = 0;
    let rafId;

    function moveCursor() {
      // Smooth follow for outer ring
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      rafId = requestAnimationFrame(moveCursor);
    }

    document.addEventListener('mousemove', e => {
      tx = e.clientX;
      ty = e.clientY;
      // Dot follows instantly
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    }, { passive: true });

    moveCursor();

    // Hovering state
    const hoverEls = $$('a,button,.course-card,.program-card,.blog-card,.gallery-cell');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Card glow — track mouse within each card
    $$('.course-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ═══════════════════════════════════════════════
     2. NAVBAR
     ═══════════════════════════════════════════════ */
  const navbar = $('#navbar');
  const hero = $('#home');

  function updateNav() {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('solid', scrolled);

    if (hero) {
      const heroEnd = hero.getBoundingClientRect().bottom;
      // Dark mode while inside hero (transparent background)
      navbar.classList.toggle('dark-mode', heroEnd > 80 && !scrolled);
    }
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* Active nav highlight */
  const sections = $$('section[id], footer[id]');
  const navLinks = $$('.nav-link');

  function highlightActive() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === '#' + current;
      link.style.color = active ? 'var(--red)' : '';
    });
  }

  window.addEventListener('scroll', highlightActive, { passive: true });

  /* ═══════════════════════════════════════════════
     3. MOBILE DRAWER
     ═══════════════════════════════════════════════ */
  const burger = $('#burger');
  const drawer = $('#mobile-nav');
  const backdrop = $('#drawer-backdrop');
  const closeBtn = $('#drawer-close');
  const drawerLinks = $$('.drawer-link');

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger && burger.addEventListener('click', () =>
    drawer.classList.contains('open') ? closeDrawer() : openDrawer()
  );
  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  backdrop && backdrop.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* ═══════════════════════════════════════════════
     4. SMOOTH SCROLL
     ═══════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH,
        behavior: 'smooth'
      });
    });
  });

  /* ═══════════════════════════════════════════════
     5. INTERSECTION OBSERVER — Scroll Reveals
     ═══════════════════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal-fade, .reveal-up').forEach(el => revealObs.observe(el));

  /* ═══════════════════════════════════════════════
     6. COUNTER ANIMATION
     ═══════════════════════════════════════════════ */
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuart(progress) * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $$('.stat-count').forEach(el => counterObs.observe(el));

  /* ═══════════════════════════════════════════════
     7. TESTIMONIAL SLIDER
     ═══════════════════════════════════════════════ */
  const track = $('#slider-track');
  const dotsContainer = $('#sl-dots');
  const prevBtn = $('#sl-prev');
  const nextBtn = $('#sl-next');

  if (track) {
    const slides = $$('.slide', track);
    let current = 0;
    let autoTimer;
    let isAnimating = false;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'sl-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => go(i));
      dotsContainer.appendChild(dot);
    });

    function updateDots() {
      $$('.sl-dot', dotsContainer).forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function go(index) {
      if (isAnimating) return;
      isAnimating = true;
      current = ((index % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots();
      setTimeout(() => isAnimating = false, 700);
    }

    function next() { go(current + 1); }
    function prev() { go(current - 1); }

    function startAuto() { autoTimer = setInterval(next, 5000); }
    function stopAuto() { clearInterval(autoTimer); }

    startAuto();

    prevBtn && prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    nextBtn && nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

    // Touch / swipe
    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const delta = touchX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 48) {
        stopAuto();
        delta > 0 ? next() : prev();
        startAuto();
      }
    }, { passive: true });

    // Pause on hover
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    // Keyboard within slider region
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { stopAuto(); prev(); startAuto(); }
      if (e.key === 'ArrowRight') { stopAuto(); next(); startAuto(); }
    });
  }

  /* ═══════════════════════════════════════════════
     8. HERO PARTICLE CANVAS
     ═══════════════════════════════════════════════ */
  const canvas = $('#hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles, animId;
    const PARTICLE_COUNT = 80;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.size = Math.random() * 1.5 + 0.4;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 300 + 150;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        if (this.life > this.maxLife || this.y < -10) this.reset();
      }
      draw() {
        const progress = this.life / this.maxLife;
        const fade = progress < 0.1 ? progress * 10 : progress > 0.8 ? (1 - progress) * 5 : 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 29, 46, ${this.opacity * fade})`;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(loop);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { cancelAnimationFrame(animId); init(); loop(); }, 200);
    }, { passive: true });

    // Only run when hero is visible
    const heroObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { if (!animId) loop(); }
      else { cancelAnimationFrame(animId); animId = null; }
    }, { threshold: 0 });

    heroObs.observe($('#home'));
    init();
    loop();
  }

  /* ═══════════════════════════════════════════════
     9. FOOTER YEAR
     ═══════════════════════════════════════════════ */
  const yearEl = $('#copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ═══════════════════════════════════════════════
     10. MICRO TILT (desktop only, course/program cards)
     ═══════════════════════════════════════════════ */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.course-card, .program-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const lift = card.classList.contains('program-card') ? -10 : -7;
        card.style.transform =
          `translateY(${lift}px) perspective(800px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════
     11. GALLERY — click ripple
     ═══════════════════════════════════════════════ */
  $$('.gallery-cell').forEach(cell => {
    cell.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;border-radius:50%;
        background:rgba(225,29,46,.35);
        width:80px;height:80px;
        left:${e.offsetX - 40}px;top:${e.offsetY - 40}px;
        transform:scale(0);pointer-events:none;z-index:10;
        animation:ripple .55s ease-out forwards
      `;
      cell.style.position = 'relative';
      cell.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });

    cell.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cell.click(); }
    });
  });

  // Inject ripple keyframe
  const style = document.createElement('style');
  style.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════
     12. FEATURE CARDS — stagger entrance within why grid
     ═══════════════════════════════════════════════ */
  const featureObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (i * 0.06) + 's';
        entry.target.classList.add('in');
        featureObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  $$('.feature-card').forEach(el => featureObs.observe(el));


  /* ─── COURSES DROPDOWN ─── */
 const ddWrap = document.querySelector('.nav-dropdown-wrap');
 const ddLink = ddWrap && ddWrap.querySelector('.nav-link--courses');

 if (ddWrap && ddLink) {
  ddLink.addEventListener('click', function (e) {
    if (ddWrap.classList.contains('open')) return;
    e.preventDefault();
    ddWrap.classList.add('open');
    ddLink.setAttribute('aria-expanded', 'true');
  });
  document.addEventListener('click', function (e) {
    if (!ddWrap.contains(e.target)) {
      ddWrap.classList.remove('open');
      ddLink.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      ddWrap.classList.remove('open');
      ddLink.setAttribute('aria-expanded', 'false');
    }
  });
 }

 const drawerToggle = document.querySelector('.drawer-dd-toggle');
 const drawerSub    = document.querySelector('.drawer-dd-sub');

 if (drawerToggle && drawerSub) {
   drawerToggle.addEventListener('click', function (e) {
     e.stopPropagation();
     const expanded = drawerToggle.getAttribute('aria-expanded') === 'true';
     drawerToggle.setAttribute('aria-expanded', !expanded);
     drawerSub.classList.toggle('open', !expanded);
     drawerSub.setAttribute('aria-hidden', expanded);
   });
 }

})();
