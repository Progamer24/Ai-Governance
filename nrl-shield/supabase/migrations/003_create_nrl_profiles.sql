create table if not exists public.nrl_profiles (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles(id) on delete cascade,
	role_id uuid not null references public.roles(id) on delete restrict,
	need_tags text[] not null default '{}',
	level integer not null check (level between 1 and 5),
	granted_by uuid references public.profiles(id) on delete set null,
	valid_from timestamptz not null default now(),
	valid_until timestamptz,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint nrl_validity_check check (valid_until is null or valid_until > valid_from)
);

create index if not exists idx_nrl_profiles_user_active on public.nrl_profiles(user_id, is_active);

alter table public.nrl_profiles enable row level security;
