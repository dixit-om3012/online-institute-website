/* ═══════════════════════════════════════════════
   LUITECH SOLUTIONS — courses.js
   Courses page interactive logic
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ═══════════════════════════════════════════════
     1. SHARED NAVBAR LOGIC (mirrors script.js)
     ═══════════════════════════════════════════════ */
  // const navbar = $('#navbar');

  // function updateNav() {
  //   navbar.classList.toggle('solid', window.scrollY > 40);
  //   // No dark-mode hero on courses page — navbar is always solid after scroll
  // }
  // updateNav();
  // window.addEventListener('scroll', updateNav, { passive: true });

  // /* ─── Burger / Drawer ─── */
  // const burger = $('#burger');
  // const drawer = $('#mobile-nav');
  // const backdrop = $('#drawer-backdrop');

  // function openDrawer() {
  //   drawer.classList.add('open');
  //   drawer.setAttribute('aria-hidden', 'false');
  //   burger.classList.add('open');
  //   burger.setAttribute('aria-expanded', 'true');
  //   document.body.style.overflow = 'hidden';
  // }
  // function closeDrawer() {
  //   drawer.classList.remove('open');
  //   drawer.setAttribute('aria-hidden', 'true');
  //   burger.classList.remove('open');
  //   burger.setAttribute('aria-expanded', 'false');
  //   document.body.style.overflow = '';
  // }

  // if (burger) {
  //   burger.addEventListener('click', () =>
  //     drawer.classList.contains('open') ? closeDrawer() : openDrawer()
  //   );
  // }
  // if (backdrop) backdrop.addEventListener('click', closeDrawer);
  // $$('.drawer-link').forEach(l => l.addEventListener('click', closeDrawer));
  // document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* ─── Smooth scroll for anchors ─── */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '68');
      const extraOffset = 60; // filter bar height
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH - extraOffset,
        behavior: 'smooth'
      });
    });
  });

  /* ─── Footer year ─── */
  const yearEl = $('#copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ═══════════════════════════════════════════════
     2. SCROLL REVEAL (same system as index)
     ═══════════════════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal-fade, .reveal-up').forEach(el => revealObs.observe(el));

  /* Stagger cards within each visible grid */
  const gridObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = $$('.ccard', entry.target);
        cards.forEach((card, i) => {
          card.style.transitionDelay = (i * 0.055) + 's';
          card.classList.add('in');
        });
        gridObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  $$('.course-grid').forEach(g => gridObs.observe(g));

  /* ═══════════════════════════════════════════════
     3. FILTER BAR — category pills
     ═══════════════════════════════════════════════ */
  const filterPills = $$('.filter-pill');
  const catSections = $$('.cat-section');
  const noResults = $('#no-results');
  const resultsLabel = $('#results-label');
  const filterBarWrap = $('#filter-bar-wrap');

  // Shadow on filter bar when scrolled past hero
  const heroEl = $('.courses-hero');
  const fbShadowObs = new IntersectionObserver(([entry]) => {
    filterBarWrap.classList.toggle('shadowed', !entry.isIntersecting);
  }, { threshold: 0 });
  if (heroEl) fbShadowObs.observe(heroEl);

  let activeCat = 'all';

  function countVisibleInCat(catSection) {
    return $$('.ccard:not([style*="display: none"])', catSection).length;
  }

  function applyFilter(cat) {
    activeCat = cat;

    filterPills.forEach(p => {
      const isActive = p.dataset.cat === cat;
      p.classList.toggle('active', isActive);
      p.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    let totalVisible = 0;
    let visibleSections = 0;

    catSections.forEach(sec => {
      const secCat = sec.dataset.cat;
      const show = cat === 'all' || secCat === cat;
      sec.classList.toggle('hidden', !show);
      if (show) {
        visibleSections++;
        totalVisible += $$('.ccard', sec).length;
        // Re-trigger scroll observer for newly shown cards
        $$('.ccard', sec).forEach(c => {
          if (!c.classList.contains('in')) {
            c.style.transitionDelay = '0s';
            c.classList.add('in');
          }
        });
      }
    });

    noResults.style.display = visibleSections === 0 ? 'flex' : 'none';
    if (resultsLabel) {
      resultsLabel.innerHTML = cat === 'all'
        ? `Showing all <strong>${totalVisible}</strong> courses`
        : `Showing <strong>${totalVisible}</strong> courses in <strong>${cat.charAt(0).toUpperCase() + cat.slice(1)}</strong>`;
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      applyFilter(pill.dataset.cat);
      // If not 'all', smooth scroll to first visible section
      if (pill.dataset.cat !== 'all') {
        const target = $(`#cat-${pill.dataset.cat}`);
        if (target) {
          setTimeout(() => {
            const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '68');
            const filterH = filterBarWrap.offsetHeight;
            window.scrollTo({
              top: target.getBoundingClientRect().top + window.scrollY - navH - filterH - 24,
              behavior: 'smooth'
            });
          }, 50);
        }
      }
    });
  });

  // Reset from no-results button
  const nrReset = $('#nr-reset');
  if (nrReset) {
    nrReset.addEventListener('click', () => {
      applyFilter('all');
      // Clear search too
      const searchInput = $('#course-search');
      if (searchInput) { searchInput.value = ''; triggerSearch(''); }
    });
  }

  /* ═══════════════════════════════════════════════
     4. LIVE SEARCH
     ═══════════════════════════════════════════════ */
  const searchInput = $('#course-search');
  const searchClear = $('#search-clear');

  function triggerSearch(query) {
    const q = query.trim().toLowerCase();
    searchClear.style.display = q.length > 0 ? 'flex' : 'none';

    // Reset filter when searching
    if (q.length > 0 && activeCat !== 'all') {
      applyFilter('all');
    }

    let totalVisible = 0;
    let visibleSections = 0;

    catSections.forEach(sec => {
      if (sec.classList.contains('hidden')) return;
      let sectionHasVisible = false;

      $$('.ccard', sec).forEach(card => {
        const title = (card.querySelector('.ccard-title')?.textContent || '').toLowerCase();
        const code = (card.querySelector('.ccard-code')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.ccard-desc')?.textContent || '').toLowerCase();
        const cat = (card.querySelector('.ccard-cat')?.textContent || '').toLowerCase();

        const matches = !q || title.includes(q) || code.includes(q) || desc.includes(q) || cat.includes(q);
        card.style.display = matches ? '' : 'none';
        if (matches) { totalVisible++; sectionHasVisible = true; }
      });

      sec.classList.toggle('hidden', !sectionHasVisible);
      if (sectionHasVisible) visibleSections++;
    });

    noResults.style.display = visibleSections === 0 ? 'flex' : 'none';
    if (resultsLabel) {
      resultsLabel.innerHTML = q
        ? `Found <strong>${totalVisible}</strong> courses matching "<strong>${query}</strong>"`
        : `Showing all <strong>${totalVisible}</strong> courses`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => triggerSearch(e.target.value));
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') { searchInput.value = ''; triggerSearch(''); }
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      triggerSearch('');
      searchInput.focus();
    });
  }

  /* ═══════════════════════════════════════════════
     5. CUSTOM CURSOR (desktop only)
     ═══════════════════════════════════════════════ */
  const cursor = $('#cursor');
  const cursorDot = $('#cursor-dot');

  if (window.matchMedia('(pointer:fine)').matches && cursor) {
    let cx = 0, cy = 0, tx = 0, ty = 0;

    function moveCursor() {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(moveCursor);
    }

    document.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    }, { passive: true });

    moveCursor();

    $$('a,button,.ccard,.filter-pill').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  /* ═══════════════════════════════════════════════
     6. MICRO TILT on course cards (desktop only)
     ═══════════════════════════════════════════════ */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.ccard').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `translateY(-6px) perspective(700px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════
     7. KEYBOARD: filter pill arrow navigation
     ═══════════════════════════════════════════════ */
  filterPills.forEach((pill, idx) => {
    pill.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = filterPills[idx + 1] || filterPills[0];
        next.focus(); next.click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = filterPills[idx - 1] || filterPills[filterPills.length - 1];
        prev.focus(); prev.click();
      }
    });
  });

  /* ═══════════════════════════════════════════════
     8. URL HASH — auto-activate category on load
     ═══════════════════════════════════════════════ */
  const hash = window.location.hash; // e.g. #cat-redhat
  if (hash && hash.startsWith('#cat-')) {
    const cat = hash.replace('#cat-', '');
    const matchPill = filterPills.find(p => p.dataset.cat === cat);
    if (matchPill) {
      setTimeout(() => {
        applyFilter(cat);
        matchPill.focus();
      }, 300);
    }
  }

})();
