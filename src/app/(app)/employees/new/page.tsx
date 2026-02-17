import { createEmployee } from "@/app/(app)/employees/actions";
import { EmployeeForm } from "@/app/(app)/employees/_components/EmployeeForm";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("employees.write");

  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  const supabase = createSupabaseServerClient();

  const [{ data: departments }, { data: designations }, { data: managers }] =
    await Promise.all([
      supabase
        .from("departments")
        .select("*")
        .is("deleted_at", null)
        .order("name", { ascending: true })
        .limit(200),
      supabase
        .from("designations")
        .select("*")
        .is("deleted_at", null)
        .order("title", { ascending: true })
        .limit(200),
      supabase
        .from("employees")
        .select("id, first_name, last_name, employee_code")
        .is("deleted_at", null)
        .order("last_name", { ascending: true })
        .limit(200),
    ]);

  return (
    <EmployeeForm
      title="New employee"
      submitLabel="Create employee"
      error={error}
      departments={departments ?? []}
      designations={designations ?? []}
      managers={managers ?? []}
      action={createEmployee}
      cancelHref="/employees"
    />
  );
}

