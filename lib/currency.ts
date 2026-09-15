export function formatCurrency(amount: number, currency: string = "¥"): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString("ja-JP");
  return `${currency}${formatted}`;
}
