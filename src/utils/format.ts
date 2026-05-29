// shared.jsx の yen / yenSigned を移植
const group = (n: number) => Math.abs(n).toLocaleString('en-US');

export const yen = (n: number) => '¥' + group(n);
export const yenSigned = (n: number) => (n < 0 ? '-' : '') + '¥' + group(n);

const pad2 = (n: number) => String(n).padStart(2, '0');
export const formatDate = (d: Date) =>
  `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
