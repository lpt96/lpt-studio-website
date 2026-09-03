// ============================================================
// LPT Studio — shared behaviour
// ============================================================

// Resolve the assets folder relative to this script's own location, so this
// works whether the page is at the site root or nested (e.g. /portfolio/).
const ASSETS_BASE = (document.currentScript ? document.currentScript.src : '')
  .replace(/js\/main\.js.*$/, 'assets/');

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Sticky header shadow on scroll ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile menu toggle ---- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
    });
  }

  /* ---- Reveal-on-scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---- Hero signature: sketch -> product build sequence ---- */
  const buildDemo = document.querySelector('.build-demo');
  if (buildDemo) {
    // Trigger shortly after load so the "sketch" state is visible first.
    setTimeout(() => buildDemo.classList.add('is-built'), 1100);
  }

  /* ---- Case study: scroll-spy table of contents ---- */
  const toc = document.querySelector('.case-toc');
  if (toc) {
    const links = Array.from(toc.querySelectorAll('a'));
    const targets = links
      .map(link => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window && targets.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const link = links.find(l => l.getAttribute('href') === '#' + entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
      targets.forEach(t => spy.observe(t));
    }
  }

  /* ---- Portfolio filter chips (portfolio.html) ---- */
  const filterRow = document.querySelector('.filter-row');
  if (filterRow) {
    const chips = Array.from(filterRow.querySelectorAll('.filter-chip'));
    const cards = Array.from(document.querySelectorAll('[data-category]'));
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ---- Contact form ----
     Handled in js/page-contact.js (submits to Supabase). This file
     only owns nav, reveal animations, and other page-agnostic UI. */

  /* ---- Real app icons, with automatic fallback to the sketch placeholder ---- */
  const iconEls = document.querySelectorAll('[data-icon]');
  const tryLoad = (urls) => new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= urls.length) return resolve(null);
      const img = new Image();
      img.onload = () => resolve(urls[i]);
      img.onerror = () => { i += 1; next(); };
      img.src = urls[i];
    };
    next();
  });

  iconEls.forEach(async (el) => {
    const slug = el.dataset.icon;
    const candidates = ['png', 'jpg', 'jpeg', 'svg'].map(ext => `${ASSETS_BASE}icons/${slug}.${ext}`);
    const found = await tryLoad(candidates);
    if (!found) return; // no file yet — leave the placeholder sketch as-is
    el.innerHTML = '';
    const img = document.createElement('img');
    img.src = found;
    img.alt = '';
    img.className = 'visual-icon-img';
    el.appendChild(img);
  });

  /* ---- Footer year ---- */
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
