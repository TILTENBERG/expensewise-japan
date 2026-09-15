import { ExpenseCategory } from "./types";

export const ALL_CATEGORIES: ExpenseCategory[] = [
  "Alcohol",
  "Drinks",
  "Food Ingredients",
  "Sweets",
  "Prepared Meals",
  "Household",
  "Other",
];

export interface CategoryMeta {
  label: ExpenseCategory;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  icon: string; // Lucide icon name representation
  chartColor: string;
}

export const CATEGORY_METADATA: Record<ExpenseCategory, CategoryMeta> = {
  Alcohol: {
    label: "Alcohol",
    bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    dotColor: "bg-purple-500",
    icon: "Wine",
    chartColor: "#a855f7",
  },
  Drinks: {
    label: "Drinks",
    bgColor: "bg-sky-500/10 dark:bg-sky-500/20",
    textColor: "text-sky-700 dark:text-sky-300",
    borderColor: "border-sky-200 dark:border-sky-800",
    dotColor: "bg-sky-500",
    icon: "Coffee",
    chartColor: "#0ea5e9",
  },
  "Food Ingredients": {
    label: "Food Ingredients",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    textColor: "text-emerald-700 dark:text-emerald-300",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
    icon: "Apple",
    chartColor: "#10b981",
  },
  Sweets: {
    label: "Sweets",
    bgColor: "bg-pink-500/10 dark:bg-pink-500/20",
    textColor: "text-pink-700 dark:text-pink-300",
    borderColor: "border-pink-200 dark:border-pink-800",
    dotColor: "bg-pink-500",
    icon: "Cake",
    chartColor: "#ec4899",
  },
  "Prepared Meals": {
    label: "Prepared Meals",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    textColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
    icon: "UtensilsCrossed",
    chartColor: "#f59e0b",
  },
  Household: {
    label: "Household",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
    icon: "Home",
    chartColor: "#3b82f6",
  },
  Other: {
    label: "Other",
    bgColor: "bg-zinc-500/10 dark:bg-zinc-500/20",
    textColor: "text-zinc-700 dark:text-zinc-300",
    borderColor: "border-zinc-200 dark:border-zinc-800",
    dotColor: "bg-zinc-400",
    icon: "Package",
    chartColor: "#71717a",
  },
};

export function normalizeCategory(cat: string | null | undefined): ExpenseCategory {
  if (!cat) return "Other";
  const trimmed = cat.trim();
  const match = ALL_CATEGORIES.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase()
  );
  if (match) return match;

  const lower = trimmed.toLowerCase();
  if (lower.includes("beer") || lower.includes("wine") || lower.includes("vodka") || lower.includes("whiskey") || lower.includes("liquor") || lower.includes("alcohol") || lower.includes("cider") || lower.includes("cocktail")) {
    return "Alcohol";
  }
  if (lower.includes("drink") || lower.includes("beverage") || lower.includes("coffee") || lower.includes("tea") || lower.includes("water") || lower.includes("juice") || lower.includes("soda") || lower.includes("cola")) {
    return "Drinks";
  }
  if (lower.includes("sweet") || lower.includes("candy") || lower.includes("chocolate") || lower.includes("cake") || lower.includes("cookie") || lower.includes("ice cream") || lower.includes("snack") || lower.includes("donut") || lower.includes("pastry")) {
    return "Sweets";
  }
  if (lower.includes("prepared") || lower.includes("meal") || lower.includes("bento") || lower.includes("sandwich") || lower.includes("burger") || lower.includes("pizza") || lower.includes("takeout") || lower.includes("restaurant") || lower.includes("deli") || lower.includes("salad bar") || lower.includes("lunch")) {
    return "Prepared Meals";
  }
  if (lower.includes("ingredient") || lower.includes("vegetable") || lower.includes("meat") || lower.includes("fruit") || lower.includes("produce") || lower.includes("dairy") || lower.includes("milk") || lower.includes("egg") || lower.includes("cheese") || lower.includes("oil") || lower.includes("spice") || lower.includes("onion") || lower.includes("beef") || lower.includes("chicken") || lower.includes("pork") || lower.includes("fish")) {
    return "Food Ingredients";
  }
  if (lower.includes("house") || lower.includes("clean") || lower.includes("paper") || lower.includes("soap") || lower.includes("detergent") || lower.includes("towel") || lower.includes("tissue") || lower.includes("shampoo") || lower.includes("hygiene") || lower.includes("battery") || lower.includes("trash")) {
    return "Household";
  }

  return "Other";
}
