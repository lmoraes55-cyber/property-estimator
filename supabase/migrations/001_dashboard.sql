-- profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  first_name text,
  last_name text,
  phone text,
  whatsapp text,
  created_at timestamptz default now()
);

-- properties
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  building_name text not null,
  area text,
  unit_size text,
  unit_type text,
  floor integer,
  view text,
  furnishing_status text,
  property_condition text,
  property_value numeric,
  notes text,
  created_at timestamptz default now()
);

-- saved_reports
create table if not exists public.saved_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references public.properties on delete set null,
  building_name text,
  unit_size text,
  floor integer,
  recommendation text,
  str_net_annual numeric,
  ltr_annual numeric,
  report_params jsonb,
  created_at timestamptz default now()
);

-- service_requests
create table if not exists public.service_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references public.properties on delete set null,
  service_type text not null,
  status text default 'submitted',
  full_name text,
  email text,
  whatsapp text,
  preferred_contact text,
  notes text,
  form_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.saved_reports enable row level security;
alter table public.service_requests enable row level security;

create policy "own_profile" on public.profiles for all using (auth.uid() = id);
create policy "own_properties" on public.properties for all using (auth.uid() = user_id);
create policy "own_reports" on public.saved_reports for all using (auth.uid() = user_id);
create policy "own_requests" on public.service_requests for all using (auth.uid() = user_id);

-- trigger to create profile on signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, first_name)
  values (
    new.id,
    new.email,
    split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 1)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
