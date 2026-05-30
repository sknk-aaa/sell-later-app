// 利益計算。金額はマイナー単位の整数（×100）、手数料率は basis points（1000=10%）。
export const DEFAULT_FEE_RATE = 0.1;
export const DEFAULT_FEE_BPS = 1000;

// 手数料 = round(価格 × rateBps / 10000) + 固定費
export function feeAmountBps(price: number, rateBps: number, fixed: number): number {
  return Math.round((price * rateBps) / 10000) + Math.max(0, fixed);
}

// 見込み/実利益 = 価格 − 手数料 − 送料
export function profitBps(price: number, rateBps: number, fixed: number, shipping: number): number {
  return price - feeAmountBps(price, rateBps, fixed) - shipping;
}

// 利益率(%) = 利益 / 価格 * 100
export function profitRate(price: number, profit: number): number {
  if (!price) return 0;
  return (profit / price) * 100;
}
