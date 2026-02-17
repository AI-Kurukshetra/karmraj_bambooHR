import Link from "next/link";

import { EmployeeDocumentUploader } from "@/app/(app)/employees/[id]/documents/EmployeeDocumentUploader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmployeeDocumentsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, first_name, last_name, employee_code")
    .eq("id", params.id)
    .maybeSingle();

  if (employeeError || !employee) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load employee: {employeeError?.message ?? "Not found"}
      </div>
    );
  }

  const { data: docs, error } = await supabase
    .from("employee_documents")
    .select("id, document_type, file_path, created_at, uploaded_by")
    .eq("employee_id", params.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load documents: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {employee.first_name} {employee.last_name} ({employee.employee_code})
          </p>
        </div>
        <Link
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
          href={`/employees/${employee.id}`}
        >
          Back
        </Link>
      </div>

      <EmployeeDocumentUploader employeeId={employee.id} />

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(docs ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-600" colSpan={4}>
                  No documents uploaded yet.
                </td>
              </tr>
            ) : (
              (docs ?? []).map((d) => (
                <tr key={d.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{d.document_type}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{d.file_path}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="underline"
                      href={`/employees/${employee.id}/documents/${d.id}/download`}
                    >
                      Download
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

