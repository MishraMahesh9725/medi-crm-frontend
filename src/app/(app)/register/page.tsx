"use client";

import { useEffect, useState } from "react";
import { BookOpen, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ScheduleBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { getMockRegister, type ScheduleRegisterEntry } from "@/services/mock/register.mock";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/shared/Toast";

export default function RegisterPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [entries, setEntries] = useState<ScheduleRegisterEntry[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const data = await getMockRegister({ startDate: startDate || undefined, endDate: endDate || undefined });
      setEntries(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [startDate, endDate]);

  const columns: Column<ScheduleRegisterEntry>[] = [
    {
      key: "date",
      header: "Date",
      render: (row) => <span className="text-[#5A7370]">{formatDate(row.date)}</span>,
    },
    {
      key: "patient",
      header: "Patient",
      render: (row) => (
        <div>
          <p className="font-medium text-[#1F2D2B]">{row.patientName}</p>
          {row.patientAddress && <p className="text-xs text-[#5A7370]">{row.patientAddress}</p>}
        </div>
      ),
    },
    {
      key: "medicine",
      header: "Medicine",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-[#1F2D2B]">{row.medicine.name}</span>
          <ScheduleBadge schedule={row.medicine.schedule} />
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (row) => (
        <div>
          <p className="text-[#1F2D2B]">{row.doctorName}</p>
          {row.doctorRegNo && <p className="text-xs text-[#5A7370]">Reg: {row.doctorRegNo}</p>}
        </div>
      ),
    },
    {
      key: "prescription",
      header: "Prescription no.",
      render: (row) => <span className="text-[#5A7370]">{row.prescriptionNo ?? "—"}</span>,
    },
    {
      key: "qty",
      header: "Qty",
      render: (row) => <span className="font-medium text-[#1F2D2B]">{row.quantity}</span>,
    },
    {
      key: "invoice",
      header: "Invoice",
      render: (row) => <span className="text-[#2F8F83]">{row.invoiceNo}</span>,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Prescription register"
        help="Schedule H, H1, and X drug sales — required by law."
        action={
          <button
            onClick={() => toast("PDF export coming soon.", "info")}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[10px] hover:bg-[#F3F7F6] min-h-[44px]"
          >
            <Download className="w-4 h-4" /> Export as PDF
          </button>
        }
      />

      {/* Date filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#5A7370]">From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#5A7370]">To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
        </div>
        {(startDate || endDate) && (
          <div className="flex items-end">
            <button onClick={() => { setStartDate(""); setEndDate(""); }}
              className="min-h-[44px] px-3 border border-[#E2EEEC] rounded-[10px] text-sm text-[#5A7370] hover:bg-[#F3F7F6]">
              Clear
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : error ? (
        <ErrorMessage onRetry={load} />
      ) : entries.length === 0 ? (
        <EmptyState icon={BookOpen} title="No entries" message="No Schedule H/H1/X drug sales in this period." />
      ) : (
        <DataTable columns={columns} data={entries} rowKey={(r) => r.id} />
      )}
    </div>
  );
}
