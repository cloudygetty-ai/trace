create extension if not exists postgis;
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text, last_name text, phone text unique, zip text,
  sms_opted_in boolean default false, push_sub jsonb, relay_on boolean default true,
  created_at timestamptz default now()
);

create table if not exists dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, breed text, age text, color text,
  chip_id char(15) unique, chip_type text check (chip_type in ('passive','active')),
  photo_url text, status text not null default 'safe' check (status in ('safe','lost','found')),
  created_at timestamptz default now()
);
create index if not exists dogs_owner on dogs(owner_id);
create index if not exists dogs_chip on dogs(chip_id);

create table if not exists lost_reports (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references dogs(id) on delete cascade,
  last_seen geography(point), radius_m int default 3000,
  reward_cents int default 0, active boolean default true,
  created_at timestamptz default now()
);
create index if not exists lost_geo on lost_reports using gist(last_seen);
create index if not exists lost_dog on lost_reports(dog_id);

create table if not exists sightings (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references dogs(id) on delete cascade,
  reporter_id uuid references auth.users(id),
  source text not null default 'human' check (source in ('relay','human','collar','nfc')),
  geom geography(point) not null, confidence real default 0.5,
  rssi int, photo_url text, created_at timestamptz default now()
);
create index if not exists sightings_geo on sightings using gist(geom);
create index if not exists sightings_dog on sightings(dog_id);

-- RLS
alter table profiles enable row level security;
alter table dogs enable row level security;
alter table lost_reports enable row level security;
alter table sightings enable row level security;

create policy if not exists profiles_self on profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy if not exists dogs_owner on dogs for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy if not exists lost_pub_read on lost_reports for select using (active=true);
create policy if not exists sightings_insert on sightings for insert with check (true);
create policy if not exists sightings_read on sightings for select using (
  exists (select 1 from dogs d where d.id=sightings.dog_id and d.owner_id=auth.uid())
);

-- New user trigger
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into profiles (id,first_name,last_name,phone,zip)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name',
          new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'zip')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Nearby dogs RPC
create or replace function nearby_lost_dogs(lat double precision, lng double precision, radius_m int default 5000)
returns table (dog_id uuid, name text, chip_id text, chip_type text, distance_m double precision)
language sql security definer set search_path=public as $$
  select d.id, d.name, d.chip_id, d.chip_type,
    st_distance(lr.last_seen, st_makepoint(lng,lat)::geography) as distance_m
  from lost_reports lr join dogs d on d.id=lr.dog_id
  where lr.active and st_dwithin(lr.last_seen, st_makepoint(lng,lat)::geography, radius_m)
  order by distance_m asc limit 20;
$$;
