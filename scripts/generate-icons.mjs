import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), "public", "icons");
mkdirSync(outputDir, { recursive: true });

for (const [name, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["maskable-512.png", 512]
]) {
  writeFileSync(join(outputDir, name), createIconPng(size));
}

function createIconPng(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const radius = size * 0.2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const cornerDistance = roundedRectDistance(x, y, size, radius);
      const inCorner = cornerDistance <= 0;
      const stripe = x + y > size * 1.08;
      const [r, g, b] = stripe ? [47, 143, 131] : [239, 111, 86];

      pixels[index] = inCorner ? r : 0;
      pixels[index + 1] = inCorner ? g : 0;
      pixels[index + 2] = inCorner ? b : 0;
      pixels[index + 3] = inCorner ? 255 : 0;

      if (inCorner && isOnCheck(x, y, size)) {
        pixels[index] = 255;
        pixels[index + 1] = 250;
        pixels[index + 2] = 240;
        pixels[index + 3] = 255;
      }
    }
  }

  const scanlines = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    scanlines[rowStart] = 0;
    pixels.copy(scanlines, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", Buffer.concat([u32(size), u32(size), Buffer.from([8, 6, 0, 0, 0])])),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function roundedRectDistance(x, y, size, radius) {
  const innerMin = radius;
  const innerMax = size - radius;
  const dx = Math.max(innerMin - x, 0, x - innerMax);
  const dy = Math.max(innerMin - y, 0, y - innerMax);
  return Math.hypot(dx, dy) - radius;
}

function isOnCheck(x, y, size) {
  const a = distanceToSegment(x, y, size * 0.28, size * 0.53, size * 0.45, size * 0.7);
  const b = distanceToSegment(x, y, size * 0.45, size * 0.7, size * 0.75, size * 0.34);
  return Math.min(a, b) < size * 0.055;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
  const x = x1 + t * dx;
  const y = y1 + t * dy;
  return Math.hypot(px - x, py - y);
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  return Buffer.concat([u32(data.length), typeBuffer, data, u32(crc32(Buffer.concat([typeBuffer, data])))]);
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value);
  return buffer;
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ -1) >>> 0;
}
