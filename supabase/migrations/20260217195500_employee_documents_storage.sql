-- Supabase Storage: employee documents bucket + RLS policies

begin;

-- Create bucket (private)
insert into storage.buckets (id, name, public)
values ('employee-documents', 'employee-documents', false)
on conflict (id) do update set public = excluded.public;

-- Storage RLS policies
drop policy if exists "employee_documents_read" on storage.objects;
create policy "employee_documents_read" on storage.objects
for select
to authenticated
using (
  bucket_id = 'employee-documents'
  and exists (
    select 1
    from public.employee_documents d
    join public.employees e on e.id = d.employee_id
    where d.file_path = name
      and d.deleted_at is null
      and d.org_id = public.current_org_id()
      and (
        d.employee_id = public.current_employee_id()
        or e.manager_id = public.current_employee_id()
        or public.has_permission('employees.read', d.org_id)
      )
  )
);

drop policy if exists "employee_documents_insert" on storage.objects;
create policy "employee_documents_insert" on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'employee-documents'
  and name like (public.current_org_id()::text || '/%')
  and (
    public.has_permission('employees.write', public.current_org_id())
    or name like (
      public.current_org_id()::text
      || '/'
      || public.current_employee_id()::text
      || '/%'
    )
  )
);

-- Prevent hard deletes/updates in storage from the app role
drop policy if exists "employee_documents_update" on storage.objects;
create policy "employee_documents_update" on storage.objects
for update
to authenticated
using (false)
with check (false);

drop policy if exists "employee_documents_delete" on storage.objects;
create policy "employee_documents_delete" on storage.objects
for delete
to authenticated
using (false);

-- Allow employees to insert their own document metadata (self-service)
drop policy if exists employee_docs_write on public.employee_documents;
create policy employee_docs_insert on public.employee_documents
for insert
with check (
  org_id = public.current_org_id()
  and (
    public.has_permission('employees.write', org_id)
    or employee_id = public.current_employee_id()
  )
);

commit;

