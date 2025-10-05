-- SMS Verification Support Patch
-- Creates phone_verifications table for secure SMS code lifecycle.
-- Idempotent: use IF NOT EXISTS patterns & safe guards.

create table if not exists public.phone_verifications (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  ip_hash text,
  -- Optional future metadata columns (ua, locale, channel)
  constraint phone_verifications_phone_length check (char_length(phone) between 8 and 20)
);

-- Index for active lookups
create index if not exists idx_phone_verifications_active on public.phone_verifications (phone, expires_at desc)
  where consumed_at is null;

-- Drop old duplicates if any (optional clean up logic could be added here)

-- RLS (access only through service role functions) - lock down for anonymous
alter table public.phone_verifications enable row level security;

-- Deny all by default (no policies) – functions using service role bypass RLS.
-- If later you want user self-access, define a policy limited to their own phone after binding phone to auth identity.

-- Optional cleanup function
create or replace function public.cleanup_phone_verifications(retention_hours int default 24)
returns int
language plpgsql
security definer set search_path = public as $$
DECLARE
  v_deleted int;
BEGIN
  delete from public.phone_verifications
  where (consumed_at is not null and consumed_at < now() - (retention_hours || ' hours')::interval)
     or (expires_at < now() - (retention_hours || ' hours')::interval);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  return v_deleted;
END;$$;

comment on function public.cleanup_phone_verifications is 'Removes expired / consumed phone verification rows beyond retention window';
