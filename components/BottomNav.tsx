"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  Camera,
  BarChart3,
  PlusCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

interface BottomNavProps {
  onOpenScanner: () => void;
  onOpenManualEntry: () => void;
  onToggleAnalytics: () => void;
  showAnalytics: boolean;
  onScrollToCalendar: () => void;
}

export function BottomNav({
  onOpenScanner,
  onOpenManualEntry,
  onToggleAnalytics,
  showAnalytics,
  onScrollToCalendar,
}: BottomNavProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-white/10 backdrop-blur-lg px-4 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      {/* Calendar View */}
      <button
        onClick={onScrollToCalendar}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 transition-colors"
      >
        <CalendarIcon className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Calendar</span>
      </button>

      {/* Analytics Toggle */}
      <button
        onClick={onToggleAnalytics}
        className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
          showAnalytics
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <BarChart3 className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Analytics</span>
      </button>

      {/* Central Floating Camera Scan Button */}
      <div className="-mt-6">
        <button
          onClick={onOpenScanner}
          className="w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/40 active:scale-95 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-900"
          title="Scan Receipt with Camera"
        >
          <Camera className="h-6 w-6" />
        </button>
      </div>

      {/* Manual Entry */}
      <button
        onClick={onOpenManualEntry}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 transition-colors"
      >
        <PlusCircle className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Manual</span>
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 p-1.5 transition-colors"
        title="Toggle Light / Dark Mode"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5 text-amber-400" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600" />
        )}
        <span className="text-[10px] font-semibold">
          {resolvedTheme === "dark" ? "Light" : "Dark"}
        </span>
      </button>
    </nav>
  );
}
