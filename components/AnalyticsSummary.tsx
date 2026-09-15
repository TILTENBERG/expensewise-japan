"use client";

import React, { useState } from "react";
import { ALL_CATEGORIES, CATEGORY_METADATA } from "@/lib/categories";
import { ExpenseCategory, MonthlyAnalytics } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  DollarSign,
  Calendar,
  Edit2,
  Check,
} from "lucide-react";

interface AnalyticsSummaryProps {
  analytics: MonthlyAnalytics | null;
  monthlyBudget: number;
  onUpdateBudget: (newBudget: number) => void;
  onSelectCategory: (category: ExpenseCategory | null) => void;
  selectedCategory: string | null;
}

export function AnalyticsSummary({
  analytics,
  monthlyBudget,
  onUpdateBudget,
  onSelectCategory,
  selectedCategory,
}: AnalyticsSummaryProps) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  if (!analytics) return null;

  const totalSpent = analytics.totalSpent;
  const percentSpent = Math.min(
    100,
    monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) : 0
  );
  const remainingBudget = monthlyBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(val);
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-6 backdrop-blur-sm shadow-md dark:shadow-xl space-y-6 transition-colors">
      {/* Top metrics bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Monthly Spend */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Spent
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {formatCurrency(totalSpent)}
            </span>
            <span className="text-[11px] text-slate-500">
              Across {analytics.receiptCount} receipts ({analytics.itemCount} items)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Monthly Budget Target */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Budget
            </span>
            {!isEditingBudget ? (
              <button
                onClick={() => {
                  setBudgetInput(monthlyBudget.toString());
                  setIsEditingBudget(true);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded transition-colors"
                title="Edit budget"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            ) : (
              <button
                onClick={handleSaveBudget}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 p-1 rounded transition-colors"
                title="Save budget"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="mt-1 flex items-baseline justify-between">
            {!isEditingBudget ? (
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(monthlyBudget)}
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-slate-600 dark:text-slate-400 font-bold">¥</span>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveBudget()}
                  autoFocus
                  className="w-28 bg-white dark:bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            )}
            <span
              className={`text-xs font-bold ${
                isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isOverBudget
                ? `+${formatCurrency(Math.abs(remainingBudget))} over`
                : `${formatCurrency(remainingBudget)} left`}
            </span>
          </div>

          {/* Budget progress bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                percentSpent >= 100
                  ? "bg-rose-500"
                  : percentSpent > 80
                  ? "bg-amber-500"
                  : "bg-indigo-600 dark:bg-indigo-500"
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
        </div>

        {/* Daily Average */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Daily Average
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block">
              {formatCurrency(analytics.averageDailySpend)}
            </span>
            <span className="text-[11px] text-slate-500">Per day this month</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Peak Spending Day */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Peak Spending Day
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1 block truncate">
              {analytics.highestDay ? formatCurrency(analytics.highestDay.amount) : "None"}
            </span>
            <span className="text-[11px] text-slate-500">
              {analytics.highestDay ? analytics.highestDay.date : "No records"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Category Spend Distribution Chart & Bars */}
      <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Category Spending Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click a category bar to filter calendar
          </span>
        </div>

        {/* Stacked Proportional Bar */}
        {totalSpent > 0 && (
          <div className="w-full h-4 rounded-full overflow-hidden flex mb-5 bg-slate-200 dark:bg-slate-800 shadow-inner">
            {analytics.categoryBreakdown
              .filter((c) => c.percentage > 0)
              .map((c) => (
                <div
                  key={c.category}
                  style={{
                    width: `${c.percentage}%`,
                    backgroundColor: CATEGORY_METADATA[c.category].chartColor,
                  }}
                  title={`${c.category}: ${formatCurrency(c.total)} (${c.percentage}%)`}
                  className="h-full transition-all duration-300 hover:brightness-110 cursor-pointer"
                  onClick={() =>
                    onSelectCategory(
                      selectedCategory === c.category ? null : c.category
                    )
                  }
                />
              ))}
          </div>
        )}

        {/* Detailed Category Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {analytics.categoryBreakdown.map((cat) => {
            const meta = CATEGORY_METADATA[cat.category];
            const isSelected = selectedCategory === cat.category;

            return (
              <div
                key={cat.category}
                onClick={() =>
                  onSelectCategory(isSelected ? null : cat.category)
                }
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: meta.chartColor }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      {cat.category}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {cat.count} item{cat.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
                    {formatCurrency(cat.total)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
