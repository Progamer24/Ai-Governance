create table if not exists public.ai_queries (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles(id) on delete cascade,
	session_id text not null,
	query_encrypted text not null,
	query_hash text not null,
	response_encrypted text not null,
	prompt_guard_score numeric(5,4) not null check (prompt_guard_score between 0 and 1),
	risk_score numeric(5,2) not null check (risk_score between 0 and 100),
	nrl_context jsonb not null,
	model_used text not null,
	tokens_used integer not null default 0,
	response_time_ms integer not null default 0,
	was_filtered boolean not null default false,
	filter_reason text,
	anomaly_flagged boolean not null default false,
	created_at timestamptz not null default now()
);

create index if not exists idx_ai_queries_user_created on public.ai_queries(user_id, created_at desc);
create index if not exists idx_ai_queries_hash on public.ai_queries(query_hash);

alter table public.ai_queries enable row level security;
