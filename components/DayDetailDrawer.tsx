"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { ReceiptData, ExpenseCategory } from "@/lib/types";
import { CATEGORY_METADATA, normalizeCategory } from "@/lib/categories";
import { formatCurrency } from "@/lib/currency";
import {
  X,
  Plus,
  Trash2,
  Receipt as ReceiptIcon,
  Store,
  Calendar,
} from "lucide-react";

interface DayDetailDrawerProps {
  selectedDate: Date | null;
  onClose: () => void;
  receipts: ReceiptData[];
  onDeleteReceipt: (receiptId: string) => Promise<void>;
  onOpenManualEntry: (date: Date) => void;
  onOpenScanner: () => void;
}

export function DayDetailDrawer({
  selectedDate,
  onClose,
  receipts,
  onDeleteReceipt,
  onOpenManualEntry,
  onOpenScanner,
}: DayDetailDrawerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!selectedDate) return null;

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayReceipts = receipts.filter((r) => r.date.slice(0, 10) === dateStr);

  // Compute daily totals and category breakdowns
  let totalSpent = 0;
  let totalItemsCount = 0;
  const categoryTotals: Partial<Record<ExpenseCategory, number>> = {};

  dayReceipts.forEach((r) => {
    totalSpent += r.total_amount;
    r.items.forEach((item) => {
      totalItemsCount += 1;
      const cat = normalizeCategory(item.category);
      const subtotal = item.price * (item.quantity || 1);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + subtotal;
    });
  });

  const activeCategories = (Object.keys(categoryTotals) as ExpenseCategory[]).sort(
    (a, b) => (categoryTotals[b] || 0) - (categoryTotals[a] || 0)
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this receipt and its items?")) {
      setDeletingId(id);
      try {
        await onDeleteReceipt(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className="relative z-10 w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slideLeft transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dayReceipts.length} receipt{dayReceipts.length !== 1 ? "s" : ""}{" "}
                • {totalItemsCount} line items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Day Summary Highlights */}
        <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/40 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Spent</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalSpent)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Top Category</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300 truncate block">
              {activeCategories.length > 0
                ? `${activeCategories[0]} (${formatCurrency(categoryTotals[activeCategories[0]] || 0)})`
                : "None"}
            </span>
          </div>

          {/* Category breakdown chips */}
          {activeCategories.length > 0 && (
            <div className="col-span-2 pt-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 mb-2 block font-medium">
                Category Breakdown:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeCategories.map((cat) => {
                  const meta = CATEGORY_METADATA[cat];
                  const amt = categoryTotals[cat] || 0;
                  const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
                  return (
                    <span
                      key={cat}
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${meta.bgColor} ${meta.textColor} ${meta.borderColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                      <span className="font-medium">{cat}</span>
                      <span className="opacity-85 font-mono">{formatCurrency(amt)}</span>
                      <span className="text-[10px] opacity-70">({pct}%)</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons for this day */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2">
          <button
            onClick={() => onOpenManualEntry(selectedDate)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Add Manual Expense</span>
          </button>
          <button
            onClick={onOpenScanner}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors shadow-sm"
          >
            <ReceiptIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Scan Receipt</span>
          </button>
        </div>

        {/* Receipts & Items Scrollable List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {dayReceipts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
                <ReceiptIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">No receipts for this date</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Scan a receipt image or manually add expenses made on {format(selectedDate, "MMM d")}.
              </p>
            </div>
          ) : (
            dayReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-white dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-sm hover:shadow transition-all"
              >
                {/* Receipt Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {receipt.merchant_name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {receipt.items.length} item{receipt.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(receipt.total_amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      disabled={deletingId === receipt.id}
                      title="Delete Receipt"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider grid grid-cols-12 gap-2 px-1">
                    <span className="col-span-5">Item</span>
                    <span className="col-span-4">Category</span>
                    <span className="col-span-1 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {receipt.items.map((item, idx) => {
                      const cat = normalizeCategory(item.category);
                      const meta = CATEGORY_METADATA[cat];
                      const subtotal = item.price * (item.quantity || 1);

                      return (
                        <div
                          key={item.id || idx}
                          className="grid grid-cols-12 gap-2 items-center py-2 px-1 text-xs hover:bg-slate-50 dark:hover:bg-white/[0.02] rounded-lg transition-colors"
                        >
                          <div className="col-span-5 font-medium text-slate-800 dark:text-slate-200 truncate">
                            {item.name}
                          </div>

                          <div className="col-span-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${meta.bgColor} ${meta.textColor} ${meta.borderColor}`}
                            >
                              <span className={`w-1 h-1 rounded-full ${meta.dotColor}`} />
                              <span className="truncate">{cat}</span>
                            </span>
                          </div>

                          <div className="col-span-1 text-center text-slate-500 dark:text-slate-400 text-xs">
                            {item.quantity}
                          </div>

                          <div className="col-span-2 text-right font-mono font-medium text-slate-900 dark:text-slate-200">
                            {formatCurrency(subtotal)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
