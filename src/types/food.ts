export type RegionKey =
  | 'all'
  | 'north'
  | 'northeast'
  | 'east'
  | 'central'
  | 'south'
  | 'southwest'
  | 'northwest'
  | 'fastfood'
  | 'custom';

export interface RegionInfo {
  key: RegionKey;
  label: string;
}

export interface ProvinceMeta {
  id: string;
  name: string;
  region: Exclude<RegionKey, 'all' | 'custom'>;
  regionLabel: string;
}

export type CustomCoverTone = 'vermilion' | 'ochre' | 'jade' | 'indigo' | 'ink';

export interface FoodItem {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
  region: Exclude<RegionKey, 'all'>;
  regionLabel: string;
  image: string; // URL path (/src/assets/dishes/...jpg), data URL, or '' when using typographic cover
  note?: string;
  isCustom?: boolean;
  coverTone?: CustomCoverTone;
}

export type GifThemeId = 'porcelain' | 'midnight' | 'vermilion';

export interface GifOptions {
  title: string;
  subtitle: string;
  delayMs: number;
  theme: GifThemeId;
  showProvince: boolean;
  width: number;
  height: number;
}

export interface GeneratedGifResult {
  url: string;
  byteLength: number;
  frameCount: number;
  delayMs: number;
  createdAt: number;
}
