// 金額の表示は @/utils/money + @/utils/useCurrency を使う（通貨対応）。
const pad2 = (n: number) => String(n).padStart(2, '0');
export const formatDate = (d: Date) =>
  `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
