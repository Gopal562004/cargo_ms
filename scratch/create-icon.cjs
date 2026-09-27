const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

function createPng(width, height, drawPixel) {
  const bytesPerPixel = 4;
  const rawData = Buffer.alloc(height * (1 + width * bytesPerPixel));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunkType = Buffer.from(type, 'ascii');
    const combined = Buffer.concat([chunkType, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, chunkType, data, crc]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance from (px, py) to line segment (x1, y1) -> (x2, y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

// Lucide Package 3D isometric box line segments scaled to 256x256
const segments = [
  // Outer hexagon contour
  [128, 62, 190, 96],
  [190, 96, 190, 164],
  [190, 164, 128, 198],
  [128, 198, 66, 164],
  [66, 164, 66, 96],
  [66, 96, 128, 62],
  // Three interior isometric seams radiating from center (128, 130)
  [128, 130, 190, 96],
  [128, 130, 66, 96],
  [128, 130, 128, 198],
  // Top fold / tape crease
  [97, 79, 159, 113],
];

// Generate 256x256 BrandLogo PNG: Indigo squircle with crisp white 3D Package icon
const pngBuffer = createPng(256, 256, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;

  // Squircle outer boundary (Apple/Windows 11 modern app icon curvature)
  const pad = 18;
  const r = 52;
  const insideX = x >= pad && x <= w - pad;
  const insideY = y >= pad && y <= h - pad;

  let inRounded = false;
  let borderDist = 999;
  if (insideX && insideY) {
    const qx = Math.max(0, Math.abs(x - cx) - (cx - pad - r));
    const qy = Math.max(0, Math.abs(y - cy) - (cy - pad - r));
    const cornerDist = Math.hypot(qx, qy);
    if (cornerDist <= r) {
      inRounded = true;
      borderDist = r - cornerDist;
    }
  }

  if (!inRounded) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }

  // Anti-aliased outer squircle border
  let edgeAlpha = 1.0;
  if (borderDist < 1.5) {
    edgeAlpha = Math.max(0, Math.min(1, borderDist / 1.5));
  }

  // Indigo gradient: #6366f1 at top to #4338ca at bottom
  const t = y / h;
  let bgR = Math.round(99 * (1 - t) + 67 * t);
  let bgG = Math.round(102 * (1 - t) + 56 * t);
  let bgB = Math.round(241 * (1 - t) + 202 * t);

  // Subtle border glow on inner edge
  if (borderDist >= 1.5 && borderDist <= 3.5) {
    bgR = Math.min(255, bgR + 30);
    bgG = Math.min(255, bgG + 30);
    bgB = Math.min(255, bgB + 15);
  }

  // Check distance to any Package icon line segment
  let minLineDist = 999;
  for (const [x1, y1, x2, y2] of segments) {
    const d = distToSegment(x, y, x1, y1, x2, y2);
    if (d < minLineDist) minLineDist = d;
  }

  const strokeRadius = 3.6; // ~7.2px stroke thickness
  if (minLineDist <= strokeRadius + 1.2) {
    // Anti-aliased white line
    let lineAlpha = 1.0;
    if (minLineDist > strokeRadius - 0.5) {
      lineAlpha = Math.max(0, Math.min(1, 1 - (minLineDist - (strokeRadius - 0.5)) / 1.7));
    }
    const finalR = Math.round(255 * lineAlpha + bgR * (1 - lineAlpha));
    const finalG = Math.round(255 * lineAlpha + bgG * (1 - lineAlpha));
    const finalB = Math.round(255 * lineAlpha + bgB * (1 - lineAlpha));
    return [finalR, finalG, finalB, Math.round(255 * edgeAlpha)];
  }

  return [bgR, bgG, bgB, Math.round(255 * edgeAlpha)];
});

// Save icon.png
fs.writeFileSync(path.join(assetsDir, 'icon.png'), pngBuffer);
console.log('✅ Generated assets/icon.png (256x256 BrandLogo)');

// Create Windows .ico file containing the 256x256 PNG
// ICO Format Header (6 bytes) + Directory Entry (16 bytes) + PNG Data
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // Type 1 = Icon
icoHeader.writeUInt16LE(1, 4); // 1 Image

const icoDirEntry = Buffer.alloc(16);
icoDirEntry.writeUInt8(0, 0); // Width: 0 = 256
icoDirEntry.writeUInt8(0, 1); // Height: 0 = 256
icoDirEntry.writeUInt8(0, 2); // Colors: 0 = No palette
icoDirEntry.writeUInt8(0, 3); // Reserved
icoDirEntry.writeUInt16LE(1, 4); // Color planes
icoDirEntry.writeUInt16LE(32, 6); // Bits per pixel
icoDirEntry.writeUInt32LE(pngBuffer.length, 8); // PNG size in bytes
icoDirEntry.writeUInt32LE(22, 12); // Offset = 6 + 16 = 22

const icoBuffer = Buffer.concat([icoHeader, icoDirEntry, pngBuffer]);
fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuffer);
console.log('✅ Generated assets/icon.ico (256x256 Windows Icon)');
