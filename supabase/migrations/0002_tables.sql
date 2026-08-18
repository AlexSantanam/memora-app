-- MEMORA — Fase 1: tablas
-- Corre después de 0001_extensions_enums.sql

-- ── Usuarios ──────────────────────────────────────────────────────────────
-- Separado en dos tablas a propósito: "profiles" lo puede editar el propio
-- usuario (nombre, avatar); "account_entitlements" (rol, plan, suscripción)
-- SOLO lo escribe el servidor (service_role) — ver 0004_rls.sql. Esto es lo
-- que impide, a nivel de base de datos, que un usuario se autoasigne admin
-- o cambie su propio plan sin pagar.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  auth_provider text not null default 'email',
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table account_entitlements (
  user_id uuid primary key references profiles(id) on delete cascade,
  role user_role not null default 'user',
  current_plan plan_tier not null default 'esencial',
  subscription_status subscription_status not null default 'pending_payment',
  subscription_start_date timestamptz not null default now(),
  free_trial_end_date timestamptz,
  next_renewal_date timestamptz,
  price_clp integer not null default 990
);

-- ── Memoriales ────────────────────────────────────────────────────────────
create table memorials (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type memorial_type not null default 'person',
  person_name text not null,
  preferred_name text,
  birth_date date,
  passing_date date,
  birth_place text,
  resting_place text,
  main_photo text,
  cover_photo text,
  quote text,
  summary text,
  biography text,
  privacy privacy_level not null default 'public',
  password_hash text,
  status memorial_status not null default 'published',
  owner_id uuid not null references profiles(id),
  owner_name text not null,
  owner_email text not null,
  plan_id plan_tier not null,
  enable_tribute_auto_approval boolean not null default true,
  background_music_title text,
  background_music_url text,
  qr_code_url text,
  species text,
  breed text,
  personality text,
  favorite_things text,
  favorite_place text,
  anecdote text,
  arrival_story text,
  special_trait text,
  pet_memory_quote text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_memorials_owner_id on memorials(owner_id);

create table albums (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  item_count integer not null default 0
);
create index idx_albums_memorial_id on albums(memorial_id);

create table media_items (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  album_id uuid references albums(id) on delete set null,
  type text not null,
  url text not null,
  thumbnail_url text,
  title text,
  description text,
  date date,
  album_title text,
  tags text[],
  uploader_name text not null,
  uploader_email text,
  status text not null default 'approved',
  uploaded_at timestamptz not null default now()
);
create index idx_media_items_memorial_id on media_items(memorial_id);

create table timeline_events (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  year text not null,
  date date,
  title text not null,
  description text not null,
  category text not null,
  photo_url text,
  location text
);
create index idx_timeline_events_memorial_id on timeline_events(memorial_id);

create table tributes (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  author_name text not null,
  author_email text,
  relationship text,
  message text not null,
  photo_url text,
  candle_lit boolean not null default false,
  flower_placed boolean not null default false,
  heart_count integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index idx_tributes_memorial_id on tributes(memorial_id);

create table tribute_replies (
  id uuid primary key default gen_random_uuid(),
  tribute_id uuid not null references tributes(id) on delete cascade,
  author_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);
create index idx_tribute_replies_tribute_id on tribute_replies(tribute_id);

create table family_members (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  name text not null,
  relationship text not null,
  photo_url text,
  birth_year text,
  generation text,
  notes text
);
create index idx_family_members_memorial_id on family_members(memorial_id);

create table memorial_events (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  title text not null,
  type text not null,
  date date not null,
  time text not null,
  location_name text not null,
  address text,
  virtual_link text,
  description text,
  rsvp_count integer not null default 1
);
create index idx_memorial_events_memorial_id on memorial_events(memorial_id);

create table collaborators (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  user_id uuid references profiles(id),
  name text not null,
  email text not null,
  role text not null,
  status text not null default 'active',
  invited_at timestamptz not null default now()
);
create index idx_collaborators_memorial_id on collaborators(memorial_id);
create index idx_collaborators_user_id on collaborators(user_id);

create table payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  memorial_id uuid references memorials(id),
  memorial_name text,
  plan_id plan_tier not null,
  amount integer not null,
  currency text not null default 'CLP',
  status text not null,
  provider text not null,
  invoice_number text not null,
  flow_order text unique,
  created_at timestamptz not null default now()
);
create index idx_payment_transactions_user_id on payment_transactions(user_id);
