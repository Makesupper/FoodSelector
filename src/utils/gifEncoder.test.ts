import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeRgbaFramesToGif, formatByteSize } from './gifEncoder';

function createSolidFrame(width: number, height: number, r: number, g: number, b: number, delayMs: number) {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { data, width, height, delayMs };
}

test('encodeRgbaFramesToGif produces a valid GIF89a binary with trailer byte', () => {
  const frames = [
    createSolidFrame(16, 16, 194, 59, 34, 120),
    createSolidFrame(16, 16, 45, 106, 84, 120),
    createSolidFrame(16, 16, 43, 76, 126, 120),
  ];

  const bytes = encodeRgbaFramesToGif(frames);
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.length > 50);

  // GIF89a magic header: 'G' 'I' 'F' '8' '9' 'a'
  const header = String.fromCharCode(...bytes.slice(0, 6));
  assert.equal(header, 'GIF89a');
  // GIF trailer byte is 0x3B
  assert.equal(bytes[bytes.length - 1], 0x3b);
});

test('encodeRgbaFramesToGif throws when no frames are provided', () => {
  assert.throws(() => encodeRgbaFramesToGif([]), /至少需要选择/);
});

test('formatByteSize formats B, KB, and MB cleanly', () => {
  assert.equal(formatByteSize(512), '512 B');
  assert.equal(formatByteSize(2048), '2.0 KB');
  assert.equal(formatByteSize(1572864), '1.50 MB');
});
