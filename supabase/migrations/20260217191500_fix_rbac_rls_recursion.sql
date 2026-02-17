-- Fix: stack depth limit exceeded
-- Cause: RLS policies on RBAC tables called has_role/has_permission, which queried RBAC tables again under RLS.
-- Solution: run helper lookups as SECURITY DEFINER with row_security = off.

begin;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select om.org_id
  from public.organization_members om
  where om.user_id = auth.uid()
    and om.deleted_at is null
  order by om.is_primary desc, om.created_at asc
  limit 1;
$$;

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.org_id = p_org_id
      and om.user_id = auth.uid()
      and om.deleted_at is null
  );
$$;

create or replace function public.current_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select e.id
  from public.employees e
  where e.user_id = auth.uid()
    and e.org_id = public.current_org_id()
    and e.deleted_at is null
  limit 1;
$$;

create or replace function public.has_role(p_role_name text, p_org_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  with org as (
    select coalesce(p_org_id, public.current_org_id()) as org_id
  )
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join org on org.org_id = ur.org_id
    where ur.user_id = auth.uid()
      and ur.org_id = org.org_id
      and ur.deleted_at is null
      and r.deleted_at is null
      and r.name = p_role_name
  );
$$;

create or replace function public.has_permission(p_permission_key text, p_org_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  with org as (
    select coalesce(p_org_id, public.current_org_id()) as org_id
  )
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    join org on org.org_id = ur.org_id
    where ur.user_id = auth.uid()
      and ur.org_id = org.org_id
      and ur.deleted_at is null
      and r.deleted_at is null
      and p.key = p_permission_key
  );
$$;

-- Permissions: keep callable by authenticated only
revoke all on function public.current_org_id() from public;
grant execute on function public.current_org_id() to authenticated;

revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;

revoke all on function public.current_employee_id() from public;
grant execute on function public.current_employee_id() to authenticated;

revoke all on function public.has_role(text, uuid) from public;
grant execute on function public.has_role(text, uuid) to authenticated;

revoke all on function public.has_permission(text, uuid) from public;
grant execute on function public.has_permission(text, uuid) to authenticated;

commit;

