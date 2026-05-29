// 依存なしのプレースホルダー画像生成（青基調）。本番デザインは後で差し替え。
// 生成: assets/icon.png(1024) / assets/adaptive-icon.png(1024) / assets/splash-icon.png(512)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BLUE = [47, 123, 255, 255]; // #2F7BFF
const WHITE = [255, 255, 255, 255];
const TRANSPARENT = [0, 0, 0, 0];

const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function canvas(size, bg) {
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) buf.set(bg, i * 4);
  return buf;
}
const setPx = (buf, size, x, y, c) => {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  buf.set(c, (y * size + x) * 4);
};
function roundRect(buf, size, x0, y0, w, h, r, c) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const dx = Math.min(x - x0, x0 + w - 1 - x);
      const dy = Math.min(y - y0, y0 + h - 1 - y);
      if (dx < r && dy < r) {
        const ddx = r - dx;
        const ddy = r - dy;
        if (ddx * ddx + ddy * ddy > r * r) continue;
      }
      setPx(buf, size, x, y, c);
    }
  }
}
function circle(buf, size, cx, cy, r, c) {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++)
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) setPx(buf, size, x, y, c);
}

// タグ風モチーフ（白い角丸四角＋穴）
function drawTag(buf, size, color, hole) {
  const s = Math.round(size * 0.5);
  const x = Math.round((size - s) / 2);
  const y = Math.round((size - s) / 2);
  roundRect(buf, size, x, y, s, s, Math.round(s * 0.22), color);
  circle(buf, size, Math.round(x + s * 0.28), Math.round(y + s * 0.28), Math.round(s * 0.08), hole);
}

const outDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });

// icon: 青背景＋白タグ
let icon = canvas(1024, BLUE);
drawTag(icon, 1024, WHITE, BLUE);
fs.writeFileSync(path.join(outDir, 'icon.png'), encodePng(1024, 1024, icon));

// adaptive-icon: 透明＋白タグ（背景色はapp.jsonで指定）
let adaptive = canvas(1024, TRANSPARENT);
drawTag(adaptive, 1024, WHITE, TRANSPARENT);
fs.writeFileSync(path.join(outDir, 'adaptive-icon.png'), encodePng(1024, 1024, adaptive));

// splash-icon: 透明＋青タグ（背景は白）
let splash = canvas(512, TRANSPARENT);
drawTag(splash, 512, BLUE, TRANSPARENT);
fs.writeFileSync(path.join(outDir, 'splash-icon.png'), encodePng(512, 512, splash));

console.log('Generated assets: icon.png, adaptive-icon.png, splash-icon.png');
