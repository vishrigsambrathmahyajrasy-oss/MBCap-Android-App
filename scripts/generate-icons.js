import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG generator for standard PWA icons
function createPNG(width, height, r, g, b, innerR, innerG, innerB) {
  const bytesPerPixel = 4;
  const rowBytes = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter byte

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      
      // Determine if pixel is in central logo area
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold/Emerald circle or background
      if (dist < width * 0.38 && dist > width * 0.32) {
        rawData[pixelOffset] = 0xF5;     // Gold R
        rawData[pixelOffset + 1] = 0xB3; // Gold G
        rawData[pixelOffset + 2] = 0x1B; // Gold B
        rawData[pixelOffset + 3] = 0xFF; // A
      } else if (dist < width * 0.32) {
        rawData[pixelOffset] = innerR;
        rawData[pixelOffset + 1] = innerG;
        rawData[pixelOffset + 2] = innerB;
        rawData[pixelOffset + 3] = 0xFF;
      } else {
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
        rawData[pixelOffset + 3] = 0xFF;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// 1. 192x192 icon
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, 7, 9, 14, 20, 27, 43));
// 2. 512x512 icon
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, 7, 9, 14, 20, 27, 43));
// 3. 512x512 maskable (with 15% safe padding)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 7, 9, 14, 245, 179, 27));
// 4. Apple touch icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, 7, 9, 14, 46, 230, 166));

console.log('PWA PNG icons generated successfully in public/');
