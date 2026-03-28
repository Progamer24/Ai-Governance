create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_nrl_profiles_updated_at on public.nrl_profiles;
create trigger set_nrl_profiles_updated_at
before update on public.nrl_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_policies_updated_at on public.policies;
create trigger set_policies_updated_at
before update on public.policies
for each row execute function public.set_updated_at();

create or replace function public.prevent_audit_log_changes()
returns trigger
language plpgsql
as $$
begin
	raise exception 'audit_logs is append-only';
end;
$$;

drop trigger if exists prevent_audit_log_update on public.audit_logs;
create trigger prevent_audit_log_update
before update on public.audit_logs
for each row execute function public.prevent_audit_log_changes();

drop trigger if exists prevent_audit_log_delete on public.audit_logs;
create trigger prevent_audit_log_delete
before delete on public.audit_logs
for each row execute function public.prevent_audit_log_changes();
