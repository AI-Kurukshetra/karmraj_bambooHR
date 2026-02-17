## HRIS Phase 1 (Next.js + Supabase)
 

### Prereqs
- Node.js 20+ (you have Node 22)
- A Supabase project (Auth enabled: email/password)

### Setup
1. Copy env file:

```bash
cp .env.example .env.local
```

2. Fill in Supabase values from Project Settings → API.
3. Apply SQL migrations:
   - Copy the files in `supabase/migrations/` into your Supabase SQL Editor (or use Supabase CLI migrations if you prefer).
   - Run them in timestamp order (the second migration fixes RBAC recursion under RLS).
4. Create a user in Supabase Auth (email/password).
5. Run:

```bash
npm run dev
```

6. Sign in at `/login`, then visit `/setup` once to create your first organization and seed base roles/permissions.

### Automatic migrations (Supabase CLI)
This repo includes the Supabase CLI so you can apply all SQL migrations automatically.

1. Login:

```bash
npm run supabase:login
```

2. Link this folder to your Supabase project (you’ll need the project ref, e.g. `abcd1234`):

```bash
npm run supabase:link -- --project-ref YOUR_PROJECT_REF
```

3. Push migrations in `supabase/migrations/` to Supabase:

```bash
npm run supabase:push
```

### Notes
- All database access is expected to be protected by **RLS** (policies included in migrations).
- Reporting exports are **CSV only** and gated by the `reports.export` permission.

### Employee module extras
- To enable Employee soft-delete restore and Employee Documents (Storage bucket + policies), also run:
  - `supabase/migrations/20260217194000_employee_soft_delete_admin_restore.sql`
  - `supabase/migrations/20260217195500_employee_documents_storage.sql`

### Seed data (Indian names)
Run this once in Supabase SQL Editor to insert sample departments/designations/employees:
- `supabase/admin/seed_employees_indian.sql`

To add a larger dataset (+700 generated employees):
- `supabase/admin/seed_employees_indian_plus700.sql`
