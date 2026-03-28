create table if not exists public.anomalies (
	id uuid primary key default gen_random_uuid(),
	audit_log_id uuid not null references public.audit_logs(id) on delete cascade,
	anomaly_type text not null,
	risk_delta numeric(5,2) not null,
	resolved boolean not null default false,
	resolved_by uuid references public.profiles(id) on delete set null,
	resolved_at timestamptz,
	admin_notes text,
	created_at timestamptz not null default now()
);

create index if not exists idx_anomalies_resolved_created on public.anomalies(resolved, created_at desc);

alter table public.anomalies enable row level security;
