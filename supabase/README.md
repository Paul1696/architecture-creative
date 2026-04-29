# Supabase setup

1. Open the Supabase SQL editor for the project configured in `.env`.
2. Execute `supabase/schema.sql`.
3. In Authentication, create the admin user that will access `/admin/`.
4. Run `node migrate_articles.js` from this project root if you want to import the existing static articles.

The public site uses `SUPABASE_ANON_KEY` through `assets/js/supabase-config.js`.
The migration script reads `SUPABASE_SERVICE_ROLE_KEY` from `.env`; do not commit that key.
