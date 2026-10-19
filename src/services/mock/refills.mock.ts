/**
 * MOCK SERVICE — Refill Reminders
 * TODO: Replace with real API when backend adds GET/POST /refills endpoints.
 * See TODO.md for details.
 */

export interface RefillReminder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  medicineId: string;
  medicineName: string;
  quantity: number;
  intervalDays: number;
  lastPurchaseAt: string;
  nextDueDate: string;
  isActive: boolean;
}

export type RefillGroup = "due_now" | "this_week" | "later";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const MOCK_REFILLS: RefillReminder[] = [
  {
    id: "r1",
    customerId: "c1",
    customerName: "Ramesh Patel",
    customerPhone: "9876543210",
    medicineId: "m1",
    medicineName: "Metformin 500mg",
    quantity: 2,
    intervalDays: 30,
    lastPurchaseAt: daysAgo(30),
    nextDueDate: daysFromNow(0),
    isActive: true,
  },
  {
    id: "r2",
    customerId: "c2",
    customerName: "Sushila Mehta",
    customerPhone: "9765432109",
    medicineId: "m2",
    medicineName: "Amlodipine 5mg",
    quantity: 1,
    intervalDays: 30,
    lastPurchaseAt: daysAgo(27),
    nextDueDate: daysFromNow(3),
    isActive: true,
  },
  {
    id: "r3",
    customerId: "c3",
    customerName: "Dilip Shah",
    customerPhone: "9654321098",
    medicineId: "m3",
    medicineName: "Thyronorm 50mcg",
    quantity: 1,
    intervalDays: 30,
    lastPurchaseAt: daysAgo(20),
    nextDueDate: daysFromNow(10),
    isActive: true,
  },
  {
    id: "r4",
    customerId: "c4",
    customerName: "Priya Nair",
    customerPhone: "9543210987",
    medicineId: "m4",
    medicineName: "Atorvastatin 10mg",
    quantity: 1,
    intervalDays: 30,
    lastPurchaseAt: daysAgo(10),
    nextDueDate: daysFromNow(20),
    isActive: true,
  },
  {
    id: "r5",
    customerId: "c1",
    customerName: "Ramesh Patel",
    customerPhone: "9876543210",
    medicineId: "m5",
    medicineName: "Telmisartan 40mg",
    quantity: 1,
    intervalDays: 30,
    lastPurchaseAt: daysAgo(5),
    nextDueDate: daysFromNow(25),
    isActive: true,
  },
];

export function groupRefillsByDue(reminders: RefillReminder[]): Record<RefillGroup, RefillReminder[]> {
  const groups: Record<RefillGroup, RefillReminder[]> = {
    due_now: [],
    this_week: [],
    later: [],
  };

  for (const r of reminders) {
    const next = new Date(r.nextDueDate);
    const now = new Date();
    const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      groups.due_now.push(r);
    } else if (diffDays <= 7) {
      groups.this_week.push(r);
    } else {
      groups.later.push(r);
    }
  }

  return groups;
}

// Simulates an async API call
export async function getMockRefills(): Promise<RefillReminder[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_REFILLS.filter((r) => r.isActive);
}

export function buildReminderMessage(reminder: RefillReminder): string {
  return `Hello ${reminder.customerName}, your ${reminder.medicineName} (${reminder.quantity} pack${
    reminder.quantity > 1 ? "s" : ""
  }) is due for refill. Please visit us or call to place your order. — MediBill`;
}
