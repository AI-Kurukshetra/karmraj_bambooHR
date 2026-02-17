-- Grant Super Admin to an existing Supabase Auth user (by email).
-- Run this in Supabase Dashboard → SQL Editor (runs with admin privileges).
--
-- IMPORTANT:
-- 1) First create the Auth user in: Authentication → Users → "Add user"
-- 2) Then run this script.
--
-- This script is multi-tenant: it creates the organization (if missing) and
-- assigns the user to it, then grants the "Super Admin" role.

do $$
declare
  v_email text := 'karmrajsinh.vaghela@bacancy.com';
  v_org_name text := 'Bacancy';

  v_user_id uuid;
  v_org_id uuid;
  v_role_id uuid;
begin
  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    raise exception 'Auth user not found for email %. Create it in Supabase Auth first.', v_email;
  end if;

  -- Ensure base permissions exist
  insert into public.permissions(key)
  values
    ('employees.read'),
    ('employees.write'),
    ('compensation.read'),
    ('compensation.write'),
    ('leave.read'),
    ('leave.write'),
    ('leave.approve'),
    ('reports.export')
  on conflict do nothing;

  -- Ensure org exists
  select o.id into v_org_id
  from public.organizations o
  where o.deleted_at is null
    and lower(o.name) = lower(v_org_name)
  limit 1;

  if v_org_id is null then
    insert into public.organizations(name)
    values (v_org_name)
    returning id into v_org_id;
  end if;

  -- Ensure membership exists and is primary
  update public.organization_members
  set deleted_at = null,
      is_primary = true
  where org_id = v_org_id
    and user_id = v_user_id;

  if not found then
    insert into public.organization_members(org_id, user_id, is_primary)
    values (v_org_id, v_user_id, true);
  end if;

  update public.organization_members
  set is_primary = true
  where user_id = v_user_id
    and org_id = v_org_id
    and deleted_at is null;

  -- Ensure roles exist
  insert into public.roles(org_id, name)
  values
    (v_org_id, 'Account Owner'),
    (v_org_id, 'Super Admin'),
    (v_org_id, 'HR Admin'),
    (v_org_id, 'Payroll Admin'),
    (v_org_id, 'Manager'),
    (v_org_id, 'Employee')
  on conflict do nothing;

  select r.id into v_role_id
  from public.roles r
  where r.org_id = v_org_id
    and r.deleted_at is null
    and r.name = 'Super Admin'
  limit 1;

  if v_role_id is null then
    raise exception 'Super Admin role missing for org %', v_org_id;
  end if;

  -- Ensure Super Admin has all seeded permissions
  insert into public.role_permissions(role_id, permission_id)
  select v_role_id, p.id
  from public.permissions p
  where p.key in (
    'employees.read','employees.write',
    'compensation.read','compensation.write',
    'leave.read','leave.write','leave.approve',
    'reports.export'
  )
  on conflict do nothing;

  -- Assign role
  insert into public.user_roles(org_id, user_id, role_id)
  values (v_org_id, v_user_id, v_role_id)
  on conflict do nothing;

  raise notice 'Granted Super Admin to % in org % (%)', v_email, v_org_id, v_org_name;
end $$;

