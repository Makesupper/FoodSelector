import { BUILTIN_FOODS, DEFAULT_SELECTED_IDS, PROVINCES } from '../data/chinaFoods';
import type { CustomCoverTone, FoodItem, ProvinceMeta, RegionKey } from '../types/food';

export const CUSTOM_FOODS_STORAGE_KEY = 'shixuan_custom_foods_v1';
export const SELECTED_IDS_STORAGE_KEY = 'shixuan_selected_ids_v1';

export interface ProvinceGroup {
  provinceId: string;
  provinceName: string;
  regionLabel: string;
  items: FoodItem[];
}

export function filterFoods(
  foods: FoodItem[],
  region: RegionKey,
  query: string
): FoodItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return foods.filter((item) => {
    if (region === 'custom') {
      if (!item.isCustom) return false;
    } else if (region !== 'all') {
      if (item.region !== region) return false;
    }

    if (!normalizedQuery) return true;

    const haystack = `${item.name} ${item.provinceName} ${item.regionLabel} ${item.note ?? ''}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function groupFoodsByProvince(foods: FoodItem[]): ProvinceGroup[] {
  const groupsMap = new Map<string, ProvinceGroup>();

  for (const item of foods) {
    const existing = groupsMap.get(item.provinceId);
    if (existing) {
      existing.items.push(item);
    } else {
      groupsMap.set(item.provinceId, {
        provinceId: item.provinceId,
        provinceName: item.provinceName,
        regionLabel: item.regionLabel,
        items: [item],
      });
    }
  }

  // Keep custom-only province group first if present, then preserve canonical province order
  const provinceOrder = new Map<string, number>(
    PROVINCES.map((p: ProvinceMeta, idx: number) => [p.id, idx])
  );

  return Array.from(groupsMap.values()).sort((a, b) => {
    if (a.provinceId === 'custom') return -1;
    if (b.provinceId === 'custom') return 1;
    const orderA = provinceOrder.get(a.provinceId) ?? 999;
    const orderB = provinceOrder.get(b.provinceId) ?? 999;
    return orderA - orderB;
  });
}

export function shuffleList<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandomIds(
  foods: FoodItem[],
  count: number,
  rng: () => number = Math.random
): string[] {
  if (foods.length === 0 || count <= 0) return [];
  const shuffled = shuffleList(foods, rng);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((f) => f.id);
}

export interface CustomFoodDraft {
  name: string;
  provinceId: string;
  note?: string;
  image?: string;
  coverTone?: CustomCoverTone;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCustomFoodDraft(draft: CustomFoodDraft): ValidationResult {
  const trimmedName = draft.name.trim();
  if (!trimmedName) {
    return { valid: false, error: '请输入食物名称，例如：番茄炒蛋、烤鸭' };
  }
  if (trimmedName.length > 20) {
    return { valid: false, error: '食物名称请控制在 20 个字以内，方便 GIF 清晰展示' };
  }
  if (draft.image && draft.image.trim().length > 0) {
    const img = draft.image.trim();
    const isAllowed =
      img.startsWith('data:image/') ||
      img.startsWith('http://') ||
      img.startsWith('https://') ||
      img.startsWith('/');
    if (!isAllowed) {
      return { valid: false, error: '图片链接格式无效，请上传本地图片或输入 https:// 图片地址' };
    }
  }
  return { valid: true };
}

export function createCustomFoodItem(draft: CustomFoodDraft, now: number = Date.now()): FoodItem {
  const province = PROVINCES.find((p) => p.id === draft.provinceId);
  const id = `custom-${now}-${Math.random().toString(36).slice(2, 7)}`;

  if (province) {
    return {
      id,
      name: draft.name.trim(),
      provinceId: province.id,
      provinceName: province.name,
      region: province.region,
      regionLabel: province.regionLabel,
      image: draft.image?.trim() ?? '',
      note: draft.note?.trim() || '自定义添加',
      isCustom: true,
      coverTone: draft.coverTone ?? 'vermilion',
    };
  }

  return {
    id,
    name: draft.name.trim(),
    provinceId: 'custom',
    provinceName: '自定义',
    region: 'custom',
    regionLabel: '自定义',
    image: draft.image?.trim() ?? '',
    note: draft.note?.trim() || '自定义美食',
    isCustom: true,
    coverTone: draft.coverTone ?? 'vermilion',
  };
}

export function loadStoredCustomFoods(): FoodItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FOODS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FoodItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        item.isCustom === true
    );
  } catch {
    return [];
  }
}

export function saveStoredCustomFoods(items: FoodItem[]): void {
  try {
    localStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota overflow silently
  }
}

export function loadStoredSelectedIds(validIds: Set<string>): string[] {
  try {
    const raw = localStorage.getItem(SELECTED_IDS_STORAGE_KEY);
    if (!raw) return DEFAULT_SELECTED_IDS.filter((id) => validIds.has(id));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_SELECTED_IDS.filter((id) => validIds.has(id));
    const cleaned = parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id));
    return cleaned.length > 0 ? cleaned : DEFAULT_SELECTED_IDS.filter((id) => validIds.has(id));
  } catch {
    return DEFAULT_SELECTED_IDS.filter((id) => validIds.has(id));
  }
}

export function saveStoredSelectedIds(ids: string[]): void {
  try {
    localStorage.setItem(SELECTED_IDS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage error
  }
}

export function getAllBuiltinFoods(): FoodItem[] {
  return BUILTIN_FOODS;
}
