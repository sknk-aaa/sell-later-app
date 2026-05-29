// shared.jsx の yen / yenSigned を移植
const group = (n: number) => Math.abs(n).toLocaleString('en-US');

export const yen = (n: number) => '¥' + group(n);
export const yenSigned = (n: number) => (n < 0 ? '-' : '') + '¥' + group(n);
