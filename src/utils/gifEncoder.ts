import * as gifencMod from 'gifenc';
import { COVER_TONES } from '../data/chinaFoods';
import type { FoodItem, GifOptions, GifThemeId } from '../types/food';

const gifencApi = (
  typeof gifencMod.GIFEncoder === 'function' ? gifencMod : gifencMod.default
) as typeof gifencMod;
const { GIFEncoder, applyPalette, quantize } = gifencApi;

export interface RgbaFrame {
  data: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
  delayMs: number;
}

export interface GifThemePalette {
  id: GifThemeId;
  label: string;
  bg: string;
  headerBg: string;
  headerText: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
  dishTitle: string;
  provinceText: string;
  footerText: string;
  indexText: string;
}

export const GIF_THEMES: Record<GifThemeId, GifThemePalette> = {
  porcelain: {
    id: 'porcelain',
    label: '素雅宣纸',
    bg: '#FAF8F4',
    headerBg: '#FAF8F4',
    headerText: '#1C1917',
    accent: '#C23B22',
    cardBg: '#FFFFFF',
    cardBorder: '#E5E0D8',
    dishTitle: '#1C1917',
    provinceText: '#78716C',
    footerText: '#78716C',
    indexText: '#A8A29E',
  },
  midnight: {
    id: 'midnight',
    label: '深夜食堂',
    bg: '#181615',
    headerBg: '#181615',
    headerText: '#FAF8F4',
    accent: '#E05A3E',
    cardBg: '#24211F',
    cardBorder: '#383330',
    dishTitle: '#FAF8F4',
    provinceText: '#B8B0A7',
    footerText: '#9C948A',
    indexText: '#78716C',
  },
  vermilion: {
    id: 'vermilion',
    label: '朱砂食帖',
    bg: '#B8331D',
    headerBg: '#B8331D',
    headerText: '#FFFDF8',
    accent: '#F6D38C',
    cardBg: '#FFFDF8',
    cardBorder: '#F3D8B6',
    dishTitle: '#FFFDF8',
    provinceText: '#FCE3D4',
    footerText: '#F8D4C4',
    indexText: '#F7C7B4',
  },
};

export const DEFAULT_GIF_OPTIONS: GifOptions = {
  title: '今天吃什么选择器',
  subtitle: '截图决定今天吃什么',
  delayMs: 120,
  theme: 'porcelain',
  showProvince: true,
  width: 480,
  height: 580,
};

/**
 * Pure GIF binary encoder using gifenc. Testable directly in Node.js without DOM/Canvas.
 */
export function encodeRgbaFramesToGif(frames: RgbaFrame[]): Uint8Array {
  if (frames.length === 0) {
    throw new Error('至少需要选择 1 道食物才能生成 GIF');
  }

  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const delay = Math.max(20, Math.round(frame.delayMs));
    const palette = quantize(frame.data, 256, { format: 'rgb565' });
    const index = applyPalette(frame.data, palette, 'rgb565');
    gif.writeFrame(index, frame.width, frame.height, {
      palette,
      delay,
      repeat: i === 0 ? 0 : undefined,
    });
  }

  gif.finish();
  return gif.bytes();
}

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawFallbackCover(
  ctx: CanvasRenderingContext2D,
  dish: FoodItem,
  x: number,
  y: number,
  size: number
) {
  const tone = COVER_TONES[dish.coverTone ?? 'vermilion'] ?? COVER_TONES.vermilion;
  ctx.fillStyle = tone.bg;
  ctx.fillRect(x, y, size, size);

  // Subtle decorative inner frame
  ctx.strokeStyle = tone.accent;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 18, y + 18, size - 36, size - 36);
  ctx.globalAlpha = 1;

  // Center Chinese dish name typography
  ctx.fillStyle = tone.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = dish.name.length <= 4 ? 54 : dish.name.length <= 6 ? 42 : 34;
  ctx.font = `700 ${fontSize}px "Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif`;
  ctx.fillText(dish.name, x + size / 2, y + size / 2 - 8, size - 64);

  ctx.fillStyle = tone.sub;
  ctx.font = `500 18px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.fillText(dish.provinceName, x + size / 2, y + size / 2 + 46, size - 64);
}

/**
 * Renders one complete "今天吃什么选择器" card frame onto a 2D canvas.
 */
export function drawDishFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  dish: FoodItem,
  imageElement: HTMLImageElement | null,
  options: GifOptions,
  frameIndex: number,
  totalFrames: number
): void {
  const { width, height } = options;
  const theme = GIF_THEMES[options.theme] ?? GIF_THEMES.porcelain;
  const titleText = options.title.trim() || '今天吃什么选择器';
  const subtitleText = options.subtitle.trim() || '截图决定今天吃什么';

  // 1. Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Top subtle accent bar
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 0, width, 6);

  // 2. Header Title ("今天吃什么选择器")
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.headerText;
  const headerFontSize = titleText.length <= 10 ? 30 : 24;
  ctx.font = `700 ${headerFontSize}px "Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif`;
  ctx.fillText(titleText, width / 2, 48, width - 48);

  // Subtle divider line under header
  ctx.strokeStyle = theme.cardBorder;
  ctx.globalAlpha = options.theme === 'vermilion' ? 0.35 : 0.8;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 78);
  ctx.lineTo(width - 40, 78);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 3. Center Square Dish Image Frame
  const imgSize = Math.min(width - 80, 360);
  const imgX = Math.round((width - imgSize) / 2);
  const imgY = 96;

  // Outer matte frame
  ctx.save();
  drawRoundedRectPath(ctx, imgX - 6, imgY - 6, imgSize + 12, imgSize + 12, 16);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Clipped square dish photo (object-cover math)
  ctx.save();
  drawRoundedRectPath(ctx, imgX, imgY, imgSize, imgSize, 11);
  ctx.clip();

  if (imageElement && imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
    const sw = imageElement.naturalWidth;
    const sh = imageElement.naturalHeight;
    const side = Math.min(sw, sh);
    const sx = (sw - side) / 2;
    const sy = (sh - side) / 2;
    ctx.drawImage(imageElement, sx, sy, side, side, imgX, imgY, imgSize, imgSize);
  } else {
    drawFallbackCover(ctx, dish, imgX, imgY, imgSize);
  }
  ctx.restore();

  // 4. Dish Name & Province Footer
  const textAreaTop = imgY + imgSize + 18;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Prominent specific food name
  ctx.fillStyle = theme.dishTitle;
  const dishFontSize = dish.name.length <= 6 ? 34 : dish.name.length <= 9 ? 28 : 23;
  ctx.font = `700 ${dishFontSize}px "Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif`;
  ctx.fillText(dish.name, width / 2, textAreaTop + 26, width - 56);

  // Province + subtle prompt line
  const metaY = textAreaTop + 62;
  ctx.font = `500 15px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = theme.provinceText;
  const metaLabel = options.showProvince
    ? `${dish.provinceName} · ${subtitleText}`
    : subtitleText;
  ctx.fillText(metaLabel, width / 2, metaY, width - 56);

  // Clean bottom progress index (e.g. 03 / 08)
  const indexLabel = `${String(frameIndex + 1).padStart(2, '0')} / ${String(totalFrames).padStart(2, '0')}`;
  ctx.fillStyle = theme.indexText;
  ctx.font = `500 12px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillText(indexLabel, width / 2, height - 18);
}

export function loadHtmlImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generates an animated GIF Blob URL for the selected foods.
 */
export async function generateSelectorGif(
  dishes: FoodItem[],
  options: GifOptions,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; bytes: Uint8Array }> {
  if (dishes.length === 0) {
    throw new Error('请先选择至少一道食物');
  }

  // Ensure fonts are settled if supported
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed even if font readiness rejects
    }
  }

  onProgress?.(5);
  const loadedImages = await Promise.all(dishes.map((d) => loadHtmlImage(d.image)));
  onProgress?.(25);

  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('无法初始化画布上下文');
  }

  const gif = GIFEncoder();
  const delay = Math.max(40, Math.round(options.delayMs));

  for (let i = 0; i < dishes.length; i++) {
    drawDishFrameToCanvas(ctx, dishes[i], loadedImages[i], options, i, dishes.length);
    const imageData = ctx.getImageData(0, 0, options.width, options.height);
    const palette = quantize(imageData.data, 256, { format: 'rgb565' });
    const index = applyPalette(imageData.data, palette, 'rgb565');
    gif.writeFrame(index, options.width, options.height, {
      palette,
      delay,
      repeat: i === 0 ? 0 : undefined,
    });

    onProgress?.(25 + Math.round(((i + 1) / dishes.length) * 70));
    // Yield briefly every 4 frames so UI progress stays smooth
    if (i % 4 === 3) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  gif.finish();
  const bytes = gif.bytes();
  onProgress?.(100);

  const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
    type: 'image/gif',
  });
  return { blob, bytes };
}

/**
 * Resizes an uploaded image file to a clean 400x400 square JPEG Data URL
 * so custom dishes persist cleanly in localStorage and render crisply in GIFs.
 */
export function resizeImageFileToSquareDataUrl(file: File, size = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('无法解析该图片文件'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建图片处理画布'));
          return;
        }
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - side) / 2;
        const sy = (img.naturalHeight - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
