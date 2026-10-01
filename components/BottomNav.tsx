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
  activeTab: "calendar" | "analytics";
  onSelectTab: (tab: "calendar" | "analytics") => void;
  onOpenScanner: () => void;
  onOpenManualEntry: () => void;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenManualEntry,
}: BottomNavProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-white/10 backdrop-blur-lg px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div className="grid grid-cols-5 items-center w-full max-w-lg mx-auto">
        {/* 1: Calendar Tab */}
        <button
          onClick={() => onSelectTab("calendar")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === "calendar"
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CalendarIcon className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Calendar</span>
        </button>

        {/* 2: Analytics Tab */}
        <button
          onClick={() => onSelectTab("analytics")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === "analytics"
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Analytics</span>
        </button>

        {/* 3: Central Floating Camera Scan Button - EXACT MATHEMATICAL CENTER */}
        <div className="flex justify-center -mt-6">
          <button
            onClick={onOpenScanner}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/40 active:scale-95 transition-transform flex items-center justify-center border-4 border-white dark:border-slate-950"
            title="Scan Receipt with Camera"
          >
            <Camera className="h-6 w-6" />
          </button>
        </div>

        {/* 4: Manual Expense Entry */}
        <button
          onClick={onOpenManualEntry}
          className="flex flex-col items-center justify-center py-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Manual</span>
        </button>

        {/* 5: Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center py-1 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
          title="Toggle Light / Dark Mode"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5 mb-0.5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 mb-0.5 text-indigo-600" />
          )}
          <span className="text-[10px]">
            {resolvedTheme === "dark" ? "Light" : "Dark"}
          </span>
        </button>
      </div>
    </nav>
  );
}
