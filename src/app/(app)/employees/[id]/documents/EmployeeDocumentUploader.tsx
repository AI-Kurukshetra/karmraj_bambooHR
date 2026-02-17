"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function EmployeeDocumentUploader({
  employeeId,
}: {
  employeeId: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [documentType, setDocumentType] = useState("other");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload() {
    setError(null);
    if (!file) {
      setError("Pick a file first.");
      return;
    }

    setIsUploading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Not authenticated");

      const { data: membership, error: memberError } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", userData.user.id)
        .is("deleted_at", null)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (memberError) throw new Error(memberError.message);
      if (!membership?.org_id) throw new Error("No organization linked to user.");

      const orgId = membership.org_id;
      const safeName = file.name.replaceAll("/", "_");
      const path = `${orgId}/${employeeId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("employee-documents")
        .upload(path, file, { upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      const { error: insertError } = await supabase.from("employee_documents").insert({
        org_id: orgId,
        employee_id: employeeId,
        file_path: path,
        document_type: documentType,
        uploaded_by: userData.user.id,
      });
      if (insertError) throw new Error(insertError.message);

      setFile(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="text-sm font-semibold">Upload document</div>
      <p className="mt-1 text-sm text-zinc-600">
        Files are stored in Supabase Storage and access is enforced by RLS.
      </p>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-600">
            Type
          </label>
          <select
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="id">ID</option>
            <option value="address_proof">Address proof</option>
            <option value="offer_letter">Offer letter</option>
            <option value="contract">Contract</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-600">
            File
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          type="button"
          onClick={onUpload}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

