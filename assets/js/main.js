/* assets/js/main.js */
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
  
  // Initialize everything after partials are loaded
  initAuthVisibility();
  initBlogContent();
  initHeader();
  initFooterAccordion();
  initActiveNav();
  initReveal();
  initAutoTOC();
  initSearch();
  initLightbox();
  initFormFeedback();
  initSEO();
  initCustomCursor();
}

/* ── Supabase Auth Visibility ─────────────────────────────── */
async function initAuthVisibility() {
  if (typeof supabase === 'undefined') return;

  const { data: { session } } = await supabase.auth.getSession();
  const adminElements = document.querySelectorAll('.admin-only');
  
  if (session) {
    adminElements.forEach(el => el.classList.remove('hidden'));
  } else {
    adminElements.forEach(el => el.classList.add('hidden'));
  }

  // Listen for changes
  supabase.auth.onAuthStateChange((event, session) => {
    const adminElements = document.querySelectorAll('.admin-only');
    if (session) {
      adminElements.forEach(el => el.classList.remove('hidden'));
    } else {
      adminElements.forEach(el => el.classList.add('hidden'));
    }
  });
}

/* ── Supabase Blog Content ────────────────────────────────── */
const BLOG_SECTIONS = {
  conseils: 'Conseils',
  dossiers: 'Dossiers',
  nouvelles: 'Nouvelles',
  guides: 'Guides',
  entretiens: 'Entretiens',
  publications: 'Publications',
  ressources: 'Ressources',
  innovation: 'Lab R&D',
  projets: 'Architecture',
  ecriture: 'Écriture',
  developpement: 'Développement'
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatArticleBody(raw = '') {
  const lines = String(raw).split(/\r?\n/);
  const html = [];
  let list = [];

  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    list = [];
  };

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      html.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      const title = trimmed.slice(3);
      const id = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      html.push(`<h2 id="${escapeHtml(id)}">${escapeHtml(title)}</h2>`);
      return;
    }
    if (trimmed.startsWith('- ')) {
      list.push(trimmed.slice(2));
      return;
    }
    flushList();
    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  });

  flushList();
  return html.join('');
}

function createPostCard(post) {
  const card = document.createElement('a');
  card.href = `/article.html?id=${encodeURIComponent(post.id)}`;
  card.className = 'post reveal admin-post';
  card.dataset.cat = `${post.section || ''} ${post.category || ''}`.trim().toLowerCase();
  card.style.textDecoration = 'none';

  const hasImage = post.image && post.image.trim();
  card.innerHTML = `
    <div class="post__thumb">
      <div class="post__thumb-bg">${hasImage ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}">` : ''}</div>
      <div class="post__thumb-grid"></div>
      ${hasImage ? '' : `<div class="post__thumb-icon">${escapeHtml(post.icon || '✍')}</div>`}
      <span class="post__badge">${escapeHtml(post.category || BLOG_SECTIONS[post.section] || 'Article')}</span>
    </div>
    <div class="post__body">
      <div class="post__date">${escapeHtml(post.date_label || 'Publié récemment')}</div>
      <div class="post__title">${escapeHtml(post.title)}</div>
      <p class="post__excerpt">${escapeHtml(post.excerpt)}</p>
      <div class="post__footer">
        <span class="post__read">${escapeHtml(post.read_time || '5 min')}</span>
        <span class="post__link">Lire →</span>
      </div>
    </div>
  `;
  return card;
}

async function renderBlogPostsList() {
  const grid = document.querySelector('#grid');
  if (!grid || typeof supabase === 'undefined') return;

  const section = window.location.pathname.split('/').filter(Boolean)[0] || 'accueil';
  
  // Show loading state if needed
  // grid.innerHTML = '<div class="loading">Chargement...</div>';

  let query = supabase.from('articles').select('*').eq('status', 'published');
  if (section !== 'accueil' && section !== 'index.html') {
    query = query.eq('section', section);
  } else {
    // On homepage, we only show the latest 4
    query = query.limit(4);
  }

  const { data: posts, error } = await query.order('updated_at', { ascending: false });

  if (error) {
    console.warn('Erreur Supabase', error);
    // If error, we keep static content as fallback
    return;
  }

  if (posts && posts.length > 0) {
    // If we have dynamic posts, we clear the static "placeholders"
    grid.innerHTML = '';
    posts.forEach(post => {
      grid.appendChild(createPostCard(post));
    });
    
    // Re-trigger reveal animations for new elements
    if (typeof initReveal === 'function') initReveal();
  } else {
    // If no posts in DB, we keep the static ones or show a message
    // console.log('Aucun article dynamique trouvé pour cette section.');
  }
}

async function renderArticle() {
  const outlet = document.querySelector('[data-admin-article]');
  if (!outlet || typeof supabase === 'undefined') return;

  const id = new URLSearchParams(window.location.search).get('id');
  const { data: post, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    outlet.innerHTML = `<header class="article-header"><div class="wrap"><h1>Article introuvable</h1></div></header>`;
    return;
  }

  document.title = `${post.title} — Architecture Créative`;
  const sectionLabel = BLOG_SECTIONS[post.section] || 'Blog';
  const heroMedia = post.image
    ? `<div class="article-hero article-hero--image"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}"></div>`
    : `<div class="article-hero"><div class="article-hero-grid"></div><div class="article-hero-icon">${escapeHtml(post.icon || '✍')}</div></div>`;

  outlet.innerHTML = `
    <header class="article-header">
      <div class="wrap">
        <div class="breadcrumb">
          <a href="/">Accueil</a>
          <span class="breadcrumb__sep">/</span>
          <a href="/${escapeHtml(post.section)}/">${escapeHtml(sectionLabel)}</a>
          <span class="breadcrumb__sep">/</span>
          <span>${escapeHtml(post.title)}</span>
        </div>
        <div class="post-meta">
          <span class="post-meta__cat">${escapeHtml(post.category || sectionLabel)}</span>
          <span class="post-meta__sep">·</span>
          <span>${escapeHtml(post.date_label || 'Publié récemment')}</span>
          <span class="post-meta__sep">·</span>
          <span>${escapeHtml(post.read_time || '5 min')}</span>
        </div>
        <h1>${escapeHtml(post.title)}</h1>
        ${heroMedia}
      </div>
    </header>
    <div class="wrap">
      <div class="article-layout">
        <article class="prose">${formatArticleBody(post.content)}</article>
        <aside class="sidebar">
          <div class="sidebar__block">
            <span class="sidebar__label">Auteur</span>
            <div class="author">
              <div class="author__avatar">AC</div>
              <div>
                <div class="author__name">Architecture Créative</div>
                <div class="author__role">${escapeHtml(sectionLabel)}</div>
              </div>
            </div>
          </div>
          <div class="sidebar__block"><span class="sidebar__label">Dans cet article</span><nav class="toc"></nav></div>
          <div class="sidebar__block">
            <span class="sidebar__label">Retour</span>
            <a class="btn btn--secondary btn--sm" href="/${escapeHtml(post.section)}/">Voir la rubrique</a>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function initBlogContent() {
  renderBlogPostsList();
  renderArticle();
}

/* ── Header & Common UI ──────────────────────────────────────── */
function initHeader() {
  const header = document.querySelector('.header');
  const burger = document.querySelector('.nav-burger');
  const nav = document.querySelector('.nav');
  const searchTrigger = document.querySelector('.search-trigger');
  const searchPanel = document.querySelector('.site-search');
  const searchClose = document.querySelector('.site-search__close');
  const searchInput = document.querySelector('.site-search input');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = burger.classList.contains('active') ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  if (searchTrigger && searchPanel) {
    const closeSearch = () => {
      searchPanel.classList.remove('open');
      searchPanel.setAttribute('aria-hidden', 'true');
    };

    searchTrigger.addEventListener('click', () => {
      const isOpen = searchPanel.classList.toggle('open');
      searchPanel.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) searchInput?.focus();
    });

    searchClose?.addEventListener('click', closeSearch);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSearch();
    });
  }
}

function initFooterAccordion() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      if (window.innerWidth > 768) return;
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });
}

function initActiveNav() {
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    const url = new URL(href, window.location.origin);
    const linkPath = url.pathname.replace(/\/index\.html$/, '/');
    const isHome = linkPath === '/';
    const isActive = isHome ? path === '/' : path.startsWith(linkPath);
    a.classList.toggle('active', isActive);
  });
}

function initAutoTOC() {
  const tocContainer = document.querySelector('.toc');
  const article = document.querySelector('article.prose');
  if (!tocContainer || !article) return;

  const headings = article.querySelectorAll('h2, h3');
  if (headings.length === 0) return;

  tocContainer.innerHTML = '';
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `section-${index}`;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    const num = document.createElement('span');
    num.className = 'toc__n';
    num.textContent = (index + 1).toString().padStart(2, '0');
    link.appendChild(num);
    link.append(heading.textContent);
    tocContainer.appendChild(link);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tocContainer.querySelectorAll('a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px' });
  headings.forEach(h => observer.observe(h));
}

function initSearch() {
  const searchInput = document.querySelector('.search-bar input, .site-search input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const posts = document.querySelectorAll('.post, .card');
    posts.forEach(post => {
      const title = post.querySelector('.post__title, .card__title')?.textContent.toLowerCase() || '';
      const excerpt = post.querySelector('.post__excerpt, .card__text')?.textContent.toLowerCase() || '';
      const isMatch = title.includes(term) || excerpt.includes(term);
      post.style.display = isMatch ? '' : 'none';
    });
  });
}

function initLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `<button class="lightbox__close">&times;</button><img src="" alt="Aperçu">`;
  document.body.appendChild(lightbox);
  const img = lightbox.querySelector('img');
  const close = () => lightbox.classList.remove('open');

  document.querySelectorAll('article.prose img, .article-hero img, .post__thumb img').forEach(el => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => {
      if (el.closest('a')) return;
      img.src = el.src;
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', (e) => { if (e.target.tagName !== 'IMG') close(); });
}

function setSubmitState(button, label, isSuccess = false) {
  if (!button) return;
  button.classList.remove('btn--loading');
  button.disabled = false;
  button.textContent = label;
  button.style.background = isSuccess ? '#16a34a' : '';
}

async function saveNewsletterSubscription(form) {
  if (typeof supabase === 'undefined') {
    throw new Error('Supabase est indisponible.');
  }

  const email = form.querySelector('input[type="email"]')?.value.trim();
  if (!email) throw new Error('Email manquant.');

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email,
      source: window.location.pathname
    });

  if (error && error.code !== '23505') throw error;
}

async function saveContactMessage(form) {
  if (typeof supabase === 'undefined') {
    throw new Error('Supabase est indisponible.');
  }

  const payload = {
    first_name: form.querySelector('#prenom')?.value.trim() || '',
    last_name: form.querySelector('#nom')?.value.trim() || '',
    email: form.querySelector('#email')?.value.trim() || '',
    phone: form.querySelector('#tel')?.value.trim() || '',
    subject: form.querySelector('#type')?.value.trim() || '',
    message: form.querySelector('#message')?.value.trim() || '',
    source: window.location.pathname
  };

  const { error } = await supabase
    .from('contact_messages')
    .insert(payload);

  if (error) throw error;
}

function initFormFeedback() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const defaultLabel = btn?.textContent || "S'abonner";
      btn?.classList.add('btn--loading');
      if (btn) btn.disabled = true;

      try {
        await saveNewsletterSubscription(form);
        form.reset();
        setSubmitState(btn, 'Inscription confirmée', true);
      } catch (error) {
        console.warn('Erreur newsletter Supabase', error);
        setSubmitState(btn, 'Erreur, réessayez', false);
        window.setTimeout(() => setSubmitState(btn, defaultLabel), 1800);
      }
    });
  });

  const contactForm = document.querySelector('#contactForm');
  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const defaultLabel = btn?.textContent || 'Envoyer';
    btn?.classList.add('btn--loading');
    if (btn) btn.disabled = true;

    try {
      await saveContactMessage(contactForm);
      contactForm.reset();
      setSubmitState(btn, 'Message envoyé', true);
    } catch (error) {
      console.warn('Erreur contact Supabase', error);
      setSubmitState(btn, 'Erreur, réessayez', false);
      window.setTimeout(() => setSubmitState(btn, defaultLabel), 1800);
    }
  });
}

function initSEO() {
  const article = document.querySelector('article.prose');
  if (!article) return;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": document.title,
    "author": { "@type": "Organization", "name": "Architecture Créative" }
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal, .reveal--stagger').forEach(el => observer.observe(el));
}

function initCustomCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

document.addEventListener('DOMContentLoaded', initPartials);
