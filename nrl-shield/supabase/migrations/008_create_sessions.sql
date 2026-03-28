create table if not exists public.active_sessions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles(id) on delete cascade,
	jwt_jti text not null unique,
	ip_address inet,
	user_agent text,
	created_at timestamptz not null default now(),
	last_active timestamptz not null default now(),
	expires_at timestamptz not null,
	is_revoked boolean not null default false
);

create index if not exists idx_active_sessions_user_active on public.active_sessions(user_id, is_revoked, expires_at);

alter table public.active_sessions enable row level security;
