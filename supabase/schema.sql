create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id text unique not null,
  name text not null,
  email text unique not null,
  approved boolean not null default false,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  duration text not null,
  thumbnail_url text,
  video_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.prompt_folders (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('men','women')),
  category text not null,
  title text not null,
  content text not null,
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

create table if not exists public.group_posts (
  id uuid primary key default gen_random_uuid(),
  room text not null,
  title text not null,
  message text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.prompt_folders enable row level security;
alter table public.group_posts enable row level security;
alter table public.prompt_files enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select
using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "lessons_select_auth" on public.lessons for select using (auth.role() = 'authenticated');
create policy "lessons_manage_admin" on public.lessons for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "folders_select_auth" on public.prompt_folders for select using (auth.role() = 'authenticated');
create policy "folders_manage_admin" on public.prompt_folders for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "posts_select_auth" on public.group_posts for select using (auth.role() = 'authenticated');
create policy "posts_manage_admin" on public.group_posts for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));


create policy "prompt_files_select_auth" on public.prompt_files for select using (auth.role() = 'authenticated');
create policy "prompt_files_manage_admin" on public.prompt_files for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
