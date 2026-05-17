create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  role text not null default 'student' check (role in ('student','admin')),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  user_id text unique
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thumbnail_url text,
  video_url text,
  duration text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.prompt_files (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('men','women')),
  category text not null,
  title text not null,
  prompt_text text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_chats (
  id uuid primary key default gen_random_uuid(),
  channel_name text not null,
  message text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- backward-compatible table kept for current UI
create table if not exists public.prompt_folders (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('men','women')),
  category text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.prompt_files enable row level security;
alter table public.group_chats enable row level security;
alter table public.prompt_folders enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select
using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "lessons_select_auth" on public.lessons for select using (auth.role() = 'authenticated');
create policy "lessons_manage_admin" on public.lessons for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "prompt_files_select_auth" on public.prompt_files for select using (auth.role() = 'authenticated');
create policy "prompt_files_manage_admin" on public.prompt_files for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "group_chats_select_auth" on public.group_chats for select using (auth.role() = 'authenticated');
create policy "group_chats_insert_auth" on public.group_chats for insert with check (auth.role() = 'authenticated');
create policy "group_chats_manage_admin" on public.group_chats for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "group_chats_delete_admin" on public.group_chats for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "folders_select_auth" on public.prompt_folders for select using (auth.role() = 'authenticated');
create policy "folders_manage_admin" on public.prompt_folders for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- Keep profile row synced on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, approved, user_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'student',
    false,
    'USR-' || right(extract(epoch from now())::bigint::text, 6) || '-' || lpad((floor(random()*1000))::int::text,3,'0')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Admin seed profile row (requires auth user to already exist in Supabase Auth)
insert into public.profiles (id, full_name, email, role, approved, user_id)
select u.id, 'Creators Vaultz Admin', 'admin@creatorsvaultz.com', 'admin', true,
       'USR-' || right(extract(epoch from now())::bigint::text, 6) || '-999'
from auth.users u
where u.email = 'admin@creatorsvaultz.com'
on conflict (id) do update set role='admin', approved=true;

notify pgrst, 'reload schema';
