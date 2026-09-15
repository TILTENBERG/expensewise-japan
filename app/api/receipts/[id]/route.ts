import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCategory } from "@/lib/categories";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Failed to get receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, merchant_name, total_amount, currency, items } = body;

    const dateObj = date
      ? new Date(date.includes("T") ? date : `${date}T12:00:00.000Z`)
      : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      if (items && Array.isArray(items)) {
        // Remove old items and replace with new
        await tx.expenseItem.deleteMany({
          where: { receipt_id: id },
        });

        await tx.expenseItem.createMany({
          data: items.map(
            (item: {
              name: string;
              price: number;
              quantity?: number;
              category?: string;
            }) => ({
              receipt_id: id,
              name: String(item.name || "Item").trim(),
              price: Math.round((Number(item.price) || 0) * 100) / 100,
              quantity: Number(item.quantity) || 1,
              category: normalizeCategory(item.category),
            })
          ),
        });
      }

      const calculatedTotal =
        typeof total_amount === "number"
          ? total_amount
          : items?.reduce(
              (sum: number, item: { price: number; quantity: number }) =>
                sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
              0
            );

      return await tx.receipt.update({
        where: { id },
        data: {
          ...(dateObj ? { date: dateObj } : {}),
          ...(merchant_name ? { merchant_name: merchant_name.trim() } : {}),
          ...(calculatedTotal !== undefined
            ? { total_amount: Math.round(calculatedTotal * 100) / 100 }
            : {}),
          ...(currency ? { currency } : {}),
        },
        include: { items: true },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update receipt:", error);
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.receipt.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete receipt:", error);
    return NextResponse.json(
      { error: "Failed to delete receipt" },
      { status: 500 }
    );
  }
}
