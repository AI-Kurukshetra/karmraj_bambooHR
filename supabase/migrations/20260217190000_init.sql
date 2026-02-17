-- HRIS Phase 1 (multi-tenant) - initial schema + RLS + indexes
-- Apply in Supabase SQL editor (or via CLI migrations).

begin;

-- Extensions
create extension if not exists pgcrypto;

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- Organizations / membership
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger trg_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists organization_members_org_user_unique
  on public.organization_members(org_id, user_id)
  where deleted_at is null;

create unique index if not exists organization_members_primary_unique
  on public.organization_members(user_id)
  where deleted_at is null and is_primary = true;

create index if not exists organization_members_user_id_idx
  on public.organization_members(user_id)
  where deleted_at is null;

create trigger trg_org_members_updated_at
before update on public.organization_members
for each row execute function public.set_updated_at();

create or replace function public.current_org_id()
returns uuid
language sql
stable
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
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.org_id = p_org_id
      and om.user_id = auth.uid()
      and om.deleted_at is null
  );
$$;

-- Core HR
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists departments_org_name_unique
  on public.departments(org_id, name)
  where deleted_at is null;

create trigger trg_departments_updated_at
before update on public.departments
for each row execute function public.set_updated_at();

create table if not exists public.designations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  department_id uuid references public.departments(id),
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists designations_department_id_idx
  on public.designations(department_id)
  where deleted_at is null;

create trigger trg_designations_updated_at
before update on public.designations
for each row execute function public.set_updated_at();

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid references auth.users(id),
  employee_code text not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  dob date,
  gender text,
  marital_status text,
  department_id uuid references public.departments(id),
  designation_id uuid references public.designations(id),
  manager_id uuid references public.employees(id),
  employment_type text,
  joining_date date,
  confirmation_date date,
  employment_status text not null default 'active',
  work_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint employees_org_employee_code_unique unique (org_id, employee_code),
  constraint employees_org_email_unique unique (org_id, email)
);

create index if not exists employees_org_department_id_idx
  on public.employees(org_id, department_id)
  where deleted_at is null;

create index if not exists employees_org_manager_id_idx
  on public.employees(org_id, manager_id)
  where deleted_at is null;

create index if not exists employees_org_employment_status_idx
  on public.employees(org_id, employment_status)
  where deleted_at is null;

create index if not exists employees_user_id_idx
  on public.employees(user_id)
  where deleted_at is null;

create trigger trg_employees_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

create or replace function public.current_employee_id()
returns uuid
language sql
stable
as $$
  select e.id
  from public.employees e
  where e.user_id = auth.uid()
    and e.org_id = public.current_org_id()
    and e.deleted_at is null
  limit 1;
$$;

create table if not exists public.compensation (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  employee_id uuid not null references public.employees(id),
  base_salary numeric(12,2) not null default 0,
  bonus numeric(12,2) not null default 0,
  bank_account text,
  ifsc_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists compensation_org_employee_unique
  on public.compensation(org_id, employee_id)
  where deleted_at is null;

create index if not exists compensation_employee_id_idx
  on public.compensation(employee_id)
  where deleted_at is null;

create trigger trg_compensation_updated_at
before update on public.compensation
for each row execute function public.set_updated_at();

create table if not exists public.employee_documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  employee_id uuid not null references public.employees(id),
  file_path text not null,
  document_type text not null,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists employee_documents_employee_id_idx
  on public.employee_documents(employee_id)
  where deleted_at is null;

create trigger trg_employee_documents_updated_at
before update on public.employee_documents
for each row execute function public.set_updated_at();

-- RBAC
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint roles_org_name_unique unique (org_id, name)
);

create trigger trg_roles_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  created_at timestamptz not null default now()
);

-- Seed minimal permissions (extend as needed)
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

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  role_id uuid not null references public.roles(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists user_roles_org_user_idx
  on public.user_roles(org_id, user_id)
  where deleted_at is null;

create or replace function public.has_role(p_role_name text, p_org_id uuid default null)
returns boolean
language sql
stable
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

-- Bootstrap: create org + base roles + permissions for the current user
create or replace function public.bootstrap_current_user_org(p_org_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_org_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- If the user already has an org, keep it stable.
  v_org_id := public.current_org_id();
  if v_org_id is not null then
    return v_org_id;
  end if;

  insert into public.organizations(name)
  values (p_org_name)
  returning id into v_org_id;

  insert into public.organization_members(org_id, user_id, is_primary)
  values (v_org_id, v_user_id, true);

  -- Base roles for the org
  insert into public.roles(org_id, name)
  values
    (v_org_id, 'Account Owner'),
    (v_org_id, 'Super Admin'),
    (v_org_id, 'HR Admin'),
    (v_org_id, 'Payroll Admin'),
    (v_org_id, 'Manager'),
    (v_org_id, 'Employee')
  on conflict do nothing;

  -- Assign Account Owner role to current user
  insert into public.user_roles(org_id, user_id, role_id)
  select v_org_id, v_user_id, r.id
  from public.roles r
  where r.org_id = v_org_id and r.name = 'Account Owner'
  on conflict do nothing;

  -- Helper: attach permission to a role
  insert into public.role_permissions(role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p on p.key in (
    'employees.read','employees.write','leave.read','leave.write','leave.approve','reports.export','compensation.read','compensation.write'
  )
  where r.org_id = v_org_id
    and r.name in ('Account Owner','Super Admin')
  on conflict do nothing;

  insert into public.role_permissions(role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p on p.key in (
    'employees.read','employees.write','leave.read','leave.write','leave.approve','reports.export'
  )
  where r.org_id = v_org_id
    and r.name = 'HR Admin'
  on conflict do nothing;

  insert into public.role_permissions(role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p on p.key in (
    'compensation.read','compensation.write'
  )
  where r.org_id = v_org_id
    and r.name = 'Payroll Admin'
  on conflict do nothing;

  insert into public.role_permissions(role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p on p.key in (
    'employees.read','leave.read','leave.approve'
  )
  where r.org_id = v_org_id
    and r.name = 'Manager'
  on conflict do nothing;

  insert into public.role_permissions(role_id, permission_id)
  select r.id, p.id
  from public.roles r
  join public.permissions p on p.key in (
    'leave.read','leave.write'
  )
  where r.org_id = v_org_id
    and r.name = 'Employee'
  on conflict do nothing;

  return v_org_id;
end;
$$;

revoke all on function public.bootstrap_current_user_org(text) from public;
grant execute on function public.bootstrap_current_user_org(text) to authenticated;

-- Leave management
create table if not exists public.leave_types (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  name text not null,
  annual_quota integer not null default 0,
  is_accrual_based boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint leave_types_org_name_unique unique (org_id, name)
);

create trigger trg_leave_types_updated_at
before update on public.leave_types
for each row execute function public.set_updated_at();

create table if not exists public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  employee_id uuid not null references public.employees(id),
  leave_type_id uuid not null references public.leave_types(id),
  balance numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint leave_balances_org_employee_type_unique unique (org_id, employee_id, leave_type_id)
);

create index if not exists leave_balances_employee_id_idx
  on public.leave_balances(employee_id)
  where deleted_at is null;

create trigger trg_leave_balances_updated_at
before update on public.leave_balances
for each row execute function public.set_updated_at();

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  employee_id uuid not null references public.employees(id),
  leave_type_id uuid not null references public.leave_types(id),
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'pending',
  approved_by uuid references public.employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists leave_requests_employee_id_idx
  on public.leave_requests(employee_id)
  where deleted_at is null;

create index if not exists leave_requests_status_idx
  on public.leave_requests(org_id, status)
  where deleted_at is null;

create trigger trg_leave_requests_updated_at
before update on public.leave_requests
for each row execute function public.set_updated_at();

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  name text not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint holidays_org_date_unique unique (org_id, date)
);

create trigger trg_holidays_updated_at
before update on public.holidays
for each row execute function public.set_updated_at();

create or replace function public.calculate_leave_days(p_org_id uuid, p_start date, p_end date)
returns integer
language sql
stable
as $$
  select count(*)
  from generate_series(p_start, p_end, interval '1 day') as d(day)
  where extract(dow from d.day) not in (0, 6)
    and not exists (
      select 1 from public.holidays h
      where h.org_id = p_org_id
        and h.deleted_at is null
        and h.date = (d.day::date)
    );
$$;

create or replace function public.process_leave_request(p_request_id uuid, p_new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.leave_requests%rowtype;
  v_actor_employee_id uuid;
  v_days integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_req
  from public.leave_requests
  where id = p_request_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Leave request not found';
  end if;

  if v_req.status <> 'pending' then
    raise exception 'Leave request is not pending';
  end if;

  v_actor_employee_id := public.current_employee_id();

  -- Permission: HR Admin (or higher) OR manager of the employee (direct report) with leave.approve
  if not (
    public.has_permission('leave.approve', v_req.org_id)
    and (
      public.has_role('HR Admin', v_req.org_id)
      or public.has_role('Super Admin', v_req.org_id)
      or public.has_role('Account Owner', v_req.org_id)
      or exists (
        select 1 from public.employees e
        where e.id = v_req.employee_id
          and e.org_id = v_req.org_id
          and e.deleted_at is null
          and e.manager_id = v_actor_employee_id
      )
    )
  ) then
    raise exception 'Forbidden';
  end if;

  if p_new_status = 'approved' then
    v_days := public.calculate_leave_days(v_req.org_id, v_req.start_date, v_req.end_date);

    update public.leave_balances lb
    set balance = lb.balance - v_days
    where lb.org_id = v_req.org_id
      and lb.employee_id = v_req.employee_id
      and lb.leave_type_id = v_req.leave_type_id
      and lb.deleted_at is null;

    if not found then
      raise exception 'Leave balance not found';
    end if;

    -- Ensure non-negative
    if exists (
      select 1 from public.leave_balances lb
      where lb.org_id = v_req.org_id
        and lb.employee_id = v_req.employee_id
        and lb.leave_type_id = v_req.leave_type_id
        and lb.deleted_at is null
        and lb.balance < 0
    ) then
      raise exception 'Insufficient leave balance';
    end if;

    update public.leave_requests
    set status = 'approved',
        approved_by = v_actor_employee_id
    where id = v_req.id;
  elsif p_new_status = 'rejected' then
    update public.leave_requests
    set status = 'rejected',
        approved_by = v_actor_employee_id
    where id = v_req.id;
  else
    raise exception 'Invalid status';
  end if;
end;
$$;

revoke all on function public.process_leave_request(uuid, text) from public;
grant execute on function public.process_leave_request(uuid, text) to authenticated;

-- Onboarding / offboarding
create table if not exists public.onboarding_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger trg_onboarding_templates_updated_at
before update on public.onboarding_templates
for each row execute function public.set_updated_at();

create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  employee_id uuid not null references public.employees(id),
  assigned_to uuid references auth.users(id),
  task_title text not null,
  status text not null default 'pending',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists onboarding_tasks_employee_id_idx
  on public.onboarding_tasks(employee_id)
  where deleted_at is null;

create trigger trg_onboarding_tasks_updated_at
before update on public.onboarding_tasks
for each row execute function public.set_updated_at();

create table if not exists public.offboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  employee_id uuid not null references public.employees(id),
  assigned_to uuid references auth.users(id),
  task_title text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists offboarding_tasks_employee_id_idx
  on public.offboarding_tasks(employee_id)
  where deleted_at is null;

create trigger trg_offboarding_tasks_updated_at
before update on public.offboarding_tasks
for each row execute function public.set_updated_at();

-- Audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  user_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  timestamp timestamptz not null default now()
);

create index if not exists audit_logs_org_timestamp_idx
  on public.audit_logs(org_id, timestamp desc);

-- Audit triggers
create or replace function public.audit_employee_update()
returns trigger
language plpgsql
as $$
begin
  insert into public.audit_logs(org_id, user_id, action, entity, entity_id)
  values (new.org_id, auth.uid(), 'employee.update', 'employees', new.id);
  return new;
end;
$$;

drop trigger if exists trg_audit_employee_update on public.employees;
create trigger trg_audit_employee_update
after update on public.employees
for each row
when (old.* is distinct from new.*)
execute function public.audit_employee_update();

create or replace function public.audit_user_role_change()
returns trigger
language plpgsql
as $$
declare
  v_org_id uuid;
  v_entity_id uuid;
begin
  v_org_id := coalesce(new.org_id, old.org_id);
  v_entity_id := coalesce(new.id, old.id);
  insert into public.audit_logs(org_id, user_id, action, entity, entity_id)
  values (v_org_id, auth.uid(), 'role.change', 'user_roles', v_entity_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_user_roles on public.user_roles;
create trigger trg_audit_user_roles
after insert or update or delete on public.user_roles
for each row execute function public.audit_user_role_change();

create or replace function public.audit_leave_approval()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status and new.status in ('approved', 'rejected') then
    insert into public.audit_logs(org_id, user_id, action, entity, entity_id)
    values (new.org_id, auth.uid(), 'leave.approval', 'leave_requests', new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_leave_approval on public.leave_requests;
create trigger trg_audit_leave_approval
after update on public.leave_requests
for each row execute function public.audit_leave_approval();

-- Reporting RPCs (CSV export uses these)
create or replace function public.report_headcount_by_department()
returns table(department_name text, headcount bigint)
language sql
stable
as $$
  select d.name as department_name, count(e.id) as headcount
  from public.departments d
  left join public.employees e
    on e.department_id = d.id
   and e.deleted_at is null
  where d.org_id = public.current_org_id()
    and d.deleted_at is null
  group by d.name
  order by d.name asc;
$$;

revoke all on function public.report_headcount_by_department() from public;
grant execute on function public.report_headcount_by_department() to authenticated;

create or replace function public.report_active_vs_inactive()
returns table(active_count bigint, inactive_count bigint)
language sql
stable
as $$
  select
    count(*) filter (where e.employment_status = 'active') as active_count,
    count(*) filter (where e.employment_status <> 'active') as inactive_count
  from public.employees e
  where e.org_id = public.current_org_id()
    and e.deleted_at is null;
$$;

revoke all on function public.report_active_vs_inactive() from public;
grant execute on function public.report_active_vs_inactive() to authenticated;

-- Monthly accrual (schedule via Supabase scheduled functions / cron)
create or replace function public.accrue_monthly_leave(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type record;
begin
  for v_type in
    select id, annual_quota
    from public.leave_types
    where org_id = p_org_id
      and deleted_at is null
      and is_accrual_based = true
  loop
    update public.leave_balances lb
    set balance = lb.balance + (v_type.annual_quota::numeric / 12.0)
    where lb.org_id = p_org_id
      and lb.leave_type_id = v_type.id
      and lb.deleted_at is null;
  end loop;
end;
$$;

revoke all on function public.accrue_monthly_leave(uuid) from public;
grant execute on function public.accrue_monthly_leave(uuid) to service_role;

-- =========================
-- RLS (enable on all tables)
-- =========================

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.departments enable row level security;
alter table public.designations enable row level security;
alter table public.employees enable row level security;
alter table public.compensation enable row level security;
alter table public.employee_documents enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.leave_types enable row level security;
alter table public.leave_balances enable row level security;
alter table public.leave_requests enable row level security;
alter table public.holidays enable row level security;
alter table public.onboarding_templates enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.offboarding_tasks enable row level security;
alter table public.audit_logs enable row level security;

-- Organizations: members can view; owner/admin can manage (simplified)
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
for select
using (public.is_org_member(id) and deleted_at is null);

drop policy if exists org_update on public.organizations;
create policy org_update on public.organizations
for update
using (public.has_role('Account Owner', id) and deleted_at is null)
with check (public.has_role('Account Owner', id));

drop policy if exists org_insert on public.organizations;
create policy org_insert on public.organizations
for insert
with check (auth.uid() is not null);

-- Organization members: user can see own membership; HR/admin can manage
drop policy if exists org_members_select on public.organization_members;
create policy org_members_select on public.organization_members
for select
using (
  deleted_at is null
  and (
    user_id = auth.uid()
    or public.has_role('HR Admin', org_id)
    or public.has_role('Super Admin', org_id)
    or public.has_role('Account Owner', org_id)
  )
);

drop policy if exists org_members_mutate on public.organization_members;
create policy org_members_mutate on public.organization_members
for all
using (
  deleted_at is null
  and (
    public.has_role('HR Admin', org_id)
    or public.has_role('Super Admin', org_id)
    or public.has_role('Account Owner', org_id)
  )
)
with check (
  public.has_role('HR Admin', org_id)
  or public.has_role('Super Admin', org_id)
  or public.has_role('Account Owner', org_id)
);

-- Departments / designations: org members can read, HR/admin can write
drop policy if exists departments_select on public.departments;
create policy departments_select on public.departments
for select using (deleted_at is null and public.is_org_member(org_id));

drop policy if exists departments_write on public.departments;
create policy departments_write on public.departments
for insert with check (public.has_permission('employees.write', org_id));

drop policy if exists departments_update on public.departments;
create policy departments_update on public.departments
for update using (public.has_permission('employees.write', org_id) and deleted_at is null)
with check (public.has_permission('employees.write', org_id));

drop policy if exists departments_delete on public.departments;
create policy departments_delete on public.departments
for delete using (false);

drop policy if exists designations_select on public.designations;
create policy designations_select on public.designations
for select using (deleted_at is null and public.is_org_member(org_id));

drop policy if exists designations_write on public.designations;
create policy designations_write on public.designations
for insert with check (public.has_permission('employees.write', org_id));

drop policy if exists designations_update on public.designations;
create policy designations_update on public.designations
for update using (public.has_permission('employees.write', org_id) and deleted_at is null)
with check (public.has_permission('employees.write', org_id));

drop policy if exists designations_delete on public.designations;
create policy designations_delete on public.designations
for delete using (false);

-- Employees: self, manager direct reports, HR/admin all
drop policy if exists employees_select on public.employees;
create policy employees_select on public.employees
for select
using (
  deleted_at is null
  and org_id = public.current_org_id()
  and (
    user_id = auth.uid()
    or manager_id = public.current_employee_id()
    or public.has_permission('employees.read', org_id)
  )
);

drop policy if exists employees_insert on public.employees;
create policy employees_insert on public.employees
for insert
with check (public.has_permission('employees.write', org_id));

drop policy if exists employees_update_self on public.employees;
create policy employees_update_self on public.employees
for update
using (deleted_at is null and org_id = public.current_org_id() and user_id = auth.uid())
with check (org_id = public.current_org_id());

drop policy if exists employees_update_admin on public.employees;
create policy employees_update_admin on public.employees
for update
using (deleted_at is null and public.has_permission('employees.write', org_id))
with check (public.has_permission('employees.write', org_id));

drop policy if exists employees_delete on public.employees;
create policy employees_delete on public.employees
for delete using (false);

-- Compensation: payroll + hr/admin only
drop policy if exists compensation_select on public.compensation;
create policy compensation_select on public.compensation
for select
using (
  deleted_at is null
  and org_id = public.current_org_id()
  and public.has_permission('compensation.read', org_id)
);

drop policy if exists compensation_write on public.compensation;
create policy compensation_write on public.compensation
for insert
with check (public.has_permission('compensation.write', org_id));

drop policy if exists compensation_update on public.compensation;
create policy compensation_update on public.compensation
for update
using (deleted_at is null and public.has_permission('compensation.write', org_id))
with check (public.has_permission('compensation.write', org_id));

drop policy if exists compensation_delete on public.compensation;
create policy compensation_delete on public.compensation
for delete using (false);

-- Employee documents: self, manager direct reports, HR/admin
drop policy if exists employee_docs_select on public.employee_documents;
create policy employee_docs_select on public.employee_documents
for select
using (
  deleted_at is null
  and org_id = public.current_org_id()
  and (
    employee_id = public.current_employee_id()
    or exists (
      select 1 from public.employees e
      where e.id = employee_documents.employee_id
        and e.manager_id = public.current_employee_id()
        and e.deleted_at is null
    )
    or public.has_permission('employees.read', org_id)
  )
);

drop policy if exists employee_docs_write on public.employee_documents;
create policy employee_docs_write on public.employee_documents
for insert
with check (public.has_permission('employees.write', org_id));

drop policy if exists employee_docs_update on public.employee_documents;
create policy employee_docs_update on public.employee_documents
for update
using (deleted_at is null and public.has_permission('employees.write', org_id))
with check (public.has_permission('employees.write', org_id));

drop policy if exists employee_docs_delete on public.employee_documents;
create policy employee_docs_delete on public.employee_documents
for delete using (false);

-- RBAC tables: HR/admin only within org; permissions table readable to authenticated
drop policy if exists permissions_select on public.permissions;
create policy permissions_select on public.permissions
for select using (auth.uid() is not null);

drop policy if exists permissions_mutate on public.permissions;
create policy permissions_mutate on public.permissions
for all using (false) with check (false);

drop policy if exists roles_select on public.roles;
create policy roles_select on public.roles
for select using (deleted_at is null and public.has_permission('employees.read', org_id));

drop policy if exists roles_mutate on public.roles;
create policy roles_mutate on public.roles
for all
using (deleted_at is null and public.has_role('HR Admin', org_id))
with check (public.has_role('HR Admin', org_id));

drop policy if exists role_permissions_select on public.role_permissions;
create policy role_permissions_select on public.role_permissions
for select using (auth.uid() is not null);

drop policy if exists role_permissions_mutate on public.role_permissions;
create policy role_permissions_mutate on public.role_permissions
for all using (public.has_role('HR Admin', (select org_id from public.roles r where r.id = role_permissions.role_id)))
with check (public.has_role('HR Admin', (select org_id from public.roles r where r.id = role_permissions.role_id)));

drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles
for select using (deleted_at is null and public.has_role('HR Admin', org_id));

drop policy if exists user_roles_mutate on public.user_roles;
create policy user_roles_mutate on public.user_roles
for all
using (deleted_at is null and public.has_role('HR Admin', org_id))
with check (public.has_role('HR Admin', org_id));

-- Leave types / balances / requests
drop policy if exists leave_types_select on public.leave_types;
create policy leave_types_select on public.leave_types
for select using (deleted_at is null and public.is_org_member(org_id));

drop policy if exists leave_types_mutate on public.leave_types;
create policy leave_types_mutate on public.leave_types
for all
using (deleted_at is null and public.has_permission('leave.write', org_id))
with check (public.has_permission('leave.write', org_id));

drop policy if exists leave_balances_select on public.leave_balances;
create policy leave_balances_select on public.leave_balances
for select
using (
  deleted_at is null
  and org_id = public.current_org_id()
  and (
    employee_id = public.current_employee_id()
    or exists (
      select 1 from public.employees e
      where e.id = leave_balances.employee_id
        and e.manager_id = public.current_employee_id()
        and e.deleted_at is null
    )
    or public.has_permission('leave.read', org_id)
  )
);

drop policy if exists leave_balances_mutate on public.leave_balances;
create policy leave_balances_mutate on public.leave_balances
for all
using (deleted_at is null and public.has_permission('leave.write', org_id))
with check (public.has_permission('leave.write', org_id));

drop policy if exists leave_requests_select on public.leave_requests;
create policy leave_requests_select on public.leave_requests
for select
using (
  deleted_at is null
  and org_id = public.current_org_id()
  and (
    employee_id = public.current_employee_id()
    or exists (
      select 1 from public.employees e
      where e.id = leave_requests.employee_id
        and e.manager_id = public.current_employee_id()
        and e.deleted_at is null
    )
    or public.has_permission('leave.read', org_id)
  )
);

drop policy if exists leave_requests_insert on public.leave_requests;
create policy leave_requests_insert on public.leave_requests
for insert
with check (
  org_id = public.current_org_id()
  and employee_id = public.current_employee_id()
);

drop policy if exists leave_requests_update on public.leave_requests;
create policy leave_requests_update on public.leave_requests
for update
using (
  deleted_at is null
  and org_id = public.current_org_id()
  and (
    employee_id = public.current_employee_id()
    or public.has_permission('leave.approve', org_id)
  )
)
with check (org_id = public.current_org_id());

drop policy if exists leave_requests_delete on public.leave_requests;
create policy leave_requests_delete on public.leave_requests
for delete using (false);

-- Holidays
drop policy if exists holidays_select on public.holidays;
create policy holidays_select on public.holidays
for select using (deleted_at is null and public.is_org_member(org_id));

drop policy if exists holidays_mutate on public.holidays;
create policy holidays_mutate on public.holidays
for all
using (deleted_at is null and public.has_permission('leave.write', org_id))
with check (public.has_permission('leave.write', org_id));

-- Onboarding/offboarding
drop policy if exists onboarding_templates_select on public.onboarding_templates;
create policy onboarding_templates_select on public.onboarding_templates
for select using (deleted_at is null and public.is_org_member(org_id));

drop policy if exists onboarding_templates_mutate on public.onboarding_templates;
create policy onboarding_templates_mutate on public.onboarding_templates
for all
using (deleted_at is null and public.has_permission('employees.write', org_id))
with check (public.has_permission('employees.write', org_id));

drop policy if exists onboarding_tasks_select on public.onboarding_tasks;
create policy onboarding_tasks_select on public.onboarding_tasks
for select
using (
  deleted_at is null
  and org_id = public.current_org_id()
  and (
    assigned_to = auth.uid()
    or employee_id = public.current_employee_id()
    or public.has_permission('employees.read', org_id)
  )
);

drop policy if exists onboarding_tasks_mutate on public.onboarding_tasks;
create policy onboarding_tasks_mutate on public.onboarding_tasks
for all
using (deleted_at is null and public.has_permission('employees.write', org_id))
with check (public.has_permission('employees.write', org_id));

drop policy if exists offboarding_tasks_select on public.offboarding_tasks;
create policy offboarding_tasks_select on public.offboarding_tasks
for select
using (
  deleted_at is null
  and org_id = public.current_org_id()
  and (
    assigned_to = auth.uid()
    or employee_id = public.current_employee_id()
    or public.has_permission('employees.read', org_id)
  )
);

drop policy if exists offboarding_tasks_mutate on public.offboarding_tasks;
create policy offboarding_tasks_mutate on public.offboarding_tasks
for all
using (deleted_at is null and public.has_permission('employees.write', org_id))
with check (public.has_permission('employees.write', org_id));

-- Audit logs: HR/admin only
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
for select using (public.has_permission('employees.read', org_id));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs
for insert with check (public.has_permission('employees.read', org_id));

drop policy if exists audit_logs_update on public.audit_logs;
create policy audit_logs_update on public.audit_logs
for update using (false) with check (false);

drop policy if exists audit_logs_delete on public.audit_logs;
create policy audit_logs_delete on public.audit_logs
for delete using (false);

commit;

