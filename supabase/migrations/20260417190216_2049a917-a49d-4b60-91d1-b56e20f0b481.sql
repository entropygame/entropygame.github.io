-- 1. Enum des rôles
create type public.app_role as enum ('admin', 'moderator', 'user');

-- 2. Table des rôles utilisateurs
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- 3. Fonction security definer pour vérifier un rôle (évite récursion RLS)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 4. Site settings (singleton)
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  hero_cta_url text not null default '#',
  floating_cta_url text not null default '#',
  go_cta_url text not null default '#',
  ga_measurement_id text,
  meta_pixel_id text,
  meta_conversions_token text,
  updated_at timestamp with time zone not null default now()
);

alter table public.site_settings enable row level security;

-- Lecture publique des settings (nécessaire pour le site public)
create policy "Anyone can read site settings"
  on public.site_settings for select
  using (true);

create policy "Only admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Insertion ligne par défaut
insert into public.site_settings (hero_cta_url, floating_cta_url, go_cta_url)
values ('#', '#', '#');

-- 5. Sessions de visite
create table public.visit_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  started_at timestamp with time zone not null default now(),
  ended_at timestamp with time zone,
  duration_ms integer,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  landing_path text,
  user_agent text
);

create index idx_visit_sessions_started_at on public.visit_sessions(started_at desc);
create index idx_visit_sessions_session_id on public.visit_sessions(session_id);

alter table public.visit_sessions enable row level security;

create policy "Anyone can create a visit session"
  on public.visit_sessions for insert
  with check (true);

create policy "Anyone can update their own session by session_id"
  on public.visit_sessions for update
  using (true)
  with check (true);

create policy "Only admins can read visit sessions"
  on public.visit_sessions for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 6. Clics sur boutons
create table public.button_clicks (
  id uuid primary key default gen_random_uuid(),
  button_id text not null,
  session_id text,
  created_at timestamp with time zone not null default now(),
  referrer text,
  utm_source text,
  page_path text
);

create index idx_button_clicks_created_at on public.button_clicks(created_at desc);
create index idx_button_clicks_button_id on public.button_clicks(button_id);

alter table public.button_clicks enable row level security;

create policy "Anyone can record a button click"
  on public.button_clicks for insert
  with check (true);

create policy "Only admins can read button clicks"
  on public.button_clicks for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 7. Trigger updated_at sur site_settings
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.update_updated_at_column();