-- Allow HR/Admin to view and restore soft-deleted employees.
-- Keep deleted rows hidden from self/manager views.

begin;

-- Replace employees select policy (drop + recreate)
drop policy if exists employees_select on public.employees;
create policy employees_select on public.employees
for select
using (
  org_id = public.current_org_id()
  and (
    -- Admin/HR can view all (including soft-deleted)
    public.has_permission('employees.read', org_id)
    -- Self / manager can only view active (not soft-deleted)
    or (
      deleted_at is null
      and (
        user_id = auth.uid()
        or manager_id = public.current_employee_id()
      )
    )
  )
);

-- Replace admin update policy to allow restore (do not require deleted_at is null)
drop policy if exists employees_update_admin on public.employees;
create policy employees_update_admin on public.employees
for update
using (public.has_permission('employees.write', org_id))
with check (public.has_permission('employees.write', org_id));

commit;

