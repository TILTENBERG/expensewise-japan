"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PlusCircle,
  KeyRound,
  Database,
  Receipt as ReceiptIcon,
  BarChart3,
  Sun,
  Moon,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import { useTheme } from "@/lib/theme";

interface NavbarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onOpenScanner: () => void;
  onOpenManualEntry: () => void;
  onOpenApiKeyModal: () => void;
  onSeedData: () => void;
  onToggleAnalytics: () => void;
  showAnalytics: boolean;
  totalSpentMonth: number;
  monthlyBudget: number;
  hasCustomKey: boolean;
}

export function Navbar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onOpenScanner,
  onOpenManualEntry,
  onOpenApiKeyModal,
  onSeedData,
  onToggleAnalytics,
  showAnalytics,
  totalSpentMonth,
  monthlyBudget,
  hasCustomKey,
}: NavbarProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const percentSpent = Math.min(
    100,
    monthlyBudget > 0 ? Math.round((totalSpentMonth / monthlyBudget) * 100) : 0
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md text-white shrink-0">
            <ReceiptIcon className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
              Expense<span className="text-indigo-600 dark:text-indigo-400">Wise</span>
            </span>
          </div>
        </div>

        {/* Mid Top: Calendar Previous & Next Month Switcher (Centered) */}
        <div className="flex items-center justify-center flex-1 max-w-md mx-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={onPrevMonth}
              title="Previous Month"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2 sm:px-3">
              <CalendarIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap min-w-[105px] sm:min-w-[125px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
            </div>
            <button
              onClick={onNextMonth}
              title="Next Month"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onToday}
              className="ml-1 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors border-l border-slate-200 dark:border-slate-800"
            >
              Today
            </button>
          </div>
        </div>

        {/* Right Desktop Actions: Hidden on mobile since mobile uses Bottom Navigation */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Quick Budget Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400">Spent: </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalSpentMonth)}
              </span>
              <span className="text-slate-500"> / {formatCurrency(monthlyBudget)}</span>
            </div>
            <div className="w-14 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  percentSpent > 90
                    ? "bg-rose-500"
                    : percentSpent > 75
                    ? "bg-amber-500"
                    : "bg-indigo-600 dark:bg-indigo-500"
                }`}
                style={{ width: `${percentSpent}%` }}
              />
            </div>
          </div>

          {/* Toggle Light / Dark Mode Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm"
            title={`Current: ${resolvedTheme} mode. Click to toggle.`}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* Toggle Analytics */}
          <button
            onClick={onToggleAnalytics}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              showAnalytics
                ? "bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850"
            }`}
            title="Toggle Analytics Overview"
          >
            <BarChart3 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Analytics</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              hasCustomKey
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850"
            }`}
            title="Configure Google Gemini API Key"
          >
            <KeyRound
              className={`h-3.5 w-3.5 ${
                hasCustomKey ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"
              }`}
            />
            <span>{hasCustomKey ? "API Key Set" : "Set API Key"}</span>
          </button>

          {/* Manual Entry Button */}
          <button
            onClick={onOpenManualEntry}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Manual</span>
          </button>

          {/* AI Scan Receipt Primary Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600 text-white transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Scan Receipt</span>
          </button>
        </div>

        {/* Mobile Right Utility: Single compact API Key button */}
        <div className="flex md:hidden items-center gap-1 shrink-0">
          <button
            onClick={onOpenApiKeyModal}
            className={`p-1.5 rounded-lg border transition-colors ${
              hasCustomKey
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
            }`}
            title="Google Gemini API Key"
          >
            <KeyRound className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
