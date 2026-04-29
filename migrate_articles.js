const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, 'utf-8')
    .split(/\r?\n/)
    .forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const separator = trimmed.indexOf('=');
      if (separator === -1) return;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    });
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.');
}

const articlesToMigrate = [
  { file: 'conseils/article-manifeste.html', section: 'conseils' },
  { file: 'conseils/article-cctp.html', section: 'conseils' },
  { file: 'projets/suka-cafe.html', section: 'projets' },
  { file: 'projets/bicec.html', section: 'projets' },
  { file: 'projets/workbox.html', section: 'projets' },
  { file: 'projets/totem-bonapriso.html', section: 'projets' },
  { file: 'innovation/article-ia.html', section: 'innovation' },
  { file: 'innovation/article-3d.html', section: 'innovation' },
];

async function migrate() {
  console.log('--- Migration vers Supabase lancée ---');

  for (const item of articlesToMigrate) {
    const filePath = path.join(__dirname, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Fichier ignoré (introuvable) : ${item.file}`);
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf-8');

    // Extract Title
    const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Sans titre';

    // Extract Excerpt
    const excerptMatch = html.match(/<p class="post__excerpt">(.*?)<\/p>/) || html.match(/<p>(.*?)<\/p>/);
    const excerpt = excerptMatch ? excerptMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';

    // Extract Content from <article class="prose">
    const contentMatch = html.match(/<article class="prose">([\s\S]*?)<\/article>/);
    let rawContent = contentMatch ? contentMatch[1] : '';

    // Convert basic HTML to the blog's mini-markdown format
    let content = rawContent
      .replace(/<h2.*?id=".*?".*?>(.*?)<\/h2>/g, '## $1')
      .replace(/<h2.*?>(.*?)<\/h2>/g, '## $1')
      .replace(/<h3.*?>(.*?)<\/h3>/g, '### $1')
      .replace(/<p.*?>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<li>(.*?)<\/li>/g, '- $1')
      .replace(/<ul.*?>|<\/ul>|<article.*?>|<\/article>|<div.*?>|<\/div>|<section.*?>|<\/section>|<a.*?>|<\/a>/g, '')
      .replace(/<strong.*?>(.*?)<\/strong>/g, '$1') // Simple text for now
      .trim();

    // Clean up nav and comments if they were inside <article>
    content = content.split('Commentaires')[0].split('Partager')[0].trim();

    // Extract Meta
    const iconMatch = html.match(/article-hero-icon">(.*?)<\/div>/) || html.match(/post__thumb-icon">(.*?)<\/div>/);
    const icon = iconMatch ? iconMatch[1].trim() : '✍';

    const imageMatch = html.match(/<div class="article-hero article-hero--image"><img src="(.*?)"/) || html.match(/<div class="post__thumb-bg"><img src="(.*?)"/);
    const image = imageMatch ? imageMatch[1] : null;

    const catMatch = html.match(/<span class="post-meta__cat">(.*?)<\/span>/) || html.match(/<span class="post__badge.*?">(.*?)<\/span>/);
    const category = catMatch ? catMatch[1].trim() : '';

    const id = path.basename(item.file, '.html');

    const post = {
      id,
      title,
      section: item.section,
      category,
      read_time: '7 min',
      icon,
      image,
      excerpt: excerpt.slice(0, 200),
      content,
      status: 'published',
      date_label: '29 avril 2026',
      updated_at: new Date().toISOString()
    };

    console.log(`Migration de : ${title} (${id})...`);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?on_conflict=id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(post)
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }
      console.log('✓ Succès');
    } catch (e) {
      console.error(`✗ Erreur pour ${id} :`, e.message);
    }
  }

  console.log('--- Migration terminée ---');
}

migrate();
