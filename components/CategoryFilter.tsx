"use client";

import React from "react";
import { ALL_CATEGORIES, CATEGORY_METADATA } from "@/lib/categories";
import { ExpenseCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import {
  Wine,
  Coffee,
  Apple,
  Cake,
  UtensilsCrossed,
  Home,
  Package,
  Layers,
} from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  categoryTotals?: Record<ExpenseCategory, number>;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categoryTotals,
}: CategoryFilterProps) {
  const getIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case "Alcohol":
        return <Wine className="h-3.5 w-3.5" />;
      case "Drinks":
        return <Coffee className="h-3.5 w-3.5" />;
      case "Food Ingredients":
        return <Apple className="h-3.5 w-3.5" />;
      case "Sweets":
        return <Cake className="h-3.5 w-3.5" />;
      case "Prepared Meals":
        return <UtensilsCrossed className="h-3.5 w-3.5" />;
      case "Household":
        return <Home className="h-3.5 w-3.5" />;
      default:
        return <Package className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <span className="text-xs font-medium text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
        <Layers className="h-3 w-3" /> Filter:
      </span>

      {/* All Categories Button */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
          selectedCategory === null
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
        }`}
      >
        <span>All</span>
      </button>

      {/* 7 Defined Categories */}
      {ALL_CATEGORIES.map((category) => {
        const meta = CATEGORY_METADATA[category];
        const isSelected = selectedCategory === category;
        const total = categoryTotals ? categoryTotals[category] || 0 : 0;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(isSelected ? null : category)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              isSelected
                ? "bg-indigo-50 dark:bg-slate-800 text-indigo-900 dark:text-white shadow-md " + meta.borderColor
                : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850"
            }`}
          >
            <span
              className={`p-1 rounded-md ${
                isSelected
                  ? "bg-indigo-100 dark:bg-white/10 text-indigo-700 dark:text-white"
                  : meta.textColor + " " + meta.bgColor
              }`}
            >
              {getIcon(category)}
            </span>
            <span>{category}</span>
            {total > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isSelected
                    ? "bg-indigo-200/60 dark:bg-white/20 text-indigo-900 dark:text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {formatCurrency(total)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
