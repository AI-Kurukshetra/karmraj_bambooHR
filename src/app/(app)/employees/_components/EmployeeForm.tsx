import Link from "next/link";

import type { Database } from "@/types/database";

type Department = Database["public"]["Tables"]["departments"]["Row"];
type Designation = Database["public"]["Tables"]["designations"]["Row"];
type Employee = Database["public"]["Tables"]["employees"]["Row"];

export function EmployeeForm({
  title,
  submitLabel,
  error,
  departments,
  designations,
  managers,
  defaultValues,
  action,
  cancelHref,
}: {
  title: string;
  submitLabel: string;
  error: string | null;
  departments: Department[];
  designations: Designation[];
  managers: Array<Pick<Employee, "id" | "first_name" | "last_name" | "employee_code">>;
  defaultValues?: Partial<Employee>;
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Employee master record (RLS-secured).
          </p>
        </div>
        <Link
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
          href={cancelHref}
        >
          Cancel
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={action}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Employee code">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="employee_code"
              defaultValue={defaultValues?.employee_code ?? ""}
              required
            />
          </Field>

          <Field label="Employment status">
            <select
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="employment_status"
              defaultValue={defaultValues?.employment_status ?? "active"}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>

          <Field label="First name">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="first_name"
              defaultValue={defaultValues?.first_name ?? ""}
              required
            />
          </Field>

          <Field label="Last name">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="last_name"
              defaultValue={defaultValues?.last_name ?? ""}
              required
            />
          </Field>

          <Field label="Email">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="email"
              type="email"
              defaultValue={defaultValues?.email ?? ""}
              required
            />
          </Field>

          <Field label="Phone">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="phone"
              defaultValue={defaultValues?.phone ?? ""}
            />
          </Field>

          <Field label="Department">
            <select
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="department_id"
              defaultValue={defaultValues?.department_id ?? ""}
            >
              <option value="">—</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Designation">
            <select
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="designation_id"
              defaultValue={defaultValues?.designation_id ?? ""}
            >
              <option value="">—</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Manager">
            <select
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="manager_id"
              defaultValue={defaultValues?.manager_id ?? ""}
            >
              <option value="">—</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name} ({m.employee_code})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Employment type">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="employment_type"
              defaultValue={defaultValues?.employment_type ?? ""}
              placeholder="Full-time, Contract, Intern..."
            />
          </Field>

          <Field label="Work location">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="work_location"
              defaultValue={defaultValues?.work_location ?? ""}
            />
          </Field>

          <Field label="Joining date">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="joining_date"
              type="date"
              defaultValue={defaultValues?.joining_date ?? ""}
            />
          </Field>

          <Field label="Confirmation date">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="confirmation_date"
              type="date"
              defaultValue={defaultValues?.confirmation_date ?? ""}
            />
          </Field>

          <Field label="DOB">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="dob"
              type="date"
              defaultValue={defaultValues?.dob ?? ""}
            />
          </Field>

          <Field label="Gender">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="gender"
              defaultValue={defaultValues?.gender ?? ""}
            />
          </Field>

          <Field label="Marital status">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              name="marital_status"
              defaultValue={defaultValues?.marital_status ?? ""}
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
            type="submit"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}

