create or replace function public.has_role(role_names text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1
		from public.nrl_profiles np
		join public.roles r on r.id = np.role_id
		where np.user_id = auth.uid()
			and np.is_active = true
			and (np.valid_until is null or np.valid_until > now())
			and r.name = any(role_names)
	);
$$;

-- profiles
drop policy if exists profiles_select_policy on public.profiles;
create policy profiles_select_policy on public.profiles
for select using (
	id = auth.uid() or public.has_role(array['IT_ADMIN', 'SUPERADMIN'])
);

drop policy if exists profiles_update_self_policy on public.profiles;
create policy profiles_update_self_policy on public.profiles
for update using (id = auth.uid());

-- roles
drop policy if exists roles_select_policy on public.roles;
create policy roles_select_policy on public.roles
for select using (auth.uid() is not null);

drop policy if exists roles_superadmin_manage_policy on public.roles;
create policy roles_superadmin_manage_policy on public.roles
for all using (public.has_role(array['SUPERADMIN'])) with check (public.has_role(array['SUPERADMIN']));

-- permissions
drop policy if exists permissions_select_policy on public.permissions;
create policy permissions_select_policy on public.permissions
for select using (auth.uid() is not null);

drop policy if exists permissions_superadmin_manage_policy on public.permissions;
create policy permissions_superadmin_manage_policy on public.permissions
for all using (public.has_role(array['SUPERADMIN'])) with check (public.has_role(array['SUPERADMIN']));

-- role_permissions
drop policy if exists role_permissions_select_policy on public.role_permissions;
create policy role_permissions_select_policy on public.role_permissions
for select using (auth.uid() is not null);

drop policy if exists role_permissions_superadmin_manage_policy on public.role_permissions;
create policy role_permissions_superadmin_manage_policy on public.role_permissions
for all using (public.has_role(array['SUPERADMIN'])) with check (public.has_role(array['SUPERADMIN']));

-- nrl_profiles
drop policy if exists nrl_profiles_select_policy on public.nrl_profiles;
create policy nrl_profiles_select_policy on public.nrl_profiles
for select using (
	user_id = auth.uid() or public.has_role(array['IT_ADMIN', 'SUPERADMIN'])
);

drop policy if exists nrl_profiles_admin_manage_policy on public.nrl_profiles;
create policy nrl_profiles_admin_manage_policy on public.nrl_profiles
for all using (public.has_role(array['IT_ADMIN', 'SUPERADMIN'])) with check (public.has_role(array['IT_ADMIN', 'SUPERADMIN']));

-- policies
drop policy if exists policies_select_policy on public.policies;
create policy policies_select_policy on public.policies
for select using (public.has_role(array['IT_ADMIN', 'SUPERADMIN']));

drop policy if exists policies_superadmin_manage_policy on public.policies;
create policy policies_superadmin_manage_policy on public.policies
for all using (public.has_role(array['SUPERADMIN'])) with check (public.has_role(array['SUPERADMIN']));

-- ai_queries
drop policy if exists ai_queries_select_policy on public.ai_queries;
create policy ai_queries_select_policy on public.ai_queries
for select using (
	user_id = auth.uid() or public.has_role(array['AUDITOR', 'IT_ADMIN', 'SUPERADMIN'])
);

drop policy if exists ai_queries_insert_policy on public.ai_queries;
create policy ai_queries_insert_policy on public.ai_queries
for insert with check (user_id = auth.uid() or public.has_role(array['IT_ADMIN', 'SUPERADMIN']));

-- audit_logs (append-only)
drop policy if exists audit_logs_select_policy on public.audit_logs;
create policy audit_logs_select_policy on public.audit_logs
for select using (public.has_role(array['AUDITOR', 'IT_ADMIN', 'SUPERADMIN']));

drop policy if exists audit_logs_insert_policy on public.audit_logs;
create policy audit_logs_insert_policy on public.audit_logs
for insert with check (auth.uid() is not null);

-- anomalies
drop policy if exists anomalies_admin_policy on public.anomalies;
create policy anomalies_admin_policy on public.anomalies
for all using (public.has_role(array['IT_ADMIN', 'SUPERADMIN'])) with check (public.has_role(array['IT_ADMIN', 'SUPERADMIN']));

-- active_sessions
drop policy if exists active_sessions_select_policy on public.active_sessions;
create policy active_sessions_select_policy on public.active_sessions
for select using (
	user_id = auth.uid() or public.has_role(array['IT_ADMIN', 'SUPERADMIN'])
);

drop policy if exists active_sessions_user_insert_policy on public.active_sessions;
create policy active_sessions_user_insert_policy on public.active_sessions
for insert with check (user_id = auth.uid() or public.has_role(array['IT_ADMIN', 'SUPERADMIN']));

drop policy if exists active_sessions_update_policy on public.active_sessions;
create policy active_sessions_update_policy on public.active_sessions
for update using (
	user_id = auth.uid() or public.has_role(array['IT_ADMIN', 'SUPERADMIN'])
);
