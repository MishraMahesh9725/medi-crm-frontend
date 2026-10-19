import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          "p-2 rounded-[8px] border border-[#E2EEEC] text-[#1F2D2B] transition-colors",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "hover:enabled:bg-[#F3F7F6]"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-sm text-[#5A7370]">
        Page <span className="font-semibold text-[#1F2D2B]">{page}</span> of{" "}
        <span className="font-semibold text-[#1F2D2B]">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "p-2 rounded-[8px] border border-[#E2EEEC] text-[#1F2D2B] transition-colors",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "hover:enabled:bg-[#F3F7F6]"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
