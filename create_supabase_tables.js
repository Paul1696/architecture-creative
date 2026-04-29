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

function getProjectRef(supabaseUrl) {
  const { hostname } = new URL(supabaseUrl);
  return hostname.split('.')[0];
}

async function main() {
  loadEnv();

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!accessToken) {
    throw new Error('SUPABASE_ACCESS_TOKEN doit être défini dans .env ou dans l’environnement.');
  }

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL doit être défini dans .env.');
  }

  const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
  const query = fs.readFileSync(schemaPath, 'utf-8');
  const ref = getProjectRef(supabaseUrl);

  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      read_only: false
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase API ${response.status}: ${text}`);
  }

  console.log(`Tables Supabase créées ou déjà à jour pour le projet ${ref}.`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
