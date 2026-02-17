"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { getCurrentOrgIdOrThrow } from "@/lib/org";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function startOnboarding(formData: FormData) {
  await requirePermission("employees.write");

  const employeeId = String(formData.get("employee_id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");

  if (!employeeId || !templateId) {
    redirect("/onboarding/start?error=Select%20employee%20and%20template");
  }

  redirect(
    `/onboarding/confirm?employeeId=${encodeURIComponent(
      employeeId,
    )}&templateId=${encodeURIComponent(templateId)}`,
  );
}

const createTemplateSchema = z.object({
  name: z.string().min(1).max(120),
});

export async function createOnboardingTemplate(formData: FormData) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const parsed = createTemplateSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
  });
  if (!parsed.success) redirect(`/onboarding/templates?error=${encodeURIComponent("Invalid name")}`);

  const { data, error } = await supabase
    .from("onboarding_templates")
    .insert({ org_id: orgId, name: parsed.data.name })
    .select("id")
    .single();

  if (error) redirect(`/onboarding/templates?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/onboarding/templates");
  redirect(`/onboarding/templates/${data.id}`);
}

const itemSchema = z.object({
  task_title: z.string().min(1).max(200),
  default_due_days: z.coerce.number().int().min(0).max(365),
  sort_order: z.coerce.number().int().min(0).max(10000),
});

export async function addTemplateItem(templateId: string, formData: FormData) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const parsed = itemSchema.safeParse({
    task_title: String(formData.get("task_title") ?? "").trim(),
    default_due_days: formData.get("default_due_days"),
    sort_order: formData.get("sort_order"),
  });
  if (!parsed.success) redirect(`/onboarding/templates/${templateId}?error=${encodeURIComponent("Invalid item")}`);

  const { error } = await supabase.from("onboarding_template_items").insert({
    org_id: orgId,
    template_id: templateId,
    task_title: parsed.data.task_title,
    default_due_days: parsed.data.default_due_days,
    sort_order: parsed.data.sort_order,
  });
  if (error) redirect(`/onboarding/templates/${templateId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/onboarding/templates/${templateId}`);
  redirect(`/onboarding/templates/${templateId}`);
}

export async function updateTemplateItem(itemId: string, templateId: string, formData: FormData) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const parsed = itemSchema.safeParse({
    task_title: String(formData.get("task_title") ?? "").trim(),
    default_due_days: formData.get("default_due_days"),
    sort_order: formData.get("sort_order"),
  });
  if (!parsed.success) redirect(`/onboarding/templates/${templateId}?error=${encodeURIComponent("Invalid item")}`);

  const { error } = await supabase
    .from("onboarding_template_items")
    .update({
      task_title: parsed.data.task_title,
      default_due_days: parsed.data.default_due_days,
      sort_order: parsed.data.sort_order,
    })
    .eq("id", itemId)
    .eq("org_id", orgId)
    .is("deleted_at", null);

  if (error) redirect(`/onboarding/templates/${templateId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/onboarding/templates/${templateId}`);
  redirect(`/onboarding/templates/${templateId}`);
}

export async function softDeleteTemplateItem(itemId: string, templateId: string) {
  await requirePermission("employees.write");
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const { error } = await supabase
    .from("onboarding_template_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("org_id", orgId)
    .is("deleted_at", null);

  if (error) redirect(`/onboarding/templates/${templateId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/onboarding/templates/${templateId}`);
  redirect(`/onboarding/templates/${templateId}`);
}

export async function assignOnboardingTasks(formData: FormData) {
  await requirePermission("employees.write");

  const employeeId = String(formData.get("employee_id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  const assignedTo = String(formData.get("assigned_to") ?? "");

  if (!employeeId || !templateId || !assignedTo) {
    redirect(
      `/onboarding/confirm?employeeId=${encodeURIComponent(
        employeeId,
      )}&templateId=${encodeURIComponent(templateId)}&error=Missing%20required%20fields`,
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "create_onboarding_tasks_from_template",
    {
      p_employee_id: employeeId,
      p_template_id: templateId,
      p_assigned_to: assignedTo,
    },
  );

  if (error) {
    redirect(
      `/onboarding/confirm?employeeId=${encodeURIComponent(
        employeeId,
      )}&templateId=${encodeURIComponent(templateId)}&error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/onboarding");
  redirect(`/onboarding?created=${encodeURIComponent(String(data ?? 0))}`);
}

