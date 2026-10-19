"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { getMockRefills, buildReminderMessage, type RefillReminder } from "@/services/mock/refills.mock";
import { useToast } from "@/components/shared/Toast";

export default function SendReminderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [reminder, setReminder] = useState<RefillReminder | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMockRefills().then((reminders) => {
      const r = reminders.find((r) => r.id === id);
      if (r) {
        setReminder(r);
        setMessage(buildReminderMessage(r));
      }
    });
  }, [id]);

  function handleSendWhatsApp() {
    if (!reminder?.customerPhone || !message) return;
    const url = `https://wa.me/91${reminder.customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast("Opening WhatsApp…");
    router.back();
  }

  if (!reminder) {
    return (
      <div className="max-w-md mx-auto flex items-center justify-center py-20">
        <p className="text-[#5A7370]">Loading reminder…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold text-[#1F2D2B]">Send refill reminder</h1>
      </div>

      <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-5">
        <div>
          <p className="text-sm text-[#5A7370]">Sending to</p>
          <p className="font-medium text-[#1F2D2B]">{reminder.customerName}</p>
          {reminder.customerPhone && (
            <p className="text-sm text-[#5A7370]">+91 {reminder.customerPhone}</p>
          )}
        </div>

        <div>
          <p className="text-sm text-[#5A7370]">Medicine</p>
          <p className="font-medium text-[#1F2D2B]">{reminder.medicineName}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#1F2D2B]">Message preview</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="px-3 py-2.5 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] resize-none"
          />
          <p className="text-xs text-[#5A7370]">You can edit this message before sending.</p>
        </div>

        {!reminder.customerPhone && (
          <div className="bg-[#FEF3E2] rounded-[10px] px-3 py-2.5 text-sm text-[#7C4D0D]">
            No phone number on file. Add a phone number to send via WhatsApp.
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 min-h-[52px] border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[12px] hover:bg-[#F3F7F6]">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={!reminder.customerPhone}
            className="flex-1 min-h-[52px] bg-[#22A665] text-white font-semibold rounded-[12px] hover:bg-[#1A8550] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
