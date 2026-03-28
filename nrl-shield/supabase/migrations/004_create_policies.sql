create table if not exists public.policies (
	id uuid primary key default gen_random_uuid(),
	name text not null unique,
	description text not null,
	rules jsonb not null default '{}'::jsonb,
	applies_to_roles text[] not null default '{}',
	is_active boolean not null default true,
	priority integer not null default 100,
	created_by uuid references public.profiles(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_policies_active_priority on public.policies(is_active, priority);

alter table public.policies enable row level security;
