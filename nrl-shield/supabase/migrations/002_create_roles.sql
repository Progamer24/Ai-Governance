create table if not exists public.roles (
	id uuid primary key default gen_random_uuid(),
	name text not null unique,
	description text not null,
	level integer not null check (level between 1 and 5),
	department text,
	is_system_role boolean not null default false,
	created_at timestamptz not null default now()
);

create table if not exists public.permissions (
	id uuid primary key default gen_random_uuid(),
	name text not null unique,
	resource text not null,
	action text not null check (action in ('READ', 'WRITE', 'DELETE', 'QUERY_AI')),
	level_required integer not null check (level_required between 1 and 5),
	need_required text[] not null default '{}'
);

create table if not exists public.role_permissions (
	role_id uuid not null references public.roles(id) on delete cascade,
	permission_id uuid not null references public.permissions(id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (role_id, permission_id)
);

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
