import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month") || new Date().toISOString().slice(0, 7); // e.g. "2026-09"
    const [yearStr, monthStr] = monthParam.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    const demoReceipts = [
      {
        day: 2,
        merchant_name: "Life Supermarket (ライフ)",
        total_amount: 5480,
        currency: "¥",
        items: [
          { name: "Japanese Wagyu Beef Slice", price: 1680, quantity: 1, category: "Food Ingredients" },
          { name: "Organic Tofu 3-Pack", price: 198, quantity: 1, category: "Food Ingredients" },
          { name: "Shimeji Mushrooms & Spinach", price: 298, quantity: 1, category: "Food Ingredients" },
          { name: "Farm Fresh Eggs (10pk)", price: 328, quantity: 1, category: "Food Ingredients" },
          { name: "Kikkoman Soy Sauce 1L", price: 418, quantity: 1, category: "Food Ingredients" },
          { name: "Hakutsuru Junmai Sake 720ml", price: 1180, quantity: 1, category: "Alcohol" },
          { name: "Matcha KitKat Share Bag", price: 480, quantity: 1, category: "Sweets" },
          { name: "Kitchen Paper Towels (4 rolls)", price: 420, quantity: 1, category: "Household" },
          { name: "Shopping Bag Fee", price: 5, quantity: 1, category: "Other" },
        ],
      },
      {
        day: 5,
        merchant_name: "Lawson Convenience Store",
        total_amount: 1250,
        currency: "¥",
        items: [
          { name: "Karaage-kun Red (Spicy Fried Chicken)", price: 260, quantity: 1, category: "Prepared Meals" },
          { name: "Uchi Café Premium Roll Cake", price: 227, quantity: 1, category: "Sweets" },
          { name: "Suntory Premium Malts Beer (350ml)", price: 265, quantity: 1, category: "Alcohol" },
          { name: "Craft Boss Black Coffee (500ml)", price: 173, quantity: 1, category: "Drinks" },
          { name: "Salmon Roe Onigiri", price: 198, quantity: 1, category: "Prepared Meals" },
          { name: "Plastic Fork & Bag", price: 3, quantity: 1, category: "Other" },
        ],
      },
      {
        day: 8,
        merchant_name: "7-Eleven Japan",
        total_amount: 2180,
        currency: "¥",
        items: [
          { name: "Special Beef Bento (特製牛焼肉弁当)", price: 698, quantity: 1, category: "Prepared Meals" },
          { name: "Seven Cafe Iced Latte (Large)", price: 300, quantity: 1, category: "Drinks" },
          { name: "Ayataka Green Tea (600ml)", price: 160, quantity: 1, category: "Drinks" },
          { name: "Chou-a-la-creme Custard Puff", price: 178, quantity: 1, category: "Sweets" },
          { name: "Strong Zero Double Lemon (500ml)", price: 220, quantity: 1, category: "Alcohol" },
          { name: "Pocket Tissue (4-Pack)", price: 140, quantity: 1, category: "Household" },
          { name: "Almond Chocolate Box", price: 280, quantity: 1, category: "Sweets" },
        ],
      },
      {
        day: 11,
        merchant_name: "Ichiran Ramen Shinjuku",
        total_amount: 1980,
        currency: "¥",
        items: [
          { name: "Natural Tonkotsu Ramen", price: 980, quantity: 1, category: "Prepared Meals" },
          { name: "Kae-Dama (Extra Noodles)", price: 210, quantity: 1, category: "Prepared Meals" },
          { name: "Soft-Boiled Seasoned Egg", price: 140, quantity: 1, category: "Food Ingredients" },
          { name: "Asahi Super Dry Draft Beer", price: 650, quantity: 1, category: "Alcohol" },
        ],
      },
      {
        day: 14,
        merchant_name: "Don Quijote (ドン・キホーテ)",
        total_amount: 8960,
        currency: "¥",
        items: [
          { name: "Attack Zero Laundry Detergent (Refill)", price: 1280, quantity: 1, category: "Household" },
          { name: "Softymo Cleansing Oil Foam", price: 798, quantity: 1, category: "Household" },
          { name: "Yamazaki 12yr Highball Can (2pk)", price: 1320, quantity: 1, category: "Alcohol" },
          { name: "Suntory Roppongi Gin", price: 2480, quantity: 1, category: "Alcohol" },
          { name: "Tokyo Banana Gift Box", price: 1200, quantity: 1, category: "Sweets" },
          { name: "Pocky Luxury Chocolate", price: 380, quantity: 2, category: "Sweets" },
          { name: "Pocari Sweat Powder (5pk)", price: 420, quantity: 1, category: "Drinks" },
        ],
      },
      {
        day: 16,
        merchant_name: "FamilyMart",
        total_amount: 1420,
        currency: "¥",
        items: [
          { name: "Famichiki Crispy Fried Chicken", price: 230, quantity: 2, category: "Prepared Meals" },
          { name: "Tuna Mayo Onigiri", price: 140, quantity: 2, category: "Prepared Meals" },
          { name: "Suntory Gin Soda Can", price: 198, quantity: 1, category: "Alcohol" },
          { name: "Famima Sweets Soufflé Pudding", price: 298, quantity: 1, category: "Sweets" },
          { name: "Wet Wipes Antibacterial", price: 184, quantity: 1, category: "Household" },
        ],
      },
      {
        day: 20,
        merchant_name: "Torikizoku Izakaya (鳥貴族)",
        total_amount: 3700,
        currency: "¥",
        items: [
          { name: "Momo Kizoku Yakitori Skewers (Tare)", price: 370, quantity: 2, category: "Prepared Meals" },
          { name: "Toriki Fried Chicken Karaage", price: 370, quantity: 1, category: "Prepared Meals" },
          { name: "Camembert Cheese Croquette", price: 370, quantity: 1, category: "Prepared Meals" },
          { name: "Megamori Cabbage with Sesame Oil", price: 370, quantity: 1, category: "Food Ingredients" },
          { name: "The Premium Malt's Draft Beer", price: 370, quantity: 3, category: "Alcohol" },
          { name: "Mega Kaku Highball", price: 370, quantity: 2, category: "Alcohol" },
        ],
      },
    ];

    for (const rec of demoReceipts) {
      const dateStr = `${year}-${pad(month)}-${pad(rec.day)}T12:00:00.000Z`;
      const created = await prisma.receipt.create({
        data: {
          date: new Date(dateStr),
          merchant_name: rec.merchant_name,
          total_amount: rec.total_amount,
          currency: rec.currency,
        },
      });

      await prisma.expenseItem.createMany({
        data: rec.items.map((it) => ({
          receipt_id: created.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          category: it.category,
        })),
      });
    }

    return NextResponse.json({
      message: `Seeded ${demoReceipts.length} realistic receipts for ${monthParam}!`,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 });
  }
}
