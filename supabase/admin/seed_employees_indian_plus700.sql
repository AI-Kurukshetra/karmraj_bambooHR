-- Seed: +700 Employees (Indian names) - generated
-- Run in Supabase Dashboard → SQL Editor after migrations are applied and after:
-- - `supabase/admin/seed_employees_indian.sql` (optional but recommended)
--
-- This script inserts 700 additional employees with:
-- - unique employee_code: E10001..E10700
-- - unique email per org: e10001@bacancy-seed.local .. e10700@bacancy-seed.local
-- - randomized dept/designation, joining date, etc.
-- - manager_id assigned from existing managers (E0001..E0005) when present
--
-- NOTE: This does NOT create Auth users.

do $$
declare
  v_admin_email text := 'karmrajsinh.vaghela@bacancy.com';
  v_org_name text := 'Bacancy';

  v_user_id uuid;
  v_org_id uuid;

  v_count int := 700;
  v_start int := 10000; -- yields E10001..E10700

  v_inserted int := 0;
begin
  -- Find admin auth user (used only to locate/create org membership)
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

  -- Stable-ish randomness per run
  perform setseed(0.4242);

  with
    names as (
      select
        array[
          'Aarav','Vivaan','Aditya','Arjun','Dhruv','Ishaan','Kabir','Kunal','Manav','Mohit',
          'Nikhil','Pranav','Rahul','Rohan','Rohit','Siddharth','Varun','Yash','Ankit','Deepak',
          'Ayesha','Ananya','Diya','Isha','Kavya','Meera','Neha','Pooja','Priya','Riya',
          'Sara','Shreya','Sneha','Tanvi','Vidhi','Nandini','Aditi','Khushi','Payal','Mansi'
        ]::text[] as first_names,
        array[
          'Sharma','Verma','Patel','Shah','Gupta','Singh','Kumar','Mehta','Joshi','Nair',
          'Iyer','Rao','Desai','Yadav','Bose','Kapoor','Chopra','Arora','Malhotra','Saxena',
          'Kulkarni','Jain','Bhat','Chatterjee','Ghosh','Shetty','Reddy','Naidu','Banerjee','Mishra'
        ]::text[] as last_names,
        array['Ahmedabad','Mumbai','Pune','Delhi','Bengaluru','Hyderabad','Chennai','Kolkata','Remote']::text[] as locations,
        array['Full-time','Contract','Intern']::text[] as emp_types
    ),
    depts as (
      select id
      from public.departments
      where org_id = v_org_id and deleted_at is null
    ),
    mgrs as (
      -- Prefer seeded managers; fall back to any existing employee if missing
      select id
      from public.employees
      where org_id = v_org_id
        and deleted_at is null
        and employee_code in ('E0001','E0002','E0003','E0004','E0005')
      union all
      select id
      from public.employees
      where org_id = v_org_id
        and deleted_at is null
      limit 50
    )
  insert into public.employees(
    org_id,
    employee_code,
    first_name,
    last_name,
    email,
    phone,
    dob,
    gender,
    marital_status,
    department_id,
    designation_id,
    manager_id,
    employment_type,
    joining_date,
    employment_status,
    work_location
  )
  select
    v_org_id,
    ('E' || lpad((v_start + gs)::text, 5, '0')) as employee_code,
    n.first_names[(floor(random() * array_length(n.first_names, 1))::int) + 1] as first_name,
    n.last_names[(floor(random() * array_length(n.last_names, 1))::int) + 1] as last_name,
    lower(('e' || lpad((v_start + gs)::text, 5, '0') || '@bacancy-seed.local')) as email,
    ('+91-' || (9000000000 + floor(random() * 999999999)::bigint)::text) as phone,
    (date '1986-01-01' + (floor(random() * 7000)::int)) as dob,
    (case when random() < 0.5 then 'male' else 'female' end) as gender,
    (case
      when random() < 0.55 then 'single'
      when random() < 0.90 then 'married'
      else 'other'
    end) as marital_status,
    dept.department_id,
    desig.designation_id,
    mgr.manager_id,
    n.emp_types[(floor(random() * array_length(n.emp_types, 1))::int) + 1] as employment_type,
    (current_date - (floor(random() * 1800)::int)) as joining_date,
    'active' as employment_status,
    n.locations[(floor(random() * array_length(n.locations, 1))::int) + 1] as work_location
  from generate_series(1, v_count) as gs
  cross join names n
  cross join lateral (
    select id as department_id
    from depts
    order by random()
    limit 1
  ) dept
  cross join lateral (
    select id as designation_id
    from public.designations d
    where d.org_id = v_org_id
      and d.deleted_at is null
      and (d.department_id = dept.department_id or d.department_id is null)
    order by random()
    limit 1
  ) desig
  cross join lateral (
    select id as manager_id
    from mgrs
    order by random()
    limit 1
  ) mgr
  on conflict (org_id, employee_code) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        dob = excluded.dob,
        gender = excluded.gender,
        marital_status = excluded.marital_status,
        department_id = excluded.department_id,
        designation_id = excluded.designation_id,
        manager_id = excluded.manager_id,
        employment_type = excluded.employment_type,
        joining_date = excluded.joining_date,
        employment_status = excluded.employment_status,
        work_location = excluded.work_location,
        deleted_at = null;

  get diagnostics v_inserted = row_count;
  raise notice 'Seeded/updated % employees into org % (%)', v_inserted, v_org_id, v_org_name;
end $$;

