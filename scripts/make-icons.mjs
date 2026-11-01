// Generates plain PNG icons (amber ring on ink navy) with no dependencies. Run: node scripts/make-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const INK = [0x0a, 0x11, 0x1a];
const AMBER = [0xf2, 0xb1, 0x34];

function crc32(buf) {
  let c,
    crc = 0xffffffff;
  for (const b of buf) {
    c = (crc ^ b) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, scale) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const c = size / 2;
  const outer = c * scale;
  const inner = outer * 0.72;
  const dotR = outer * 0.3;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
      const on = (d <= outer && d >= inner) || d <= dotR;
      const [r, g, b] = on ? AMBER : INK;
      const i = y * (size * 3 + 1) + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
// "any" icons fill the canvas; maskable icons keep the mark inside the central safe zone (80 percent circle).
writeFileSync('public/icon-192.png', png(192, 0.9));
writeFileSync('public/icon-512.png', png(512, 0.9));
writeFileSync('public/icon-maskable-512.png', png(512, 0.6));
writeFileSync('public/apple-touch-icon.png', png(180, 0.8));
