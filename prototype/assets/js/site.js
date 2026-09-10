/* ==========================================================================
   Longhorn Publishers Cameroon — Prototype behaviour layer
   Each block below maps to a named Astro component in the phase-2 build:
     buildHeader()  -> LocalizedHeader.astro
     buildFooter()  -> RegionalFooter.astro
     initCarousel() -> client:visible island
   ========================================================================== */

const ICON = {
  arrow: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12L12 4M12 4H5.5M12 4v6.5"/></svg>',
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  chevL: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  chevR: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/></svg>',
  mail:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
  pin:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  book:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  pen:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  globe: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
  layout:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
  brush: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.1 11.3 20.4 0"/><circle cx="7" cy="17" r="4"/><path d="M9.9 14.1 12 12"/></svg>',
  print: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  shield:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  users: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.9"/></svg>',
  target:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  eye:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  flag:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>',
  heart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 000-7.8z"/></svg>',
  news:  '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9h4"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>',
};

/* --- Site data (single source, mirrors Docs/sitemap.md) ----------------- */
const NAV = [
  { href: 'index.html',        label: 'Home' },
  { href: 'about.html',        label: 'About Us' },
  { href: 'services.html',     label: 'Publishing Services' },
  { href: 'catalogue.html',    label: 'Catalogue' },
  { href: 'why-choose-us.html',label: 'Why Choose Us' },
  { href: 'contact.html',      label: 'Contact Us' },
];

const CONTACT = {
  address: 'Total École de police, Tsinga — Yaoundé, Cameroon',
  phone1: '+237 672 49 10 93',
  phone2: '+237 657 51 92 03',
  email: 'info@longhornpublishers-cm.com', // PLACEHOLDER — confirm with client
};

/* --- Header ------------------------------------------------------------ */
function buildHeader() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const links = NAV.map(n =>
    `<a href="${n.href}"${n.href === here ? ' aria-current="page"' : ''}>${n.label}</a>`
  ).join('');

  return `
  <header class="site-header" id="siteHeader">
    <div class="wrap">
      <div class="site-header__inner">
        <a class="brand" href="index.html" aria-label="Longhorn Publishers Cameroon — home">
          <span class="brand__mark" aria-hidden="true">L</span>
          <span class="brand__text">Longhorn<span>Publishers Cameroon</span></span>
        </a>
        <nav class="nav" id="primaryNav" aria-label="Primary">${links}</nav>
        <div class="header__actions">
          <div class="lang-toggle" role="group" aria-label="Language">
            <button type="button" class="is-active" data-lang="en">EN</button>
            <button type="button" data-lang="fr">FR</button>
          </div>
          <a class="btn btn--dark btn--sm" href="contact.html">Get in Touch<span class="btn__icon" aria-hidden="true">${ICON.arrow}</span></a>
          <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="primaryNav" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>
  </header>`;
}

/* --- Footer ------------------------------------------------------------ */
function buildFooter() {
  const quick = NAV.concat([{ href: 'news.html', label: 'News & Updates' }])
    .map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('');

  const services = ['Editing', 'Proofreading', 'Translation', 'Designing', 'Illustration', 'Printing']
    .map(s => `<li><a href="services.html#${s.toLowerCase()}">${s}</a></li>`).join('');

  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer__top">
        <div>
          <a class="brand" href="index.html">
            <span class="brand__mark" aria-hidden="true">L</span>
            <span class="brand__text">Longhorn<span>Publishers Cameroon</span></span>
          </a>
          <p class="footer__blurb">Content creators and platform business providers for Central Africa — end-to-end publishing services from manuscript to printed book, in English and French.</p>
          <form class="newsletter" onsubmit="event.preventDefault(); this.reset(); alert('Prototype only — no submission is sent.');">
            <label class="visually-hidden" for="footerEmail">Email address</label>
            <input id="footerEmail" type="email" placeholder="Your email for publishing insights" required>
            <button type="submit" aria-label="Subscribe">${ICON.arrow}</button>
          </form>
        </div>
        <div class="footer__col"><h4>Explore</h4><ul>${quick}</ul></div>
        <div class="footer__col"><h4>Services</h4><ul>${services}</ul></div>
        <div class="footer__col">
          <h4>Get in Touch</h4>
          <ul>
            <li><p>${CONTACT.address}</p></li>
            <li><a href="tel:${CONTACT.phone1.replace(/\s/g, '')}">${CONTACT.phone1}</a></li>
            <li><a href="tel:${CONTACT.phone2.replace(/\s/g, '')}">${CONTACT.phone2}</a></li>
            <li><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; 2026 Longhorn Publishers Cameroon Ltd — a subsidiary of Longhorn Publishers PLC.</p>
        <div class="footer__legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="news.html">News &amp; Updates</a>
        </div>
      </div>
    </div>
  </footer>`;
}

/* --- Behaviours -------------------------------------------------------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');

  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });

  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-toggle button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (btn.dataset.lang === 'fr') {
        alert('Prototype: the FR toggle is visual only.\n\nIn the Astro build this routes to /fr/ with localized slugs and hreflang tags (see Docs/technical_architecture.md §3).');
        document.querySelector('.lang-toggle button[data-lang="en"]').classList.add('is-active');
        btn.classList.remove('is-active');
      }
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(i => i.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
  items.forEach(i => io.observe(i));
}

function initCarousels() {
  document.querySelectorAll('.carousel').forEach(car => {
    const view = car.querySelector('.carousel__viewport');
    const prev = car.querySelector('[data-dir="prev"]');
    const next = car.querySelector('[data-dir="next"]');
    if (!view || !prev || !next) return;

    const step = () => {
      const first = view.querySelector('.carousel__track > *');
      return first ? first.getBoundingClientRect().width + 24 : view.clientWidth * 0.8;
    };
    const sync = () => {
      const max = view.scrollWidth - view.clientWidth - 2;
      prev.disabled = view.scrollLeft <= 2;
      next.disabled = view.scrollLeft >= max;
    };
    prev.addEventListener('click', () => view.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => view.scrollBy({ left:  step(), behavior: 'smooth' }));
    view.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });
}

function initFilters() {
  document.querySelectorAll('[data-filter-scope]').forEach(scope => {
    const targets = scope.querySelectorAll('[data-tags]');
    const groups = scope.querySelectorAll('.filter-group');
    const countEl = scope.querySelector('[data-filter-count]');

    const apply = () => {
      const active = [];
      groups.forEach(g => {
        const on = g.querySelector('.chip.is-active');
        if (on && on.dataset.value !== 'all') active.push(on.dataset.value);
      });
      let shown = 0;
      targets.forEach(t => {
        const tags = t.dataset.tags.split(' ');
        const match = active.every(a => tags.includes(a));
        t.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (countEl) countEl.textContent = shown;
    };

    scope.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.closest('.filter-group').querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        apply();
      });
    });
    apply();
  });
}

function initForms() {
  document.querySelectorAll('form[data-prototype-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('Prototype only — nothing is submitted.\n\nIn production this posts to a Netlify Function and writes to Netlify Database (see Docs/technical_architecture.md).');
    });
  });
}

/* --- Boot -------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('afterbegin', buildHeader());
  document.body.insertAdjacentHTML('beforeend', buildFooter());
  initHeader();
  initReveal();
  initCarousels();
  initFilters();
  initForms();
});
