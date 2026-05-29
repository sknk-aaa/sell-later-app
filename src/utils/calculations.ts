// 設計書3章の利益計算
export const DEFAULT_FEE_RATE = 0.1;

// 見込み利益 = 売価 - 手数料 - 送料
export function expectedProfit(price: number, feeRate: number, shipping: number): number {
  return price - Math.round(price * feeRate) - shipping;
}

// 利益率(%) = 利益 / 売価 * 100
export function profitRate(price: number, profit: number): number {
  if (!price) return 0;
  return (profit / price) * 100;
}

// 実利益 = 実売価 - 手数料 - 実送料
export function actualProfit(price: number, feeRate: number, shipping: number): number {
  return price - Math.round(price * feeRate) - shipping;
}

export const feeAmount = (price: number, feeRate: number): number => Math.round(price * feeRate);
