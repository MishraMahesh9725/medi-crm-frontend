/**
 * MOCK SERVICE — Schedule Drug Register
 * TODO: Replace with real API when backend adds GET /compliance/register endpoint.
 * See TODO.md for details.
 */

export type DrugSchedule = "H" | "H1" | "X" | "NARCOTIC";

export interface ScheduleRegisterEntry {
  id: string;
  date: string;
  patientName: string;
  patientAddress: string | null;
  doctorName: string;
  doctorRegNo: string | null;
  prescriptionNo: string | null;
  prescriptionDate: string | null;
  medicine: {
    id: string;
    name: string;
    schedule: DrugSchedule;
  };
  quantity: number;
  invoiceNo: string;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const MOCK_REGISTER: ScheduleRegisterEntry[] = [
  {
    id: "se1",
    date: daysAgo(0),
    patientName: "Ashok Kumar",
    patientAddress: "12 MG Road, Ahmedabad",
    doctorName: "Dr. P. Sharma",
    doctorRegNo: "GMC/12345",
    prescriptionNo: "RX-001",
    prescriptionDate: daysAgo(0),
    medicine: { id: "m10", name: "Alprazolam 0.25mg", schedule: "H" },
    quantity: 10,
    invoiceNo: "INV-0142",
  },
  {
    id: "se2",
    date: daysAgo(1),
    patientName: "Meena Gupta",
    patientAddress: "45 Park Street",
    doctorName: "Dr. R. Joshi",
    doctorRegNo: "GMC/67890",
    prescriptionNo: "RX-002",
    prescriptionDate: daysAgo(1),
    medicine: { id: "m11", name: "Codeine Phosphate 30mg", schedule: "H1" },
    quantity: 5,
    invoiceNo: "INV-0141",
  },
  {
    id: "se3",
    date: daysAgo(3),
    patientName: "Suresh Verma",
    patientAddress: "78 Nehru Nagar",
    doctorName: "Dr. S. Patel",
    doctorRegNo: "GMC/11223",
    prescriptionNo: "RX-003",
    prescriptionDate: daysAgo(4),
    medicine: { id: "m12", name: "Tramadol 50mg", schedule: "H" },
    quantity: 15,
    invoiceNo: "INV-0138",
  },
];

export async function getMockRegister(params: {
  startDate?: string;
  endDate?: string;
}): Promise<ScheduleRegisterEntry[]> {
  await new Promise((r) => setTimeout(r, 300));

  let entries = [...MOCK_REGISTER];

  if (params.startDate) {
    const start = new Date(params.startDate);
    entries = entries.filter((e) => new Date(e.date) >= start);
  }

  if (params.endDate) {
    const end = new Date(params.endDate);
    entries = entries.filter((e) => new Date(e.date) <= end);
  }

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
