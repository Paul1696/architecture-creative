// assets/js/admin.js
const sectionLabels = {
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

const form = document.querySelector('#adminPostForm');
const list = document.querySelector('#adminPostList');
const count = document.querySelector('#postCount');
const status = document.querySelector('#adminStatus');
const resetButton = document.querySelector('#resetAdminForm');
const authOverlay = document.querySelector('#adminAuthOverlay');
const loginForm = document.querySelector('#adminLoginForm');
const logoutBtn = document.querySelector('#adminLogout');
const authError = document.querySelector('#authError');

let editingId = null;

/* ── Authentication ────────────────────────────────────────── */

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    authOverlay.classList.add('hidden');
    renderList();
  } else {
    authOverlay.classList.remove('hidden');
  }
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.querySelector('#authEmail').value;
  const password = document.querySelector('#authPassword').value;
  
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authError.textContent = "Erreur : " + error.message;
  } else {
    authOverlay.classList.add('hidden');
    renderList();
  }
});

logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  authOverlay.classList.remove('hidden');
});

// Listener for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    authOverlay.classList.add('hidden');
    renderList();
  } else if (event === 'SIGNED_OUT') {
    authOverlay.classList.remove('hidden');
  }
});

/* ── CRUD Operations ────────────────────────────────────────── */

async function readPosts() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
}

function escapeAdminHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
}

function setStatus(message) {
  if (!status) return;
  status.textContent = message;
  window.setTimeout(() => {
    status.textContent = editingId ? 'Modification' : 'Prêt';
  }, 1800);
}

function resetForm() {
  editingId = null;
  form.reset();
  form.querySelector('#postIcon').value = '✍';
  setStatus('Nouveau');
}

function fillForm(post) {
  editingId = post.id;
  form.title.value = post.title || '';
  form.section.value = post.section || 'conseils';
  form.category.value = post.category || '';
  form.readTime.value = post.read_time || '';
  form.icon.value = post.icon || '✍';
  form.image.value = post.image || '';
  form.excerpt.value = post.excerpt || '';
  form.content.value = post.content || '';
  setStatus('Modification');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function savePost(action = 'published') {
  const data = new FormData(form);
  const title = data.get('title').trim();
  const excerpt = data.get('excerpt').trim();
  const content = data.get('content').trim();
  if (!title || !excerpt || !content) {
    form.reportValidity();
    return;
  }

  const section = data.get('section');
  const id = editingId || `${slugify(title)}-${Date.now().toString(36)}`;

  const post = {
    id,
    title,
    section,
    category: data.get('category').trim() || sectionLabels[section],
    read_time: data.get('readTime').trim() || '5 min',
    icon: data.get('icon').trim() || '✍',
    image: data.get('image').trim(),
    excerpt,
    content,
    status: action,
    date_label: todayLabel(), // In a real app, you might want to keep the original date
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('articles')
    .upsert(post);

  if (error) {
    alert('Erreur lors de la sauvegarde : ' + error.message);
  } else {
    renderList();
    setStatus(action === 'published' ? 'Publié' : 'Brouillon enregistré');
    editingId = post.id;
  }
}

async function deletePost(id) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Erreur lors de la suppression : ' + error.message);
  } else {
    if (editingId === id) resetForm();
    renderList();
    setStatus('Article supprimé');
  }
}

async function renderList() {
  const posts = await readPosts();
  if (!count || !list) return;
  
  count.textContent = posts.length.toString();

  if (!posts.length) {
    list.innerHTML = '<p class="admin-empty">Aucun article dans Supabase.</p>';
    return;
  }

  list.innerHTML = posts.map(post => `
    <article class="admin-list__item">
      <div>
        <span class="admin-list__meta">${escapeAdminHtml(sectionLabels[post.section] || post.section)} · ${post.status === 'published' ? 'Publié' : 'Brouillon'}</span>
        <h3>${escapeAdminHtml(post.title)}</h3>
        <p>${escapeAdminHtml(post.excerpt)}</p>
      </div>
      <div class="admin-list__actions">
        ${post.status === 'published' ? `<a class="btn btn--secondary btn--sm" href="/article.html?id=${encodeURIComponent(post.id)}">Voir</a>` : ''}
        <button class="btn btn--secondary btn--sm" type="button" data-edit="${post.id}">Modifier</button>
        <button class="btn btn--secondary btn--sm" type="button" data-delete="${post.id}">Supprimer</button>
      </div>
    </article>
  `).join('');

  renderStats(posts.length);
}

async function renderStats(postCount) {
  const statArticles = document.querySelector('#statArticles');
  const statSubscribers = document.querySelector('#statSubscribers');
  const statMessages = document.querySelector('#statMessages');

  if (statArticles) statArticles.textContent = postCount;

  try {
    const [subRes, msgRes] = await Promise.all([
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true })
    ]);

    if (statSubscribers) statSubscribers.textContent = subRes.count || 0;
    if (statMessages) statMessages.textContent = msgRes.count || 0;
    
    renderActivity();
  } catch (e) {
    console.warn('Stats error:', e);
  }
}

async function renderActivity() {
  const feed = document.querySelector('#adminActivityFeed');
  if (!feed) return;

  try {
    const [subData, msgData] = await Promise.all([
      supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(3)
    ]);

    const activities = [];

    (subData.data || []).forEach(s => {
      activities.push({
        type: 'Newsletter',
        label: s.email,
        date: new Date(s.created_at),
        color: 'var(--blue)'
      });
    });

    (msgData.data || []).forEach(m => {
      activities.push({
        type: 'Contact',
        label: `${m.first_name} : ${m.subject}`,
        date: new Date(m.created_at),
        color: 'var(--clay)'
      });
    });

    activities.sort((a, b) => b.date - a.date);

    if (activities.length === 0) {
      feed.innerHTML = '<p class="admin-empty">Aucune activité récente.</p>';
      return;
    }

    feed.innerHTML = activities.slice(0, 5).map(act => `
      <div style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <span style="font-weight: 700; color: ${act.color}; text-transform: uppercase; font-size: 0.7rem;">${act.type}</span>
          <span style="color: var(--text-muted); font-size: 0.7rem;">${act.date.toLocaleDateString('fr-FR')}</span>
        </div>
        <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeAdminHtml(act.label)}</div>
      </div>
    `).join('');

  } catch (e) {
    console.warn('Activity error:', e);
    feed.innerHTML = '<p class="admin-empty">Erreur de chargement.</p>';
  }
}

/* ── Events ────────────────────────────────────────────────── */

form?.addEventListener('submit', event => {
  event.preventDefault();
  // The action is determined by the button clicked (handled by data-action)
});

form?.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    savePost(button.dataset.action || 'published');
  });
});

resetButton?.addEventListener('click', resetForm);

list?.addEventListener('click', async event => {
  const editId = event.target.closest('[data-edit]')?.dataset.edit;
  const deleteId = event.target.closest('[data-delete]')?.dataset.delete;

  if (editId) {
    const posts = await readPosts();
    const post = posts.find(item => item.id === editId);
    if (post) fillForm(post);
  }

  if (deleteId) {
    if (!window.confirm('Supprimer cet article de Supabase ?')) return;
    deletePost(deleteId);
  }
});

// Initial check
checkAuth();
