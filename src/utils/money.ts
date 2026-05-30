// 金額はDB内では常に「マイナー単位の整数（×100）」で保持する（通貨非依存・固定精度2）。
// 表示/入力時に通貨ごとの小数桁で変換する。為替換算はしない（表示のみ）。

export type CurrencyCode = 'USD' | 'JPY' | 'EUR' | 'GBP' | 'AUD' | 'CAD';
export type CurrencySetting = 'auto' | CurrencyCode;

type CurrencyMeta = { symbol: string; decimals: 0 | 2 };

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { symbol: '$', decimals: 2 },
  JPY: { symbol: '¥', decimals: 0 },
  EUR: { symbol: '€', decimals: 2 },
  GBP: { symbol: '£', decimals: 2 },
  AUD: { symbol: 'A$', decimals: 2 },
  CAD: { symbol: 'C$', decimals: 2 },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export function currencyDecimals(currency: CurrencyCode): number {
  return CURRENCIES[currency].decimals;
}

const addThousands = (intPart: string) => intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// マイナー単位整数 → 表示文字列（記号・桁区切り・小数桁つき）
export function formatMoney(minor: number, currency: CurrencyCode): string {
  const meta = CURRENCIES[currency] ?? CURRENCIES.USD;
  const neg = minor < 0;
  const abs = Math.abs(minor);
  const major = abs / 100;
  const fixed = major.toFixed(meta.decimals); // "12.50" / "1250"
  const [intPart, fracPart] = fixed.split('.');
  const grouped = addThousands(intPart);
  const num = fracPart ? `${grouped}.${fracPart}` : grouped;
  return `${neg ? '-' : ''}${meta.symbol}${num}`;
}

// 入力文字列（major単位）→ マイナー単位整数
export function parseMoney(text: string, currency: CurrencyCode): number {
  const meta = CURRENCIES[currency] ?? CURRENCIES.USD;
  const cleaned = text.replace(/[^0-9.]/g, '');
  const val = Number(cleaned || '0');
  if (!Number.isFinite(val)) return 0;
  if (meta.decimals === 0) return Math.round(val) * 100;
  return Math.round(val * 100);
}

// マイナー単位整数 → 入力欄用のmajor文字列（末尾0は付けない）
export function minorToInput(minor: number, currency: CurrencyCode): string {
  const meta = CURRENCIES[currency] ?? CURRENCIES.USD;
  if (minor === 0) return '';
  if (meta.decimals === 0) return String(Math.round(minor / 100));
  return String(minor / 100);
}

// 入力中テキストのサニタイズ（通貨の小数桁に合わせて数字/小数点を制限）
export function sanitizeMoneyInput(text: string, currency: CurrencyCode): string {
  const meta = CURRENCIES[currency] ?? CURRENCIES.USD;
  if (meta.decimals === 0) return text.replace(/[^0-9]/g, '');
  let s = text.replace(/[^0-9.]/g, '');
  const firstDot = s.indexOf('.');
  if (firstDot !== -1) {
    // 小数点は1つだけ、小数桁はdecimalsまで
    const intPart = s.slice(0, firstDot);
    const fracPart = s.slice(firstDot + 1).replace(/\./g, '').slice(0, meta.decimals);
    s = `${intPart}.${fracPart}`;
  }
  return s;
}

export function symbolOf(currency: CurrencyCode): string {
  return (CURRENCIES[currency] ?? CURRENCIES.USD).symbol;
}
