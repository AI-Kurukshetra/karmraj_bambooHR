"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { getCurrentOrgIdOrThrow } from "@/lib/org";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const departmentCreateSchema = z.object({
  name: z.string().min(1).max(100),
});

const designationCreateSchema = z.object({
  title: z.string().min(1).max(100),
  department_id: z.string().uuid().optional().nullable(),
});

function normalizeNullable(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createDepartment(formData: FormData) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const parsed = departmentCreateSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
  });
  if (!parsed.success) redirect(`/employees/reference-data/departments?error=${encodeURIComponent("Invalid name")}`);

  const { error } = await supabase.from("departments").insert({
    org_id: orgId,
    name: parsed.data.name,
  });
  if (error) redirect(`/employees/reference-data/departments?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/employees/reference-data/departments");
  redirect("/employees/reference-data/departments");
}

export async function renameDepartment(departmentId: string, formData: FormData) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect(`/employees/reference-data/departments?error=${encodeURIComponent("Name is required")}`);

  const { error } = await supabase
    .from("departments")
    .update({ name })
    .eq("id", departmentId)
    .eq("org_id", orgId)
    .is("deleted_at", null);
  if (error) redirect(`/employees/reference-data/departments?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/employees/reference-data/departments");
  redirect("/employees/reference-data/departments");
}

export async function softDeleteDepartment(departmentId: string) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const { error } = await supabase
    .from("departments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", departmentId)
    .eq("org_id", orgId)
    .is("deleted_at", null);
  if (error) redirect(`/employees/reference-data/departments?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/employees/reference-data/departments");
  redirect("/employees/reference-data/departments");
}

export async function createDesignation(formData: FormData) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const parsed = designationCreateSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    department_id: normalizeNullable(formData.get("department_id")),
  });
  if (!parsed.success) redirect(`/employees/reference-data/designations?error=${encodeURIComponent("Invalid input")}`);

  const { error } = await supabase.from("designations").insert({
    org_id: orgId,
    title: parsed.data.title,
    department_id: parsed.data.department_id,
  });
  if (error) redirect(`/employees/reference-data/designations?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/employees/reference-data/designations");
  redirect("/employees/reference-data/designations");
}

export async function updateDesignation(designationId: string, formData: FormData) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const title = String(formData.get("title") ?? "").trim();
  const departmentId = normalizeNullable(formData.get("department_id"));
  if (!title) redirect(`/employees/reference-data/designations?error=${encodeURIComponent("Title is required")}`);

  const { error } = await supabase
    .from("designations")
    .update({ title, department_id: departmentId })
    .eq("id", designationId)
    .eq("org_id", orgId)
    .is("deleted_at", null);
  if (error) redirect(`/employees/reference-data/designations?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/employees/reference-data/designations");
  redirect("/employees/reference-data/designations");
}

export async function softDeleteDesignation(designationId: string) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const { error } = await supabase
    .from("designations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", designationId)
    .eq("org_id", orgId)
    .is("deleted_at", null);
  if (error) redirect(`/employees/reference-data/designations?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/employees/reference-data/designations");
  redirect("/employees/reference-data/designations");
}

