import { cn } from "@/lib/utils";
import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  className,
  emptyMessage = "No data",
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-[12px] border border-[#E2EEEC]", className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-[#F3F7F6] border-b border-[#E2EEEC]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left text-[#5A7370] font-medium text-sm px-4 py-3",
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-[#5A7370] py-12 text-base"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-[#E2EEEC] last:border-0 transition-colors",
                  onRowClick
                    ? "cursor-pointer hover:bg-[#F3F7F6]"
                    : "hover:bg-[#F3F7F6]/50"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 text-[15px] text-[#1F2D2B]", col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
