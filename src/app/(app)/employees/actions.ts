"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { getCurrentOrgIdOrThrow } from "@/lib/org";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const employeeUpsertSchema = z.object({
  employee_code: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  designation_id: z.string().uuid().optional().nullable(),
  manager_id: z.string().uuid().optional().nullable(),
  employment_type: z.string().max(50).optional().nullable(),
  joining_date: z.string().optional().nullable(),
  confirmation_date: z.string().optional().nullable(),
  employment_status: z.string().min(1).max(50),
  work_location: z.string().max(100).optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().max(50).optional().nullable(),
  marital_status: z.string().max(50).optional().nullable(),
});

const compensationUpsertSchema = z.object({
  base_salary: z.coerce.number().min(0).max(1_000_000_000),
  bonus: z.coerce.number().min(0).max(1_000_000_000),
  bank_account: z.string().max(100).optional().nullable(),
  ifsc_code: z.string().max(50).optional().nullable(),
});

function normalizeNullable(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function parseDateNullable(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createEmployee(formData: FormData) {
  await requirePermission("employees.write");

  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const parsed = employeeUpsertSchema.safeParse({
    employee_code: String(formData.get("employee_code") ?? "").trim(),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: normalizeNullable(formData.get("phone")),
    department_id: normalizeNullable(formData.get("department_id")),
    designation_id: normalizeNullable(formData.get("designation_id")),
    manager_id: normalizeNullable(formData.get("manager_id")),
    employment_type: normalizeNullable(formData.get("employment_type")),
    joining_date: parseDateNullable(formData.get("joining_date")),
    confirmation_date: parseDateNullable(formData.get("confirmation_date")),
    employment_status: String(formData.get("employment_status") ?? "active").trim(),
    work_location: normalizeNullable(formData.get("work_location")),
    dob: parseDateNullable(formData.get("dob")),
    gender: normalizeNullable(formData.get("gender")),
    marital_status: normalizeNullable(formData.get("marital_status")),
  });

  if (!parsed.success) {
    redirect(
      `/employees/new?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid input",
      )}`,
    );
  }

  const { data, error } = await supabase
    .from("employees")
    .insert({
      org_id: orgId,
      employee_code: parsed.data.employee_code,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      dob: parsed.data.dob,
      gender: parsed.data.gender,
      marital_status: parsed.data.marital_status,
      department_id: parsed.data.department_id,
      designation_id: parsed.data.designation_id,
      manager_id: parsed.data.manager_id,
      employment_type: parsed.data.employment_type,
      joining_date: parsed.data.joining_date,
      confirmation_date: parsed.data.confirmation_date,
      employment_status: parsed.data.employment_status,
      work_location: parsed.data.work_location,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/employees/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/employees");
  redirect(`/employees/${data.id}`);
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  await requirePermission("employees.write");

  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const parsed = employeeUpsertSchema.safeParse({
    employee_code: String(formData.get("employee_code") ?? "").trim(),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: normalizeNullable(formData.get("phone")),
    department_id: normalizeNullable(formData.get("department_id")),
    designation_id: normalizeNullable(formData.get("designation_id")),
    manager_id: normalizeNullable(formData.get("manager_id")),
    employment_type: normalizeNullable(formData.get("employment_type")),
    joining_date: parseDateNullable(formData.get("joining_date")),
    confirmation_date: parseDateNullable(formData.get("confirmation_date")),
    employment_status: String(formData.get("employment_status") ?? "active").trim(),
    work_location: normalizeNullable(formData.get("work_location")),
    dob: parseDateNullable(formData.get("dob")),
    gender: normalizeNullable(formData.get("gender")),
    marital_status: normalizeNullable(formData.get("marital_status")),
  });

  if (!parsed.success) {
    redirect(
      `/employees/${employeeId}/edit?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid input",
      )}`,
    );
  }

  const { error } = await supabase
    .from("employees")
    .update({
      employee_code: parsed.data.employee_code,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      dob: parsed.data.dob,
      gender: parsed.data.gender,
      marital_status: parsed.data.marital_status,
      department_id: parsed.data.department_id,
      designation_id: parsed.data.designation_id,
      manager_id: parsed.data.manager_id,
      employment_type: parsed.data.employment_type,
      joining_date: parsed.data.joining_date,
      confirmation_date: parsed.data.confirmation_date,
      employment_status: parsed.data.employment_status,
      work_location: parsed.data.work_location,
    })
    .eq("id", employeeId)
    .eq("org_id", orgId)
    .is("deleted_at", null);

  if (error) {
    redirect(`/employees/${employeeId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  redirect(`/employees/${employeeId}`);
}

export async function softDeleteEmployee(employeeId: string) {
  await requirePermission("employees.write");

  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const { error } = await supabase
    .from("employees")
    .update({ deleted_at: new Date().toISOString(), employment_status: "inactive" })
    .eq("id", employeeId)
    .eq("org_id", orgId)
    .is("deleted_at", null);

  if (error) {
    redirect(`/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/employees");
  redirect("/employees");
}

export async function restoreEmployee(employeeId: string) {
  await requirePermission("employees.write");

  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const { error } = await supabase
    .from("employees")
    .update({ deleted_at: null })
    .eq("id", employeeId)
    .eq("org_id", orgId);

  if (error) {
    redirect(`/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/employees");
  redirect(`/employees/${employeeId}`);
}

export async function upsertCompensation(employeeId: string, formData: FormData) {
  await requirePermission("compensation.write");

  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const parsed = compensationUpsertSchema.safeParse({
    base_salary: formData.get("base_salary"),
    bonus: formData.get("bonus"),
    bank_account: normalizeNullable(formData.get("bank_account")),
    ifsc_code: normalizeNullable(formData.get("ifsc_code")),
  });

  if (!parsed.success) {
    redirect(
      `/employees/${employeeId}/compensation?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Invalid input",
      )}`,
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("compensation")
    .select("id")
    .eq("employee_id", employeeId)
    .is("deleted_at", null)
    .maybeSingle();
  if (existingError) {
    redirect(
      `/employees/${employeeId}/compensation?error=${encodeURIComponent(
        existingError.message,
      )}`,
    );
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("compensation")
      .update({
        base_salary: parsed.data.base_salary,
        bonus: parsed.data.bonus,
        bank_account: parsed.data.bank_account,
        ifsc_code: parsed.data.ifsc_code,
      })
      .eq("id", existing.id)
      .eq("org_id", orgId)
      .is("deleted_at", null);
    if (error) {
      redirect(
        `/employees/${employeeId}/compensation?error=${encodeURIComponent(
          error.message,
        )}`,
      );
    }
  } else {
    const { error } = await supabase.from("compensation").insert({
      org_id: orgId,
      employee_id: employeeId,
      base_salary: parsed.data.base_salary,
      bonus: parsed.data.bonus,
      bank_account: parsed.data.bank_account,
      ifsc_code: parsed.data.ifsc_code,
    });
    if (error) {
      redirect(
        `/employees/${employeeId}/compensation?error=${encodeURIComponent(
          error.message,
        )}`,
      );
    }
  }

  revalidatePath(`/employees/${employeeId}`);
  revalidatePath(`/employees/${employeeId}/compensation`);
  redirect(`/employees/${employeeId}/compensation`);
}

