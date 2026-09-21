-- Phase 2 Workstream F — make the "service_role-only" access model explicit
-- and testable instead of implicit-by-absence-of-policies. Functionally a
-- no-op today (RLS enabled + zero policies already denies anon/authenticated
-- everything, and service_role bypasses RLS regardless of policies either
-- way) — this just makes that intent an explicit, queryable policy per
-- table rather than "nobody happened to add one yet".
do $$
declare
  target text;
begin
  foreach target in array array['site_content', 'admin_users', 'media', 'page_revisions', 'audit_log']
  loop
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = target and policyname = 'deny_all'
    ) then
      execute format('create policy deny_all on public.%I for all using (false) with check (false)', target);
    end if;
  end loop;
end $$;
