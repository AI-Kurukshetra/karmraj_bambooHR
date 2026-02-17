-- Seed: Departments, Designations, and Employees (Indian names)
-- Run in Supabase Dashboard → SQL Editor after migrations are applied.
--
-- This script:
-- - finds your auth user by email
-- - ensures an organization + membership exists
-- - seeds departments/designations
-- - upserts ~25 employees with Indian names, mapped to departments/designations, plus manager relationships
--
-- NOTE: This does NOT create an Auth user or set passwords (do that in Supabase Auth UI).

do $$
declare
  v_admin_email text := 'karmrajsinh.vaghela@bacancy.com';
  v_org_name text := 'Bacancy';

  v_user_id uuid;
  v_org_id uuid;

  v_dept_eng uuid;
  v_dept_hr uuid;
  v_dept_fin uuid;
  v_dept_sales uuid;
  v_dept_ops uuid;

  v_desig_se uuid;
  v_desig_sse uuid;
  v_desig_em uuid;
  v_desig_hr_exec uuid;
  v_desig_hr_mgr uuid;
  v_desig_fin_analyst uuid;
  v_desig_payroll uuid;
  v_desig_sales_exec uuid;
  v_desig_sales_mgr uuid;
  v_desig_ops_exec uuid;
begin
  -- Find admin auth user
  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = lower(v_admin_email)
  limit 1;

  if v_user_id is null then
    raise exception 'Auth user not found for email %. Create it in Supabase Auth first.', v_admin_email;
  end if;

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

  -- Ensure membership exists and is primary (soft-delete safe)
  update public.organization_members
  set deleted_at = null,
      is_primary = true
  where org_id = v_org_id
    and user_id = v_user_id;

  if not found then
    insert into public.organization_members(org_id, user_id, is_primary)
    values (v_org_id, v_user_id, true);
  end if;

  -- Ensure departments exist (insert only if missing)
  insert into public.departments(org_id, name)
  select v_org_id, x.name
  from (values
    ('Engineering'),
    ('HR'),
    ('Finance'),
    ('Sales'),
    ('Operations')
  ) as x(name)
  where not exists (
    select 1
    from public.departments d
    where d.org_id = v_org_id
      and d.deleted_at is null
      and lower(d.name) = lower(x.name)
  );

  select id into v_dept_eng from public.departments where org_id = v_org_id and deleted_at is null and name = 'Engineering' limit 1;
  select id into v_dept_hr  from public.departments where org_id = v_org_id and deleted_at is null and name = 'HR' limit 1;
  select id into v_dept_fin from public.departments where org_id = v_org_id and deleted_at is null and name = 'Finance' limit 1;
  select id into v_dept_sales from public.departments where org_id = v_org_id and deleted_at is null and name = 'Sales' limit 1;
  select id into v_dept_ops from public.departments where org_id = v_org_id and deleted_at is null and name = 'Operations' limit 1;

  -- Ensure designations exist (insert only if missing)
  insert into public.designations(org_id, department_id, title)
  select v_org_id, x.department_id, x.title
  from (values
    (v_dept_eng, 'Software Engineer'),
    (v_dept_eng, 'Senior Software Engineer'),
    (v_dept_eng, 'Engineering Manager'),
    (v_dept_hr,  'HR Executive'),
    (v_dept_hr,  'HR Manager'),
    (v_dept_fin, 'Finance Analyst'),
    (v_dept_fin, 'Payroll Specialist'),
    (v_dept_sales,'Sales Executive'),
    (v_dept_sales,'Sales Manager'),
    (v_dept_ops, 'Operations Executive')
  ) as x(department_id, title)
  where not exists (
    select 1
    from public.designations d
    where d.org_id = v_org_id
      and d.deleted_at is null
      and lower(d.title) = lower(x.title)
  );

  select id into v_desig_se from public.designations where org_id = v_org_id and deleted_at is null and title = 'Software Engineer' limit 1;
  select id into v_desig_sse from public.designations where org_id = v_org_id and deleted_at is null and title = 'Senior Software Engineer' limit 1;
  select id into v_desig_em from public.designations where org_id = v_org_id and deleted_at is null and title = 'Engineering Manager' limit 1;
  select id into v_desig_hr_exec from public.designations where org_id = v_org_id and deleted_at is null and title = 'HR Executive' limit 1;
  select id into v_desig_hr_mgr from public.designations where org_id = v_org_id and deleted_at is null and title = 'HR Manager' limit 1;
  select id into v_desig_fin_analyst from public.designations where org_id = v_org_id and deleted_at is null and title = 'Finance Analyst' limit 1;
  select id into v_desig_payroll from public.designations where org_id = v_org_id and deleted_at is null and title = 'Payroll Specialist' limit 1;
  select id into v_desig_sales_exec from public.designations where org_id = v_org_id and deleted_at is null and title = 'Sales Executive' limit 1;
  select id into v_desig_sales_mgr from public.designations where org_id = v_org_id and deleted_at is null and title = 'Sales Manager' limit 1;
  select id into v_desig_ops_exec from public.designations where org_id = v_org_id and deleted_at is null and title = 'Operations Executive' limit 1;

  -- Upsert employees (unique constraint on (org_id, employee_code) exists)
  -- Emails use a non-deliverable seed domain to avoid unintended emails.
  create temporary table if not exists tmp_seed_employees(
    employee_code text primary key,
    manager_code text null
  ) on commit drop;

  truncate table tmp_seed_employees;

  -- Managers first (manager_code null)
  insert into public.employees(
    org_id, employee_code, first_name, last_name, email, phone,
    department_id, designation_id, employment_type, joining_date, employment_status, work_location
  )
  values
    (v_org_id,'E0001','Amit','Sharma','e0001@bacancy-seed.local','+91-99999-00001',v_dept_eng,v_desig_em,'Full-time','2021-04-12','active','Ahmedabad'),
    (v_org_id,'E0002','Priya','Nair','e0002@bacancy-seed.local','+91-99999-00002',v_dept_hr,v_desig_hr_mgr,'Full-time','2022-01-10','active','Mumbai'),
    (v_org_id,'E0003','Rohit','Verma','e0003@bacancy-seed.local','+91-99999-00003',v_dept_fin,v_desig_payroll,'Full-time','2020-09-01','active','Pune'),
    (v_org_id,'E0004','Neha','Patel','e0004@bacancy-seed.local','+91-99999-00004',v_dept_sales,v_desig_sales_mgr,'Full-time','2021-08-16','active','Delhi'),
    (v_org_id,'E0005','Sanjay','Gupta','e0005@bacancy-seed.local','+91-99999-00005',v_dept_ops,v_desig_ops_exec,'Full-time','2019-03-05','active','Bengaluru')
  on conflict (org_id, employee_code) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        department_id = excluded.department_id,
        designation_id = excluded.designation_id,
        employment_type = excluded.employment_type,
        joining_date = excluded.joining_date,
        employment_status = excluded.employment_status,
        work_location = excluded.work_location,
        deleted_at = null;

  insert into tmp_seed_employees(employee_code, manager_code) values
    ('E0001', null),
    ('E0002', null),
    ('E0003', null),
    ('E0004', null),
    ('E0005', null)
  on conflict (employee_code) do update set manager_code = excluded.manager_code;

  -- Engineering team (manager: E0001)
  insert into public.employees(org_id, employee_code, first_name, last_name, email, phone, department_id, designation_id, employment_type, joining_date, employment_status, work_location)
  values
    (v_org_id,'E0101','Aarav','Shah','e0101@bacancy-seed.local','+91-99999-0101',v_dept_eng,v_desig_se,'Full-time','2023-02-06','active','Ahmedabad'),
    (v_org_id,'E0102','Vivaan','Patel','e0102@bacancy-seed.local','+91-99999-0102',v_dept_eng,v_desig_sse,'Full-time','2022-07-18','active','Ahmedabad'),
    (v_org_id,'E0103','Aditya','Singh','e0103@bacancy-seed.local','+91-99999-0103',v_dept_eng,v_desig_se,'Full-time','2023-11-13','active','Ahmedabad'),
    (v_org_id,'E0104','Ananya','Iyer','e0104@bacancy-seed.local','+91-99999-0104',v_dept_eng,v_desig_se,'Contract','2024-05-20','active','Remote'),
    (v_org_id,'E0105','Ishaan','Kumar','e0105@bacancy-seed.local','+91-99999-0105',v_dept_eng,v_desig_sse,'Full-time','2021-12-01','active','Ahmedabad')
  on conflict (org_id, employee_code) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        department_id = excluded.department_id,
        designation_id = excluded.designation_id,
        employment_type = excluded.employment_type,
        joining_date = excluded.joining_date,
        employment_status = excluded.employment_status,
        work_location = excluded.work_location,
        deleted_at = null;

  insert into tmp_seed_employees(employee_code, manager_code) values
    ('E0101','E0001'),
    ('E0102','E0001'),
    ('E0103','E0001'),
    ('E0104','E0001'),
    ('E0105','E0001')
  on conflict (employee_code) do update set manager_code = excluded.manager_code;

  -- HR team (manager: E0002)
  insert into public.employees(org_id, employee_code, first_name, last_name, email, phone, department_id, designation_id, employment_type, joining_date, employment_status, work_location)
  values
    (v_org_id,'E0201','Sneha','Kulkarni','e0201@bacancy-seed.local','+91-99999-0201',v_dept_hr,v_desig_hr_exec,'Full-time','2023-06-01','active','Mumbai'),
    (v_org_id,'E0202','Riya','Mehta','e0202@bacancy-seed.local','+91-99999-0202',v_dept_hr,v_desig_hr_exec,'Full-time','2022-10-10','active','Mumbai'),
    (v_org_id,'E0203','Kunal','Joshi','e0203@bacancy-seed.local','+91-99999-0203',v_dept_hr,v_desig_hr_exec,'Full-time','2024-01-08','active','Remote')
  on conflict (org_id, employee_code) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        department_id = excluded.department_id,
        designation_id = excluded.designation_id,
        employment_type = excluded.employment_type,
        joining_date = excluded.joining_date,
        employment_status = excluded.employment_status,
        work_location = excluded.work_location,
        deleted_at = null;

  insert into tmp_seed_employees(employee_code, manager_code) values
    ('E0201','E0002'),
    ('E0202','E0002'),
    ('E0203','E0002')
  on conflict (employee_code) do update set manager_code = excluded.manager_code;

  -- Finance team (manager: E0003)
  insert into public.employees(org_id, employee_code, first_name, last_name, email, phone, department_id, designation_id, employment_type, joining_date, employment_status, work_location)
  values
    (v_org_id,'E0301','Arjun','Bose','e0301@bacancy-seed.local','+91-99999-0301',v_dept_fin,v_desig_fin_analyst,'Full-time','2022-04-04','active','Pune'),
    (v_org_id,'E0302','Meera','Rao','e0302@bacancy-seed.local','+91-99999-0302',v_dept_fin,v_desig_fin_analyst,'Full-time','2023-09-12','active','Pune'),
    (v_org_id,'E0303','Siddharth','Malhotra','e0303@bacancy-seed.local','+91-99999-0303',v_dept_fin,v_desig_fin_analyst,'Full-time','2021-07-26','active','Pune')
  on conflict (org_id, employee_code) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        department_id = excluded.department_id,
        designation_id = excluded.designation_id,
        employment_type = excluded.employment_type,
        joining_date = excluded.joining_date,
        employment_status = excluded.employment_status,
        work_location = excluded.work_location,
        deleted_at = null;

  insert into tmp_seed_employees(employee_code, manager_code) values
    ('E0301','E0003'),
    ('E0302','E0003'),
    ('E0303','E0003')
  on conflict (employee_code) do update set manager_code = excluded.manager_code;

  -- Sales team (manager: E0004)
  insert into public.employees(org_id, employee_code, first_name, last_name, email, phone, department_id, designation_id, employment_type, joining_date, employment_status, work_location)
  values
    (v_org_id,'E0401','Pooja','Chopra','e0401@bacancy-seed.local','+91-99999-0401',v_dept_sales,v_desig_sales_exec,'Full-time','2023-03-15','active','Delhi'),
    (v_org_id,'E0402','Rahul','Kapoor','e0402@bacancy-seed.local','+91-99999-0402',v_dept_sales,v_desig_sales_exec,'Full-time','2022-12-05','active','Delhi'),
    (v_org_id,'E0403','Tanvi','Saxena','e0403@bacancy-seed.local','+91-99999-0403',v_dept_sales,v_desig_sales_exec,'Full-time','2024-04-01','active','Remote'),
    (v_org_id,'E0404','Nikhil','Arora','e0404@bacancy-seed.local','+91-99999-0404',v_dept_sales,v_desig_sales_exec,'Contract','2024-08-19','active','Delhi')
  on conflict (org_id, employee_code) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        department_id = excluded.department_id,
        designation_id = excluded.designation_id,
        employment_type = excluded.employment_type,
        joining_date = excluded.joining_date,
        employment_status = excluded.employment_status,
        work_location = excluded.work_location,
        deleted_at = null;

  insert into tmp_seed_employees(employee_code, manager_code) values
    ('E0401','E0004'),
    ('E0402','E0004'),
    ('E0403','E0004'),
    ('E0404','E0004')
  on conflict (employee_code) do update set manager_code = excluded.manager_code;

  -- Operations helpers (manager: E0005)
  insert into public.employees(org_id, employee_code, first_name, last_name, email, phone, department_id, designation_id, employment_type, joining_date, employment_status, work_location)
  values
    (v_org_id,'E0501','Deepak','Yadav','e0501@bacancy-seed.local','+91-99999-0501',v_dept_ops,v_desig_ops_exec,'Full-time','2022-02-14','active','Bengaluru'),
    (v_org_id,'E0502','Ayesha','Khan','e0502@bacancy-seed.local','+91-99999-0502',v_dept_ops,v_desig_ops_exec,'Full-time','2023-10-30','active','Bengaluru'),
    (v_org_id,'E0503','Harsh','Desai','e0503@bacancy-seed.local','+91-99999-0503',v_dept_ops,v_desig_ops_exec,'Full-time','2021-05-24','active','Remote')
  on conflict (org_id, employee_code) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        department_id = excluded.department_id,
        designation_id = excluded.designation_id,
        employment_type = excluded.employment_type,
        joining_date = excluded.joining_date,
        employment_status = excluded.employment_status,
        work_location = excluded.work_location,
        deleted_at = null;

  insert into tmp_seed_employees(employee_code, manager_code) values
    ('E0501','E0005'),
    ('E0502','E0005'),
    ('E0503','E0005')
  on conflict (employee_code) do update set manager_code = excluded.manager_code;

  -- Wire manager_id by employee_code mapping (single pass)
  update public.employees e
  set manager_id = m.id
  from public.employees m
  join tmp_seed_employees t on t.manager_code = m.employee_code
  where e.org_id = v_org_id
    and m.org_id = v_org_id
    and e.employee_code = t.employee_code
    and t.manager_code is not null
    and e.deleted_at is null
    and m.deleted_at is null;

  raise notice 'Seed complete: org=% (%), admin=%', v_org_id, v_org_name, v_admin_email;
end $$;

