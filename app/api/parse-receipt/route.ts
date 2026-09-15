import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { normalizeCategory } from "@/lib/categories";
import { ParsedReceiptResponse } from "@/lib/types";

export const maxDuration = 60; // Allow sufficient time for multimodal OCR

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", customApiKey } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data is required." },
        { status: 400 }
      );
    }

    const apiKey =
      customApiKey?.trim() ||
      req.headers.get("x-gemini-api-key")?.trim() ||
      process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Google AI Studio API key not found. Please provide an API key in the UI settings or set GEMINI_API_KEY in .env.local.",
          needsApiKey: true,
        },
        { status: 401 }
      );
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    const ai = new GoogleGenAI({ apiKey });

    // Try models in order: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    const prompt = `You are an expert OCR receipt parsing and expense tracking assistant specializing in receipts, including Japanese receipts (convenience stores, supermarkets, restaurants).
Analyze this receipt image thoroughly:
1. Extract the merchant/store name (e.g. 7-Eleven, Lawson, FamilyMart, Life Supermarket, or restaurant name). If not visible, use a sensible name or "Unknown Merchant".
2. Extract the transaction date in YYYY-MM-DD format. If year/month/day is missing, ambiguous, or obscured, use today's date (${new Date().toISOString().slice(0, 10)}). Note Japanese date format often uses YYYY年MM月DD日 or YY/MM/DD.
3. Extract the total receipt amount as a number in Japanese Yen (JPY / ¥). Japanese receipts typically use whole yen integers (e.g., 1280).
4. Extract every single line item with:
   - name: clear product name
   - price: line price or unit price as a number in Yen (¥)
   - quantity: number of items purchased (e.g. 1, 2)
   - category: strictly classify each item into one of the following exact categories:
     * "Alcohol": Beer (ビール), chuhai (チューハイ), sake (日本酒), wine, highball, whiskey, shochu.
     * "Drinks": Green tea (お茶), water, coffee (コーヒー), juice, soda, energy drinks, milk.
     * "Food Ingredients": Fresh vegetables, fruits, raw meats, tofu, eggs, cooking sauces, rice, noodles, bread.
     * "Sweets": Candies, chocolates, ice cream, pastries, cookies, dango, wagashi, snacks, chips.
     * "Prepared Meals": Bento (お弁当), onigiri (おにぎり), sandwiches, hot snack counter items (karaage, yakitori), restaurant meals, ramen.
     * "Household": Cleaning supplies, tissues, paper towels, bath amenities, batteries, detergent.
     * "Other": Anything not in the above categories.

Currency is Japanese Yen (¥ / JPY).
Return valid JSON conforming to the requested schema.`;

    let rawText = "";
    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            prompt,
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                merchant: { type: Type.STRING },
                date: { type: Type.STRING, description: "YYYY-MM-DD" },
                total: { type: Type.NUMBER },
                currency: { type: Type.STRING, description: "Currency symbol or ISO code, e.g. USD, EUR, $" },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      price: { type: Type.NUMBER },
                      quantity: { type: Type.NUMBER },
                      category: {
                        type: Type.STRING,
                        enum: [
                          "Alcohol",
                          "Drinks",
                          "Food Ingredients",
                          "Sweets",
                          "Prepared Meals",
                          "Household",
                          "Other",
                        ],
                      },
                    },
                    required: ["name", "price", "quantity", "category"],
                  },
                },
              },
              required: ["merchant", "date", "total", "items"],
            },
          },
        });

        if (response && response.text) {
          rawText = response.text;
          break;
        }
      } catch (err: unknown) {
        lastError = err as Error;
        console.warn(`Model ${modelName} failed, trying fallback...`, (err as Error).message);
      }
    }

    if (!rawText) {
      throw new Error(
        lastError?.message || "Failed to parse receipt image with Gemini AI."
      );
    }

    // Clean markdown code fence if present
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate and sanitize data
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr =
      typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
        ? parsed.date
        : todayStr;

    const items = Array.isArray(parsed.items)
      ? parsed.items.map((item: { name?: string; price?: number; quantity?: number; category?: string }) => ({
          name: String(item.name || "Item").trim(),
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          category: normalizeCategory(item.category),
        }))
      : [];

    let total = Number(parsed.total) || 0;
    // If total is 0 or missing, sum up the items
    if (total <= 0 && items.length > 0) {
      total = items.reduce(
        (acc: number, item: { price: number; quantity: number }) =>
          acc + item.price * (item.quantity || 1),
        0
      );
      total = Math.round(total * 100) / 100;
    }

    const result: ParsedReceiptResponse = {
      merchant: parsed.merchant?.trim() || "Scanned Receipt",
      date: dateStr,
      total: Math.round(total * 100) / 100,
      currency: parsed.currency || "¥",
      items,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Receipt parsing error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred while parsing the receipt.";
    return NextResponse.json(
      {
        error: message,
        details: "Check if the image is readable and if your Google AI Studio API key has Gemini API access enabled.",
      },
      { status: 500 }
    );
  }
}
