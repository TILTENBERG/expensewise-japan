"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  DollarSign,
  Calendar,
  Store,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { ALL_CATEGORIES, CATEGORY_METADATA } from "@/lib/categories";
import { ExpenseCategory, ExpenseItemData, ParsedReceiptResponse } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptSaved: () => void;
  apiKey: string;
  onOpenApiKeyModal: () => void;
}

export function ReceiptScannerModal({
  isOpen,
  onClose,
  onReceiptSaved,
  apiKey,
  onOpenApiKeyModal,
}: ReceiptScannerModalProps) {
  // Step 1: Upload, Step 2: Scanning, Step 3: Verification
  const [step, setStep] = useState<"upload" | "scanning" | "verify">("upload");

  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Verification Form State
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState("");
  const [total, setTotal] = useState<number>(0);
  const [currency, setCurrency] = useState("¥");
  const [items, setItems] = useState<ExpenseItemData[]>([]);

  // Status & errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setErrorMsg("Please upload a valid image (PNG, JPG, WEBP) or PDF receipt.");
      return;
    }

    setErrorMsg(null);
    setMimeType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartScan = async () => {
    if (!imagePreview) return;

    setStep("scanning");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/parse-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType,
          customApiKey: apiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsApiKey) {
          setErrorMsg(
            "Gemini API key required. Please click 'Set API Key' below to enter your free Google AI Studio key."
          );
        } else {
          setErrorMsg(data.error || "Failed to parse receipt. Please verify image clarity.");
        }
        setStep("upload");
        return;
      }

      // Populate verification screen
      const parsed: ParsedReceiptResponse = data;
      setMerchant(parsed.merchant || "Scanned Store");
      setDate(parsed.date || new Date().toISOString().slice(0, 10));
      setCurrency(parsed.currency || "¥");
      setTotal(parsed.total || 0);
      setItems(
        parsed.items.map((it) => ({
          name: it.name,
          price: it.price,
          quantity: it.quantity || 1,
          category: it.category,
        }))
      );

      setStep("verify");
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("Network error communicating with the parsing service.");
      setStep("upload");
    }
  };

  // Item verification handlers
  const handleItemChange = (
    index: number,
    field: keyof ExpenseItemData,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: "New Item",
        price: 0,
        quantity: 1,
        category: "Other",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Reconcile total with sum of items
  const itemsSum = items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );
  const roundedItemsSum = Math.round(itemsSum * 100) / 100;
  const isTotalMismatched = Math.abs(total - roundedItemsSum) > 0.05;

  const handleCommitToDatabase = async () => {
    if (!merchant.trim()) {
      setErrorMsg("Merchant name cannot be empty.");
      return;
    }
    if (!date) {
      setErrorMsg("Please provide a valid date.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_name: merchant,
          date,
          total_amount: Number(total) || roundedItemsSum,
          currency,
          raw_image_path: imagePreview?.length && imagePreview.length < 300000 ? imagePreview : null,
          items,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save receipt to database.");
      }

      onReceiptSaved();
      handleClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStep("upload");
    setImagePreview(null);
    setErrorMsg(null);
    setMerchant("");
    setDate("");
    setTotal(0);
    setItems([]);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {step === "verify" ? "Verify Scanned Receipt" : "AI Receipt Scanner"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === "verify"
                  ? "Review and customize parsed items before saving to your calendar."
                  : "Upload a receipt photo to automatically extract items, costs, and categories."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 flex items-start gap-3 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-700 dark:text-rose-200">{errorMsg}</p>
                {errorMsg.includes("API key") && (
                  <button
                    onClick={onOpenApiKeyModal}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                  >
                    Configure Gemini API Key
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: UPLOAD DROPZONE */}
          {step === "upload" && (
            <div className="space-y-6">
              {!imagePreview ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragOver
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                      : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100/80 dark:hover:bg-slate-900/60"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  {/* Native Android Camera Input */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <p className="text-base font-semibold text-slate-800 dark:text-white">
                    Drag and drop your receipt here, or{" "}
                    <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Supports PNG, JPG, WEBP, or Japanese paper receipt captures
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Or snap with Android phone camera:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all"
                    >
                      <Camera className="h-4 w-4" /> Camera Snap
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 max-h-80 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Receipt Preview"
                      className="max-h-80 object-contain mx-auto"
                    />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-xl backdrop-blur-sm transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Choose a different photo
                    </button>

                    <button
                      onClick={handleStartScan}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Parse Receipt with Gemini AI</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SCANNING STATE */}
          {step === "scanning" && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
                  <Sparkles className="h-10 w-10 text-white animate-spin" style={{ animationDuration: "6s" }} />
                </div>
                <div className="absolute -inset-2 rounded-3xl border border-indigo-500/40 animate-ping" style={{ animationDuration: "2s" }} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyzing Receipt Image...</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Google Gemini 2.5 is extracting merchant details, itemized lines, prices, and deterministically categorizing each purchase.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 px-3 py-1.5 rounded-full font-medium">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Multimodal JSON Schema Decoding</span>
              </div>
            </div>
          )}

          {/* STEP 3: EDITABLE VERIFICATION SCREEN */}
          {step === "verify" && (
            <div className="space-y-6">
              {/* Top metadata grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Store / Merchant
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Receipt Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Total Amount ({currency})
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="number"
                      step="1"
                      value={total}
                      onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono font-bold shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Items Sum vs Total
                  </label>
                  <div className="text-xs py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400">Sum of items:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(roundedItemsSum, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Mismatch Reconciliation Banner */}
              {isTotalMismatched && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      The sum of items ({formatCurrency(roundedItemsSum, currency)}) differs from the receipt total ({formatCurrency(total, currency)}).
                    </span>
                  </div>
                  <button
                    onClick={() => setTotal(roundedItemsSum)}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 text-[11px] font-semibold whitespace-nowrap transition-colors"
                  >
                    Match Total to Items ({formatCurrency(roundedItemsSum, currency)})
                  </button>
                </div>
              )}

              {/* Items List Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Parsed Line Items ({items.length})
                  </h4>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="grid grid-cols-12 gap-2 p-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/60">
                    <div className="col-span-5">Item Name</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2 text-right">Price ({currency})</div>
                    <div className="col-span-1 text-center">Del</div>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-white/5 max-h-64 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-slate-100/60 dark:hover:bg-white/[0.02] text-xs"
                      >
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(idx, "name", e.target.value)
                            }
                            className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                          />
                        </div>

                        <div className="col-span-3">
                          <select
                            value={item.category}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "category",
                                e.target.value as ExpenseCategory
                              )
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-sm"
                          >
                            {ALL_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1">
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "quantity",
                                parseFloat(e.target.value) || 1
                              )
                            }
                            className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded px-1.5 py-1 text-xs text-center text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                          />
                        </div>

                        <div className="col-span-2">
                          <input
                            type="number"
                            step="1"
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded px-2 py-1 text-xs text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                          />
                        </div>

                        <div className="col-span-1 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          {step === "verify" ? (
            <>
              <button
                onClick={() => setStep("upload")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Image
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitToDatabase}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/30 transition-all"
                >
                  {isSaving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{isSaving ? "Saving..." : "Commit to Calendar"}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
