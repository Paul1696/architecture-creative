/* ── Partial loader ──────────────────────────────────────────── */
async function loadPartial(slot, url) {
  try {
    const res = await fetch(url + '?v=' + Date.now());
    if (!res.ok) throw new Error(res.status);
    slot.outerHTML = await res.text();
  } catch (e) {
    console.warn('Partial failed:', url, e);
  }
}

async function initPartials() {
  const slots = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(slots).map(slot => {
    const name = slot.getAttribute('data-include');
    return loadPartial(slot, `/partials/${name}.html`);
  }));
  initHeader();
  initActiveNav();
  initReveal();
  initAutoTOC();
  initSearch();
  initLightbox();
  initFormFeedback();
  initSEO();
}

/* ── Header (burger + scroll state) ──────────────────────────── */
function initHeader() {
  const header = document.querySelector('.header') || document.getElementById('nav');
  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.header__nav') || document.getElementById('navLinks');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
      const spans = burger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
        burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }
}

/* ── Active nav link (path-based) ────────────────────────────── */
function initActiveNav() {
  const path = window.location.pathname;
  const section = (path.match(/\/(projets|innovation|conseils|contact)\//) || [])[1];
  if (!section) return;
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.getAttribute('data-nav') === section) a.classList.add('active');
  });
}

/* ── Scroll reveal ───────────────────────────────────────────── */
/* ── Automated TOC & ScrollSpy ──────────────────────────────── */
function initAutoTOC() {
  const tocContainer = document.querySelector('.toc');
  const article = document.querySelector('article.prose');
  if (!tocContainer || !article) return;

  const headings = article.querySelectorAll('h2, h3');
  if (headings.length === 0) return;

  // Clear existing static TOC if needed or just append
  tocContainer.innerHTML = '';

  headings.forEach((heading, index) => {
    // Ensure ID exists
    if (!heading.id) {
      heading.id = `section-${index}`;
    }

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    
    const num = document.createElement('span');
    num.className = 'toc__n';
    num.textContent = (index + 1).toString().padStart(2, '0');
    
    link.appendChild(num);
    link.append(heading.textContent);
    tocContainer.appendChild(link);
  });

  // ScrollSpy
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -80% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tocContainer.querySelectorAll('a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  headings.forEach(h => observer.observe(h));
}

/* ── Live Search Filter ──────────────────────────────────────── */
function initSearch() {
  const searchInput = document.querySelector('.search-bar input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const posts = document.querySelectorAll('.post, .card');
    
    posts.forEach(post => {
      const title = post.querySelector('.post__title, .card__title')?.textContent.toLowerCase() || '';
      const excerpt = post.querySelector('.post__excerpt, .card__excerpt')?.textContent.toLowerCase() || '';
      const isMatch = title.includes(term) || excerpt.includes(term);
      
      post.style.display = isMatch ? '' : 'none';
      post.style.opacity = isMatch ? '1' : '0';
      post.style.pointerEvents = isMatch ? 'all' : 'none';
    });
  });
}

/* ── Lightbox ────────────────────────────────────────────────── */
function initLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox__close" aria-label="Fermer">&times;</button>
    <img src="" alt="Aperçu">
  `;
  document.body.appendChild(lightbox);

  const img = lightbox.querySelector('img');
  const close = () => lightbox.classList.remove('open');

  document.querySelectorAll('article.prose img, .article-hero img, .post__thumb img').forEach(el => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', (e) => {
      // Don't open if it's a link parent
      if (el.closest('a')) return;
      img.src = el.src;
      img.alt = el.alt;
      lightbox.classList.add('open');
    });
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target.tagName !== 'IMG') close();
  });
}

/* ── Form Feedback (Newsletter & Contact) ─────────────────────── */
function initFormFeedback() {
  const forms = document.querySelectorAll('.newsletter-form, #contactForm, .comment-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;

      const originalText = btn.innerHTML;
      btn.classList.add('btn--loading');

      // Simulate network request
      await new Promise(r => setTimeout(r, 1200));

      btn.classList.remove('btn--loading');
      btn.innerHTML = 'Succès ✓';
      btn.style.background = '#16a34a';
      btn.style.color = '#FFF';

      if (form.id === 'contactForm') {
        const successMsg = document.createElement('p');
        successMsg.style.cssText = 'color:#16a34a; font-weight:700; margin-top:1rem; text-align:center;';
        successMsg.textContent = 'Votre message a bien été envoyé. Nous vous répondrons sous 24h.';
        form.appendChild(successMsg);
      }
    });
  });
}

/* ── SEO & JSON-LD ───────────────────────────────────────────── */
function initSEO() {
  // Only for article/project pages
  const article = document.querySelector('article.prose');
  if (!article) return;

  const title = document.title;
  const description = document.querySelector('meta[name="description"]')?.content || '';
  const date = document.querySelector('.post-meta span:nth-child(3)')?.textContent || new Date().toISOString();
  const url = window.location.href;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": "Architecture Créative"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Architecture Créative"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
  console.log('SEO Schema injected');
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initPartials);
