create extension if not exists pgcrypto;

create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	full_name text,
	email text not null unique,
	avatar_url text,
	department text,
	employee_id text unique,
	is_active boolean not null default true,
	is_mfa_enabled boolean not null default false,
	failed_login_count integer not null default 0,
	locked_until timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
