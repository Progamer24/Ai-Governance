create table if not exists public.audit_logs (
	id uuid primary key default gen_random_uuid(),
	event_type text not null,
	actor_id uuid references public.profiles(id) on delete set null,
	target_id uuid,
	target_type text,
	payload_encrypted jsonb not null,
	ip_address inet,
	user_agent text,
	session_id text,
	severity text not null check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
	created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor_created on public.audit_logs(actor_id, created_at desc);
create index if not exists idx_audit_logs_severity_created on public.audit_logs(severity, created_at desc);

alter table public.audit_logs enable row level security;
