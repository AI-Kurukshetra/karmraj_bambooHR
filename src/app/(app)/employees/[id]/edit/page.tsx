import { updateEmployee } from "@/app/(app)/employees/actions";
import { EmployeeForm } from "@/app/(app)/employees/_components/EmployeeForm";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("employees.write");

  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  const supabase = createSupabaseServerClient();

  const [{ data: employee, error: employeeError }, { data: departments }, { data: designations }, { data: managers }] =
    await Promise.all([
      supabase
        .from("employees")
        .select("*")
        .eq("id", params.id)
        .maybeSingle(),
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

  if (employeeError || !employee) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load employee: {employeeError?.message ?? "Not found"}
      </div>
    );
  }

  const action = updateEmployee.bind(null, params.id);

  return (
    <EmployeeForm
      title="Edit employee"
      submitLabel="Save changes"
      error={error}
      departments={departments ?? []}
      designations={designations ?? []}
      managers={managers ?? []}
      defaultValues={employee}
      action={action}
      cancelHref={`/employees/${params.id}`}
    />
  );
}

