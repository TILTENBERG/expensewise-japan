export type ExpenseCategory =
  | "Alcohol"
  | "Drinks"
  | "Food Ingredients"
  | "Sweets"
  | "Prepared Meals"
  | "Household"
  | "Other";

export interface ExpenseItemData {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  category: ExpenseCategory;
}

export interface ReceiptData {
  id: string;
  date: string; // ISO format YYYY-MM-DD or full ISO
  merchant_name: string;
  total_amount: number;
  currency: string;
  raw_image_path?: string | null;
  created_at?: string;
  updated_at?: string;
  items: ExpenseItemData[];
}

export interface ParsedReceiptResponse {
  merchant: string;
  date: string;
  total: number;
  currency?: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    category: ExpenseCategory;
  }[];
  confidence_note?: string;
}

export interface DaySpendingSummary {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  totalSpent: number;
  receiptCount: number;
  itemCount: number;
  categoryTotals: Record<ExpenseCategory, number>;
  categoryCounts: Record<ExpenseCategory, number>;
  topCategories: ExpenseCategory[];
  itemsPreview: {
    name: string;
    price: number;
    category: ExpenseCategory;
  }[];
  receipts: ReceiptData[];
}

export interface MonthlyAnalytics {
  month: string; // YYYY-MM
  totalSpent: number;
  budget: number;
  receiptCount: number;
  itemCount: number;
  categoryBreakdown: {
    category: ExpenseCategory;
    total: number;
    count: number;
    percentage: number;
  }[];
  highestDay: {
    date: string;
    amount: number;
  } | null;
  averageDailySpend: number;
}
