create extension if not exists "pgcrypto";

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  plan text,
  expiry_date date,
  status text,
  created_at timestamp with time zone default now()
);

alter table public.members enable row level security;

create policy "Users can view their own members"
  on public.members for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own members"
  on public.members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own members"
  on public.members for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own members"
  on public.members for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists members_user_id_idx on public.members(user_id);
create index if not exists members_expiry_date_idx on public.members(expiry_date);
