
-- Community subscribers (public opt-in, no auth required)
create table if not exists community_subscribers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null unique,
  zip text not null,
  active boolean default true,
  opted_in_at timestamptz default now(),
  opted_out_at timestamptz,
  source text default 'web'
);
create index if not exists subs_zip on community_subscribers(zip);
create index if not exists subs_active on community_subscribers(active);

-- No RLS — server uses service role key for all access
-- Public can insert via /api/sms/public-optin (rate limited server-side)
