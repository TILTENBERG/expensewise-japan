import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ALL_CATEGORIES, normalizeCategory } from "@/lib/categories";
import { ExpenseCategory, MonthlyAnalytics } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam =
      searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM
    const budgetParam = parseFloat(searchParams.get("budget") || "100000");

    const [year, month] = monthParam.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));

    const receipts = await prisma.receipt.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        items: true,
      },
    });

    let totalSpent = 0;
    let itemCount = 0;
    const categoryTotals: Record<ExpenseCategory, number> = {
      Alcohol: 0,
      Drinks: 0,
      "Food Ingredients": 0,
      Sweets: 0,
      "Prepared Meals": 0,
      Household: 0,
      Other: 0,
    };
    const categoryCounts: Record<ExpenseCategory, number> = {
      Alcohol: 0,
      Drinks: 0,
      "Food Ingredients": 0,
      Sweets: 0,
      "Prepared Meals": 0,
      Household: 0,
      Other: 0,
    };

    const dailySpendingMap: Record<string, number> = {};

    receipts.forEach((receipt) => {
      totalSpent += receipt.total_amount;
      const dayKey = receipt.date.toISOString().slice(0, 10);
      dailySpendingMap[dayKey] = (dailySpendingMap[dayKey] || 0) + receipt.total_amount;

      receipt.items.forEach((item) => {
        itemCount += 1;
        const cat = normalizeCategory(item.category);
        const itemSubtotal = item.price * (item.quantity || 1);
        categoryTotals[cat] += itemSubtotal;
        categoryCounts[cat] += 1;
      });
    });

    totalSpent = Math.round(totalSpent * 100) / 100;

    let highestDay: { date: string; amount: number } | null = null;
    Object.entries(dailySpendingMap).forEach(([d, amt]) => {
      if (!highestDay || amt > highestDay.amount) {
        highestDay = { date: d, amount: Math.round(amt * 100) / 100 };
      }
    });

    const categoryBreakdown = ALL_CATEGORIES.map((cat) => {
      const catTotal = Math.round(categoryTotals[cat] * 100) / 100;
      const percentage =
        totalSpent > 0 ? Math.round((catTotal / totalSpent) * 1000) / 10 : 0;
      return {
        category: cat,
        total: catTotal,
        count: categoryCounts[cat],
        percentage,
      };
    }).sort((a, b) => b.total - a.total);

    // Days in this month
    const daysInMonth = new Date(year, month, 0).getDate();
    const averageDailySpend =
      daysInMonth > 0 ? Math.round((totalSpent / daysInMonth) * 100) / 100 : 0;

    const analytics: MonthlyAnalytics = {
      month: monthParam,
      totalSpent,
      budget: budgetParam,
      receiptCount: receipts.length,
      itemCount,
      categoryBreakdown,
      highestDay,
      averageDailySpend,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Failed to compute analytics:", error);
    return NextResponse.json(
      { error: "Failed to compute analytics" },
      { status: 500 }
    );
  }
}
