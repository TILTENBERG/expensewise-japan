import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCategory } from "@/lib/categories";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // e.g. "2026-09"
    const categoryParam = searchParams.get("category"); // e.g. "Alcohol"

    let dateFilter = {};
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split("-").map(Number);
      // Start of month: year, month - 1, 1 (UTC)
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      // End of month: year, month, 1 - 1ms
      const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));

      dateFilter = {
        date: {
          gte: startDate,
          lt: endDate,
        },
      };
    }

    const receipts = await prisma.receipt.findMany({
      where: {
        ...dateFilter,
        ...(categoryParam && categoryParam !== "All"
          ? {
              items: {
                some: {
                  category: categoryParam,
                },
              },
            }
          : {}),
      },
      include: {
        items: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(receipts);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Failed to fetch receipts:", err);
    return NextResponse.json(
      { error: "Failed to fetch receipts.", details: err?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      date,
      merchant_name,
      total_amount,
      currency = "¥",
      raw_image_path = null,
      items = [],
    } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required." },
        { status: 400 }
      );
    }

    // Parse date into ISO Date
    // If date is "YYYY-MM-DD", construct noon UTC to prevent timezone day shift
    const dateObj = new Date(
      date.includes("T") ? date : `${date}T12:00:00.000Z`
    );

    const calculatedTotal =
      typeof total_amount === "number" && total_amount > 0
        ? total_amount
        : items.reduce(
            (sum: number, item: { price: number; quantity: number }) =>
              sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
            0
          );

    const receipt = await prisma.$transaction(async (tx) => {
      const createdReceipt = await tx.receipt.create({
        data: {
          date: dateObj,
          merchant_name: merchant_name?.trim() || "Receipt",
          total_amount: Math.round(calculatedTotal * 100) / 100,
          currency: currency || "$",
          raw_image_path: raw_image_path || null,
        },
      });

      if (items.length > 0) {
        await tx.expenseItem.createMany({
          data: items.map(
            (item: {
              name: string;
              price: number;
              quantity?: number;
              category?: string;
            }) => ({
              receipt_id: createdReceipt.id,
              name: String(item.name || "Item").trim(),
              price: Math.round((Number(item.price) || 0) * 100) / 100,
              quantity: Number(item.quantity) || 1,
              category: normalizeCategory(item.category),
            })
          ),
        });
      }

      return await tx.receipt.findUnique({
        where: { id: createdReceipt.id },
        include: { items: true },
      });
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error("Failed to create receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt." },
      { status: 500 }
    );
  }
}
