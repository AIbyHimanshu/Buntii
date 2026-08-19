-- Buntii waitlist — run this in the Supabase SQL editor once, then add
-- SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to backend/.env.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null unique,
  role text not null check (role in ('shopper', 'trader')),
  postcode text not null,
  shop_name text,
  shop_type text,
  phone_whatsapp text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referral_code text,
  referred_by text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_signups_role_idx on public.waitlist_signups (role);
create index if not exists waitlist_signups_postcode_idx on public.waitlist_signups (postcode);
create index if not exists waitlist_signups_created_idx on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

-- Public can insert, nobody can read except the service role (admin backend).
create policy "public can join the waitlist"
  on public.waitlist_signups for insert
  to anon
  with check (true);

-- No select/update/delete policies for anon or authenticated:
-- reads and exports only happen server-side with the service_role key,
-- which bypasses RLS by design.
