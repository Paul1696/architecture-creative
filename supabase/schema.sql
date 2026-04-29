-- Architecture Creative - Supabase schema
-- Execute this file in the Supabase SQL editor before using the admin UI.

create table if not exists public.articles (
  id text primary key,
  title text not null,
  section text not null,
  category text,
  read_time text,
  icon text,
  image text,
  excerpt text not null,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  date_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  subject text,
  message text not null,
  source text,
  created_at timestamptz not null default now()
);

alter table public.articles enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Published articles are public" on public.articles;
create policy "Published articles are public"
on public.articles for select
using (status = 'published');

drop policy if exists "Authenticated users can manage articles" on public.articles;
create policy "Authenticated users can manage articles"
on public.articles for all
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
on public.newsletter_subscribers for insert
to anon, authenticated
with check (email <> '');

drop policy if exists "Authenticated users can read newsletter subscribers" on public.newsletter_subscribers;
create policy "Authenticated users can read newsletter subscribers"
on public.newsletter_subscribers for select
to authenticated
using (true);

drop policy if exists "Anyone can send contact messages" on public.contact_messages;
create policy "Anyone can send contact messages"
on public.contact_messages for insert
to anon, authenticated
with check (email <> '' and message <> '');

drop policy if exists "Authenticated users can read contact messages" on public.contact_messages;
create policy "Authenticated users can read contact messages"
on public.contact_messages for select
to authenticated
using (true);
