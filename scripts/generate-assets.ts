import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf: Buffer): number {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function createPng(
  width: number,
  height: number,
  pixelFn: (x: number, y: number) => [number, number, number, number]
): Buffer {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawRows: Buffer[] = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(width * 4 + 1);
    row[0] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    rawRows.push(row);
  }

  const idatData = zlib.deflateSync(Buffer.concat(rawRows));
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate og-preview.png (1200x630)
console.log('Generating og-preview.png (1200x630)...');
const ogPng = createPng(1200, 630, (x, y) => {
  // Border frame (12px)
  if (x < 16 || x >= 1184 || y < 16 || y >= 614) {
    return [200, 75, 49, 255]; // Terracotta border
  }
  // Accent top bar (between y=16 and y=24)
  if (y >= 16 && y < 24) {
    return [200, 75, 49, 255];
  }
  // Background: Deep graphite #131312
  return [19, 19, 18, 255];
});
fs.writeFileSync(path.join(publicDir, 'og-preview.png'), ogPng);

// 2. Generate apple-touch-icon.png (180x180)
console.log('Generating apple-touch-icon.png (180x180)...');
const touchIcon = createPng(180, 180, (x, y) => {
  // Rounded corners simulation
  const radius = 32;
  const inCorner =
    (x < radius && y < radius && Math.hypot(x - radius, y - radius) > radius) ||
    (x >= 180 - radius && y < radius && Math.hypot(x - (180 - radius), y - radius) > radius) ||
    (x < radius && y >= 180 - radius && Math.hypot(x - radius, y - (180 - radius)) > radius) ||
    (x >= 180 - radius && y >= 180 - radius && Math.hypot(x - (180 - radius), y - (180 - radius)) > radius);
  if (inCorner) return [0, 0, 0, 0];

  // Terracotta body
  return [200, 75, 49, 255];
});
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), touchIcon);

// 3. Generate favicon.ico (as valid 32x32 PNG container or standard favicon)
console.log('Generating favicon.ico...');
const favicon32 = createPng(32, 32, (x, y) => {
  if (x < 2 || x >= 30 || y < 2 || y >= 30) {
    return [0, 0, 0, 0];
  }
  return [200, 75, 49, 255];
});
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);

console.log('✓ All visual assets successfully generated in public/ directory.');
