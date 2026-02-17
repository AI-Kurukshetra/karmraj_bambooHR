-- Onboarding 2-step process support:
-- - onboarding_template_items table (checklist items)
-- - RPC to create onboarding tasks from a template (idempotent-ish)
-- - RLS policies + indexes

begin;

create table if not exists public.onboarding_template_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  template_id uuid not null references public.onboarding_templates(id),
  task_title text not null,
  default_due_days integer not null default 7,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists onboarding_template_items_template_id_idx
  on public.onboarding_template_items(template_id)
  where deleted_at is null;

create index if not exists onboarding_template_items_org_id_idx
  on public.onboarding_template_items(org_id)
  where deleted_at is null;

create trigger trg_onboarding_template_items_updated_at
before update on public.onboarding_template_items
for each row execute function public.set_updated_at();

alter table public.onboarding_template_items enable row level security;

drop policy if exists onboarding_template_items_select on public.onboarding_template_items;
create policy onboarding_template_items_select on public.onboarding_template_items
for select
using (deleted_at is null and public.is_org_member(org_id));

drop policy if exists onboarding_template_items_mutate on public.onboarding_template_items;
create policy onboarding_template_items_mutate on public.onboarding_template_items
for all
using (deleted_at is null and public.has_permission('employees.write', org_id))
with check (public.has_permission('employees.write', org_id));

-- Create onboarding tasks from a template
create or replace function public.create_onboarding_tasks_from_template(
  p_employee_id uuid,
  p_template_id uuid,
  p_assigned_to uuid
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
set row_security = off
as $$
declare
  v_org_id uuid;
  v_base_date date;
  v_inserted integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select e.org_id, coalesce(e.joining_date, current_date)
    into v_org_id, v_base_date
  from public.employees e
  where e.id = p_employee_id
    and e.deleted_at is null
  limit 1;

  if v_org_id is null then
    raise exception 'Employee not found';
  end if;

  if not public.has_permission('employees.write', v_org_id) then
    raise exception 'Forbidden';
  end if;

  -- Ensure template belongs to same org
  if not exists (
    select 1 from public.onboarding_templates t
    where t.id = p_template_id
      and t.org_id = v_org_id
      and t.deleted_at is null
  ) then
    raise exception 'Invalid template';
  end if;

  insert into public.onboarding_tasks(org_id, employee_id, assigned_to, task_title, status, due_date)
  select
    v_org_id,
    p_employee_id,
    p_assigned_to,
    i.task_title,
    'pending',
    (v_base_date + make_interval(days => greatest(0, i.default_due_days)))::date
  from public.onboarding_template_items i
  where i.template_id = p_template_id
    and i.org_id = v_org_id
    and i.deleted_at is null
    and not exists (
      select 1
      from public.onboarding_tasks ot
      where ot.employee_id = p_employee_id
        and ot.org_id = v_org_id
        and ot.deleted_at is null
        and ot.task_title = i.task_title
    );

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

revoke all on function public.create_onboarding_tasks_from_template(uuid, uuid, uuid) from public;
grant execute on function public.create_onboarding_tasks_from_template(uuid, uuid, uuid) to authenticated;

commit;

