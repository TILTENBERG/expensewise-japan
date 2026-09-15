"use client";

import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { ReceiptData } from "@/lib/types";
import { normalizeCategory } from "@/lib/categories";
import { formatCurrency } from "@/lib/currency";

interface CalendarViewProps {
  currentDate: Date;
  receipts: ReceiptData[];
  selectedCategory: string | null;
  onSelectDate: (date: Date) => void;
  onQuickAdd: (date: Date) => void;
}

export function CalendarView({
  currentDate,
  receipts,
  selectedCategory,
  onSelectDate,
  onQuickAdd,
}: CalendarViewProps) {
  // Calendar bounds: includes padding days from previous/next months for clean 7-column grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Index receipts by date string (YYYY-MM-DD)
  const receiptsByDay = React.useMemo(() => {
    const map = new Map<string, ReceiptData[]>();
    receipts.forEach((r) => {
      const dStr = r.date.slice(0, 10);
      const existing = map.get(dStr) || [];
      existing.push(r);
      map.set(dStr, existing);
    });
    return map;
  }, [receipts]);

  return (
    <div className="w-full bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-sm transition-colors">
      {/* Week Day Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`py-2 sm:py-2.5 text-center text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200/80 dark:divide-white/5 bg-slate-200/40 dark:bg-slate-950/30">
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayReceipts = receiptsByDay.get(dateStr) || [];
          const isCurrMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          // Calculate spending on this day (respecting category filter if set)
          let daySpent = 0;
          dayReceipts.forEach((receipt) => {
            receipt.items.forEach((item) => {
              const cat = normalizeCategory(item.category);
              const matchesFilter = !selectedCategory || cat === selectedCategory;
              if (matchesFilter) {
                daySpent += item.price * (item.quantity || 1);
              }
            });
          });

          const hasSpending = daySpent > 0;
          const isFilterActive = selectedCategory !== null;
          const isMuted = !isCurrMonth || (isFilterActive && !hasSpending);

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(day)}
              className={`group relative min-h-[58px] sm:min-h-[85px] p-1 sm:p-2 flex flex-col justify-between transition-all duration-150 cursor-pointer overflow-hidden ${
                isMuted
                  ? "opacity-30 bg-slate-100/30 dark:bg-slate-950/20"
                  : "bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 active:bg-indigo-50/40 dark:active:bg-indigo-950/30"
              } ${
                isCurrentDay
                  ? "bg-indigo-50/80 dark:bg-indigo-950/30 ring-1.5 ring-inset ring-indigo-500 shadow-inner"
                  : ""
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center justify-center text-[11px] sm:text-xs font-semibold rounded-md w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                    isCurrentDay
                      ? "bg-indigo-600 text-white font-bold shadow-sm"
                      : isCurrMonth
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {format(day, "d")}
                </span>

                {/* Subtle indicator dot if day has multiple receipts */}
                {dayReceipts.length > 1 && (
                  <span
                    title={`${dayReceipts.length} receipts`}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 dark:bg-indigo-400/60 mr-0.5"
                  />
                )}
              </div>

              {/* Total Value Only - Clean, centered, never overflows */}
              <div className="mt-auto pt-0.5 flex items-center justify-center w-full">
                {hasSpending ? (
                  <span
                    className={`w-full text-center text-[10px] sm:text-xs font-bold font-mono tracking-tight px-1 py-0.5 rounded truncate ${
                      daySpent > 8000
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                        : daySpent > 3000
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                    }`}
                  >
                    {formatCurrency(daySpent)}
                  </span>
                ) : (
                  <span className="text-[9px] text-transparent select-none">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
