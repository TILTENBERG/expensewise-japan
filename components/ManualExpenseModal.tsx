"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ALL_CATEGORIES } from "@/lib/categories";
import { ExpenseCategory, ExpenseItemData } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Store,
  DollarSign,
  Layers,
} from "lucide-react";

interface ManualExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseSaved: () => void;
  defaultDate?: Date | null;
}

export function ManualExpenseModal({
  isOpen,
  onClose,
  onExpenseSaved,
  defaultDate,
}: ManualExpenseModalProps) {
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState("");
  const [currency, setCurrency] = useState("¥");
  const [items, setItems] = useState<ExpenseItemData[]>([
    { name: "", price: 0, quantity: 1, category: "Food Ingredients" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDate(
        defaultDate
          ? format(defaultDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd")
      );
      setMerchant("");
      setItems([{ name: "", price: 0, quantity: 1, category: "Food Ingredients" }]);
      setError(null);
    }
  }, [isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "", price: 0, quantity: 1, category: "Other" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ExpenseItemData,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  const totalCalculated = items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) {
      setError("Please enter a merchant or store name.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }
    if (items.some((it) => !it.name.trim())) {
      setError("All items must have a name.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_name: merchant.trim(),
          date,
          total_amount: Math.round(totalCalculated * 100) / 100,
          currency,
          items: items.map((it) => ({
            name: it.name.trim(),
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
            category: it.category,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create expense entry.");
      }

      onExpenseSaved();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Add Manual Expense
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log a purchase or cash receipt with itemized categories.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Top details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Merchant / Store
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. 7-Eleven, Lawson"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Total Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  disabled
                  value={formatCurrency(totalCalculated, currency)}
                  className="w-full bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Purchased Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>
            </div>

            <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 divide-y divide-slate-200 dark:divide-white/5">
              <div className="grid grid-cols-12 gap-2 p-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-900/60">
                <div className="col-span-5">Item Name</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Price ({currency})</div>
                <div className="col-span-1 text-center"></div>
              </div>

              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-slate-100/60 dark:hover:bg-white/[0.02] text-xs"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(idx, "name", e.target.value)
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                      required
                    />
                  </div>

                  <div className="col-span-3">
                    <select
                      value={item.category}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "category",
                          e.target.value as ExpenseCategory
                        )
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-sm"
                    >
                      {ALL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "quantity",
                          parseFloat(e.target.value) || 1
                        )
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 text-xs text-center text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={item.price || ""}
                      placeholder="0"
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                      required
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Saving..." : "Save Expense"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
