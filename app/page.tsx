"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { Navbar } from "@/components/Navbar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CalendarView } from "@/components/CalendarView";
import { DayDetailDrawer } from "@/components/DayDetailDrawer";
import { ReceiptScannerModal } from "@/components/ReceiptScannerModal";
import { ManualExpenseModal } from "@/components/ManualExpenseModal";
import { AnalyticsSummary } from "@/components/AnalyticsSummary";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { BottomNav } from "@/components/BottomNav";
import { ReceiptData, MonthlyAnalytics, ExpenseCategory } from "@/lib/types";
import { Sparkles, Plus, Database, AlertCircle, Smartphone } from "lucide-react";

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(100000);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);

  // Android PWA install prompt & calendar ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const calendarRef = React.useRef<HTMLDivElement | null>(null);

  const handleScrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Modals state
  const [showScanner, setShowScanner] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDate, setManualDate] = useState<Date | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Loading and alerts
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showIOSInstallBanner, setShowIOSInstallBanner] = useState(false);

  // Load stored preferences (budget & API key)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("gemini_api_key");
      if (storedKey) setApiKey(storedKey);

      const storedBudget = localStorage.getItem("monthly_budget");
      if (storedBudget) {
        const parsed = parseFloat(storedBudget);
        if (!isNaN(parsed) && parsed > 0) setMonthlyBudget(parsed);
      }

      // Check if user is on iOS Safari and not yet in standalone PWA mode
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isStandalone =
        ("standalone" in window.navigator &&
          Boolean((window.navigator as unknown as { standalone: boolean }).standalone)) ||
        window.matchMedia("(display-mode: standalone)").matches;
      const isDismissed = sessionStorage.getItem("dismissed_ios_guide");

      if (isIOS && !isStandalone && !isDismissed) {
        setShowIOSInstallBanner(true);
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleDismissIOSBanner = () => {
    setShowIOSInstallBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dismissed_ios_guide", "true");
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const monthParam = format(currentDate, "yyyy-MM");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [receiptsRes, analyticsRes] = await Promise.all([
        fetch(`/api/receipts?month=${monthParam}`),
        fetch(`/api/analytics?month=${monthParam}&budget=${monthlyBudget}`),
      ]);

      if (receiptsRes.ok) {
        const receiptsData = await receiptsRes.json();
        setReceipts(receiptsData);
      }
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error("Failed to load month data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [monthParam, monthlyBudget]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle month switches
  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Budget update
  const handleUpdateBudget = (newBudget: number) => {
    setMonthlyBudget(newBudget);
    if (typeof window !== "undefined") {
      localStorage.setItem("monthly_budget", newBudget.toString());
    }
  };

  // API Key update
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem("gemini_api_key", key);
      } else {
        localStorage.removeItem("gemini_api_key");
      }
    }
  };

  // Delete receipt handler
  const handleDeleteReceipt = async (receiptId: string) => {
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setToastMessage("Receipt deleted successfully.");
        setTimeout(() => setToastMessage(null), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Seed Demo Data
  const handleSeedDemoData = async () => {
    try {
      const res = await fetch(`/api/seed?month=${monthParam}`, {
        method: "POST",
      });
      if (res.ok) {
        setToastMessage(`Seeded realistic demo receipts for ${format(currentDate, "MMMM yyyy")}!`);
        setTimeout(() => setToastMessage(null), 4000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compute category totals for the filter bar
  const categoryTotals = React.useMemo(() => {
    const totals: Record<ExpenseCategory, number> = {
      Alcohol: 0,
      Drinks: 0,
      "Food Ingredients": 0,
      Sweets: 0,
      "Prepared Meals": 0,
      Household: 0,
      Other: 0,
    };
    receipts.forEach((r) => {
      r.items.forEach((item) => {
        const cat = item.category as ExpenseCategory;
        if (totals[cat] !== undefined) {
          totals[cat] += item.price * (item.quantity || 1);
        }
      });
    });
    return totals;
  }, [receipts]);

  const totalSpentMonth = analytics?.totalSpent || 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white pb-24 md:pb-16 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
          <Sparkles className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onOpenScanner={() => setShowScanner(true)}
        onOpenManualEntry={() => {
          setManualDate(null);
          setShowManualModal(true);
        }}
        onOpenApiKeyModal={() => setShowApiKeyModal(true)}
        onSeedData={handleSeedDemoData}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        showAnalytics={showAnalytics}
        totalSpentMonth={totalSpentMonth}
        monthlyBudget={monthlyBudget}
        hasCustomKey={Boolean(apiKey)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6 pb-28 md:pb-8 space-y-6">
        {/* iOS iPhone Install Guide Banner */}
        {showIOSInstallBanner && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-start justify-between gap-3 border border-white/10 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl shrink-0 mt-0.5">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold">Install on your new iPhone</p>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 font-medium">iOS Standalone</span>
                </div>
                <p className="text-[11px] text-white/90 leading-relaxed">
                  Tap the Safari <strong>Share</strong> button <span className="inline-block px-1.5 py-0.5 rounded bg-white/25 text-[10px] font-mono font-bold">⎋</span> at the bottom of your screen, then tap <span className="inline-block px-1.5 py-0.5 rounded bg-white/25 text-[10px] font-mono font-bold">+ Add to Home Screen</span> for the native app experience with zero browser bars!
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissIOSBanner}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium transition-colors shrink-0"
            >
              Got it
            </button>
          </div>
        )}

        {/* Android PWA Install Banner */}
        {deferredPrompt && (
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Install ExpenseWise on Android</p>
                <p className="text-[11px] opacity-90">Install as standalone app with camera scanner</p>
              </div>
            </div>
            <button
              onClick={handleInstallApp}
              className="px-3.5 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs shadow transition-all whitespace-nowrap"
            >
              Install App
            </button>
          </div>
        )}

        {/* Optional Collapsible Analytics Section */}
        {showAnalytics && (
          <AnalyticsSummary
            analytics={analytics}
            monthlyBudget={monthlyBudget}
            onUpdateBudget={handleUpdateBudget}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            selectedCategory={selectedCategory}
          />
        )}

        {/* Category Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryTotals={categoryTotals}
          />
        </div>

        {/* Interactive Calendar Grid */}
        <div ref={calendarRef}>
          <CalendarView
            currentDate={currentDate}
            receipts={receipts}
            selectedCategory={selectedCategory}
            onSelectDate={(date) => setSelectedDate(date)}
            onQuickAdd={(date) => {
              setManualDate(date);
              setShowManualModal(true);
            }}
          />
        </div>
      </main>

      {/* Slide-Over Drawer for Selected Day Details */}
      <DayDetailDrawer
        selectedDate={selectedDate}
        onClose={() => setSelectedDate(null)}
        receipts={receipts}
        onDeleteReceipt={handleDeleteReceipt}
        onOpenManualEntry={(date) => {
          setSelectedDate(null);
          setManualDate(date);
          setShowManualModal(true);
        }}
        onOpenScanner={() => {
          setSelectedDate(null);
          setShowScanner(true);
        }}
      />

      {/* Multimodal AI Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onReceiptSaved={() => {
          setToastMessage("Receipt analyzed and committed to calendar!");
          setTimeout(() => setToastMessage(null), 3500);
          fetchData();
        }}
        apiKey={apiKey}
        onOpenApiKeyModal={() => {
          setShowScanner(false);
          setShowApiKeyModal(true);
        }}
      />

      {/* Manual Expense Modal */}
      <ManualExpenseModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onExpenseSaved={() => {
          setToastMessage("Expense saved successfully!");
          setTimeout(() => setToastMessage(null), 3500);
          fetchData();
        }}
        defaultDate={manualDate}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {/* Mobile Android Thumb Navigation Bar */}
      <BottomNav
        onOpenScanner={() => {
          setSelectedDate(null);
          setShowScanner(true);
        }}
        onOpenManualEntry={() => {
          setManualDate(null);
          setShowManualModal(true);
        }}
        onToggleAnalytics={() => setShowAnalytics((prev) => !prev)}
        showAnalytics={showAnalytics}
        onScrollToCalendar={handleScrollToCalendar}
      />
    </div>
  );
}
