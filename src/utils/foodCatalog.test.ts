import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILTIN_FOODS, DEFAULT_SELECTED_IDS, PROVINCES } from '../data/chinaFoods';
import {
  createCustomFoodItem,
  filterFoods,
  groupFoodsByProvince,
  pickRandomIds,
  shuffleList,
  validateCustomFoodDraft,
} from './foodCatalog';

test('catalog covers all 34 Chinese provincial-level regions plus 3 fast food brands with 3 items each', () => {
  assert.equal(PROVINCES.length, 37);
  assert.equal(BUILTIN_FOODS.length, 111);

  const uniqueIds = new Set(BUILTIN_FOODS.map((f) => f.id));
  assert.equal(uniqueIds.size, 111);

  for (const province of PROVINCES) {
    const dishes = BUILTIN_FOODS.filter((f) => f.provinceId === province.id);
    assert.equal(dishes.length, 3, `${province.name} should have 3 dishes`);
    for (const d of dishes) {
      assert.ok(d.name.length > 0);
      assert.ok(d.image.includes('src/assets/dishes/'));
    }
  }

  for (const id of DEFAULT_SELECTED_IDS) {
    assert.ok(uniqueIds.has(id), `default selected id ${id} must exist`);
  }
});

test('filterFoods filters accurately by region and search keyword', () => {
  const southwest = filterFoods(BUILTIN_FOODS, 'southwest', '');
  assert.equal(southwest.length, 15); // 5 provinces * 3

  const fastfood = filterFoods(BUILTIN_FOODS, 'fastfood', '');
  assert.equal(fastfood.length, 9); // 3 brands * 3

  const luosifen = filterFoods(BUILTIN_FOODS, 'all', '螺蛳粉');
  assert.equal(luosifen.length, 1);
  assert.equal(luosifen[0].provinceName, '广西');

  const sichuanSearch = filterFoods(BUILTIN_FOODS, 'all', '四川');
  assert.equal(sichuanSearch.length, 3);

  const mcdSearch = filterFoods(BUILTIN_FOODS, 'all', '麦当劳');
  assert.equal(mcdSearch.length, 3);

  const whopperSearch = filterFoods(BUILTIN_FOODS, 'fastfood', '皇堡');
  assert.equal(whopperSearch.length, 1);
  assert.equal(whopperSearch[0].provinceName, '汉堡王');
});

test('groupFoodsByProvince preserves province grouping and places custom first', () => {
  const customDish = createCustomFoodItem(
    { name: '番茄炒蛋', provinceId: 'custom', note: '家常下饭菜' },
    1000
  );
  const groups = groupFoodsByProvince([customDish, ...BUILTIN_FOODS]);
  assert.equal(groups.length, 38);
  assert.equal(groups[0].provinceId, 'custom');
  assert.equal(groups[1].provinceId, 'beijing');
  assert.equal(groups[1].items.length, 3);
  assert.equal(groups[groups.length - 1].provinceId, 'burgerking');
});

test('validateCustomFoodDraft rejects empty names and accepts valid drafts', () => {
  assert.equal(validateCustomFoodDraft({ name: '   ', provinceId: 'custom' }).valid, false);
  assert.equal(
    validateCustomFoodDraft({ name: '一二三四五六七八九十一二三四五六七八九十一', provinceId: 'custom' }).valid,
    false
  );
  assert.equal(
    validateCustomFoodDraft({ name: '黄焖鸡米饭', provinceId: 'shandong', image: 'ftp://bad.url' }).valid,
    false
  );
  assert.equal(
    validateCustomFoodDraft({ name: '黄焖鸡米饭', provinceId: 'shandong' }).valid,
    true
  );
});

test('pickRandomIds and shuffleList produce deterministic results with custom rng', () => {
  let seed = 42;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const picked = pickRandomIds(BUILTIN_FOODS, 8, rng);
  assert.equal(picked.length, 8);
  assert.equal(new Set(picked).size, 8);

  const orig = [1, 2, 3, 4, 5];
  const shuffled = shuffleList(orig, rng);
  assert.equal(shuffled.length, 5);
  assert.deepEqual([...shuffled].sort(), orig);
});
