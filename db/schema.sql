-- ============================================================
-- LPT Studio website — CMS schema
-- Run this once in the Supabase SQL editor for a NEW Supabase
-- project dedicated to the website (keep it separate from the
-- Flexle project — different app, different data).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- content_blocks ----------
-- Generic key/value text content, grouped by page + section.
-- e.g. page='home', section='hero', key='headline'
create table if not exists content_blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  key text not null,
  value text not null default '',
  updated_at timestamptz not null default now(),
  unique (page, section, key)
);

alter table content_blocks enable row level security;

create policy "public can read content_blocks"
  on content_blocks for select
  to anon
  using (true);

create policy "authenticated can manage content_blocks"
  on content_blocks for all
  to authenticated
  using (true)
  with check (true);

-- ---------- services ----------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  icon_svg text not null default '',
  title text not null default '',
  description text not null default '',
  bullets jsonb not null default '[]'::jsonb,
  link_anchor text not null default '',
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table services enable row level security;

create policy "public can read visible services"
  on services for select
  to anon
  using (visible = true);

create policy "authenticated can read all services"
  on services for select
  to authenticated
  using (true);

create policy "authenticated can manage services"
  on services for insert
  to authenticated
  with check (true);

create policy "authenticated can update services"
  on services for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete services"
  on services for delete
  to authenticated
  using (true);

-- ---------- portfolio_projects ----------
create table if not exists portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort_order int not null default 0,
  category text not null default 'app', -- 'app' | 'tool' | 'website'
  tag text not null default '',
  title text not null default '',
  summary text not null default '',
  meta jsonb not null default '{}'::jsonb,       -- {role, platform, stack, status}
  sections jsonb not null default '{}'::jsonb,    -- {idea, role, design_intro, design_bullets[], tech_tags[], outcome}
  visual_svg text not null default '',
  external_link text,
  homepage_featured boolean not null default false,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table portfolio_projects enable row level security;

create policy "public can read visible projects"
  on portfolio_projects for select
  to anon
  using (visible = true);

create policy "authenticated can read all projects"
  on portfolio_projects for select
  to authenticated
  using (true);

create policy "authenticated can manage projects"
  on portfolio_projects for insert
  to authenticated
  with check (true);

create policy "authenticated can update projects"
  on portfolio_projects for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete projects"
  on portfolio_projects for delete
  to authenticated
  using (true);

-- ---------- enquiries ----------
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text not null,
  project_type text not null,
  details text not null,
  budget text,
  timeframe text,
  status text not null default 'new' -- 'new' | 'read' | 'archived'
);

alter table enquiries enable row level security;

-- Anyone can submit an enquiry (the public contact form), but never read others' data.
create policy "anon can insert enquiries"
  on enquiries for insert
  to anon
  with check (true);

create policy "authenticated can read enquiries"
  on enquiries for select
  to authenticated
  using (true);

create policy "authenticated can update enquiries"
  on enquiries for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete enquiries"
  on enquiries for delete
  to authenticated
  using (true);
