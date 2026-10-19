"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  getMockRefills,
  groupRefillsByDue,
  type RefillReminder,
  type RefillGroup,
} from "@/services/mock/refills.mock";
import { formatDate } from "@/lib/utils";

const GROUP_LABELS: Record<RefillGroup, { label: string; variant: "danger" | "warning" | "neutral" }> = {
  due_now: { label: "Due now", variant: "danger" },
  this_week: { label: "This week", variant: "warning" },
  later: { label: "Later", variant: "neutral" },
};

export default function RefillsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [groups, setGroups] = useState<Record<RefillGroup, RefillReminder[]> | null>(null);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const data = await getMockRefills();
      setGroups(groupRefillsByDue(data));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const total = groups ? Object.values(groups).flat().length : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Refill reminders"
        help="Send reminders to patients who need to refill their medicines."
      />

      {loading ? (
        <TableSkeleton rows={5} cols={3} />
      ) : error ? (
        <ErrorMessage message="Could not load refill reminders." onRetry={load} />
      ) : total === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders"
          message="Refill reminders will appear here when patients are due for their regular medicines."
        />
      ) : (
        <div className="space-y-6">
          {(["due_now", "this_week", "later"] as RefillGroup[]).map((group) => {
            const items = groups?.[group] ?? [];
            if (items.length === 0) return null;
            const meta = GROUP_LABELS[group];
            return (
              <section key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-semibold text-[#1F2D2B]">{meta.label}</h2>
                  <StatusBadge label={String(items.length)} variant={meta.variant} />
                </div>
                <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
                  {items.map((reminder) => (
                    <div key={reminder.id}
                      className="flex items-start justify-between px-4 py-4 gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#1F2D2B]">{reminder.customerName}</p>
                        <p className="text-sm text-[#5A7370]">{reminder.medicineName}</p>
                        <p className="text-xs text-[#5A7370] mt-0.5">
                          Due {formatDate(reminder.nextDueDate)}
                          {reminder.customerPhone && ` · ${reminder.customerPhone}`}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/refills/${reminder.id}/send`)}
                        className="shrink-0 px-4 py-2 bg-[#2F8F83] text-white text-sm font-medium rounded-[8px] hover:bg-[#236F65] min-h-[44px]"
                      >
                        Send reminder
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
