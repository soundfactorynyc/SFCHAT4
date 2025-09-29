-- Sound Factory Viral Invites schema (Supabase/Postgres)

create table if not exists invites (
  invite_code text primary key,
  user_id text not null,
  platform text not null check (platform in ('facebook','instagram','twitter','whatsapp')),
  friends_invited integer default 0,
  followers_reached integer default 0,
  numbers_invited integer default 0,
  tweet_id text,
  created_at timestamptz default now(),
  conversions integer default 0
);

create table if not exists invite_conversions (
  id bigserial primary key,
  invite_code text not null references invites(invite_code) on delete cascade,
  invitee_user_id text not null,
  created_at timestamptz default now()
);

create table if not exists viral_scores (
  user_id text primary key,
  total_invites integer default 0,
  total_conversions integer default 0,
  viral_score integer default 0,
  platforms jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists viral_chains (
  id bigserial primary key,
  inviter_id text not null,
  invitee_id text not null,
  invite_code text not null,
  generation integer default 1,
  created_at timestamptz default now()
);

-- helpful indexes
create index if not exists idx_invites_user on invites(user_id);
create index if not exists idx_invite_conversions_code on invite_conversions(invite_code);
create index if not exists idx_viral_chains_code on viral_chains(invite_code);

-- Scheduled promos (optional; used by promo-scheduler)
create table if not exists scheduled_posts (
  id bigserial primary key,
  platform text not null check (platform in ('tiktok','twitter','facebook','instagram','whatsapp')),
  caption text,
  video_url text,
  image_url text,
  scheduled_for timestamptz not null,
  status text default 'pending' check (status in ('pending','posted','failed','cancelled')),
  result jsonb,
  account_id bigint,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists promo_logs (
  id bigserial primary key,
  platform text not null,
  scheduled_post_id bigint,
  success boolean default false,
  response jsonb,
  created_at timestamptz default now()
);

-- Admin key/value settings for scheduler and platforms
create table if not exists admin_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Managed social accounts (per platform)
create table if not exists admin_accounts (
  id bigserial primary key,
  platform text not null check (platform in ('tiktok','twitter','facebook','instagram','whatsapp')),
  label text not null,
  is_active boolean default true,
  credentials jsonb not null, -- stores tokens/ids required by platform
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Foreign key for scheduled_posts → admin_accounts
do $$ begin
  alter table scheduled_posts
    add constraint fk_scheduled_posts_account
    foreign key (account_id) references admin_accounts(id) on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists idx_admin_accounts_platform on admin_accounts(platform);

-- Fans (first-party fanbase)
create table if not exists fans (
  id bigserial primary key,
  phone text,
  email text,
  name text,
  platform text, -- source platform (tiktok, instagram, facebook, web, sms)
  source text,   -- specific campaign/source label (e.g. 'ticketspice', 'fb_leads', 'qr_booth')
  invite_code text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  consent boolean default false,
  consent_ts timestamptz,
  audience_bucket text default 'probation', -- core | probation | blocked
  email_status text,                        -- unknown | invalid_syntax | no_mx | valid_mx | bounced
  bounce_count int default 0,
  last_email_check_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fans_phone on fans(phone);
create index if not exists idx_fans_email on fans(email);
create index if not exists idx_fans_consent on fans(consent);
create index if not exists idx_fans_source on fans(source);
create index if not exists idx_fans_updated_at on fans(updated_at desc);
create index if not exists idx_fans_bucket on fans(audience_bucket);
create index if not exists idx_fans_email_status on fans(email_status);

-- Migrations for existing installations
do $$ begin
  alter table fans add column if not exists audience_bucket text default 'probation';
  alter table fans add column if not exists email_status text;
  alter table fans add column if not exists bounce_count int default 0;
  alter table fans add column if not exists last_email_check_at timestamptz;
exception when duplicate_object then null; end $$;
