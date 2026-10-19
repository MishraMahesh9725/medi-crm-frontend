"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers, inviteUser, deactivateUser, activateUser } from "@/services/users.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { useToast } from "@/components/shared/Toast";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api";

const inviteSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().min(10, "At least 10 digits").optional().or(z.literal("")),
  role: z.enum(["OWNER", "PHARMACIST", "CASHIER"]).default("CASHIER"),
});
type InviteForm = z.infer<typeof inviteSchema>;

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  PHARMACIST: "Pharmacist",
  CASHIER: "Cashier",
};

export default function TeamSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () => listUsers({}),
  });

  const inviteMutation = useMutation({
    mutationFn: (input: InviteForm) =>
      inviteUser({ name: input.name, email: input.email || undefined, phone: input.phone || undefined, role: input.role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast("Team member invited");
      setShowInvite(false);
      reset();
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Could not invite user.", "error");
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold text-[#1F2D2B]">Team</h1>
        <button onClick={() => setShowInvite(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] text-sm min-h-[44px]">
          <Plus className="w-4 h-4" /> Invite member
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleSubmit((d) => inviteMutation.mutate(d))} noValidate
          className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 mb-5 space-y-4">
          <h2 className="font-semibold text-[#1F2D2B]">Invite a team member</h2>
          {[
            { label: "Full name", name: "name" as const, required: true },
            { label: "Email", name: "email" as const, type: "email" },
            { label: "Phone", name: "phone" as const, type: "tel" },
          ].map((f) => (
            <div key={f.name} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1F2D2B]">{f.label}{f.required && <span className="text-[#D94F4F] ml-1">*</span>}</label>
              <input type={f.type ?? "text"} {...register(f.name)}
                className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
              {errors[f.name] && <p className="text-sm text-[#D94F4F]">{errors[f.name]?.message}</p>}
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1F2D2B]">Role</label>
            <select {...register("role")}
              className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83]">
              <option value="CASHIER">Cashier — billing only</option>
              <option value="PHARMACIST">Pharmacist — billing + inventory</option>
              <option value="OWNER">Owner — full access</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setShowInvite(false); reset(); }}
              className="flex-1 min-h-[48px] border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[12px] hover:bg-[#F3F7F6]">Cancel</button>
            <button type="submit" disabled={isSubmitting || inviteMutation.isPending}
              className="flex-1 min-h-[48px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2">
              {(isSubmitting || inviteMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              Send invite
            </button>
          </div>
        </form>
      )}

      {/* Team list */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : isError ? (
        <ErrorMessage onRetry={() => refetch()} />
      ) : (
        <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
          {(data?.data ?? []).map((user) => (
            <div key={user.id} className="flex items-center justify-between px-5 py-4 gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[#1F2D2B]">{user.name}</p>
                <p className="text-sm text-[#5A7370]">{user.email ?? user.phone ?? "—"}</p>
                <p className="text-xs text-[#5A7370]">
                  {ROLE_LABELS[user.role]} · Last login {user.lastLoginAt ? formatDate(user.lastLoginAt) : "never"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge label={user.isActive ? "Active" : "Inactive"} variant={user.isActive ? "success" : "neutral"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
