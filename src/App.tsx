import { useEffect, useMemo, useState } from 'react';
import { Dice5, Plus, Search, X } from 'lucide-react';
import { AddCustomFoodModal } from './components/AddCustomFoodModal';
import { FoodCard } from './components/FoodCard';
import { GifStudio } from './components/GifStudio';
import { TopHeader } from './components/TopHeader';
import { BUILTIN_FOODS, REGIONS } from './data/chinaFoods';
import type { FoodItem, RegionKey } from './types/food';
import {
  filterFoods,
  groupFoodsByProvince,
  loadStoredCustomFoods,
  loadStoredSelectedIds,
  pickRandomIds,
  saveStoredCustomFoods,
  saveStoredSelectedIds,
  shuffleList,
} from './utils/foodCatalog';

export default function App() {
  const [customFoods, setCustomFoods] = useState<FoodItem[]>(() =>
    loadStoredCustomFoods()
  );

  const allFoods = useMemo(
    () => [...customFoods, ...BUILTIN_FOODS],
    [customFoods]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const initialFoods = [...loadStoredCustomFoods(), ...BUILTIN_FOODS];
    const validIds = new Set(initialFoods.map((f) => f.id));
    return loadStoredSelectedIds(validIds);
  });

  const [activeRegion, setActiveRegion] = useState<RegionKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'studio'>('catalog');

  useEffect(() => {
    saveStoredCustomFoods(customFoods);
  }, [customFoods]);

  useEffect(() => {
    saveStoredSelectedIds(selectedIds);
  }, [selectedIds]);

  const foodMap = useMemo(
    () => new Map<string, FoodItem>(allFoods.map((f) => [f.id, f])),
    [allFoods]
  );

  const selectedIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    selectedIds.forEach((id, idx) => map.set(id, idx));
    return map;
  }, [selectedIds]);

  const selectedFoods = useMemo(
    () =>
      selectedIds
        .map((id) => foodMap.get(id))
        .filter((item): item is FoodItem => Boolean(item)),
    [selectedIds, foodMap]
  );

  const filteredFoods = useMemo(
    () => filterFoods(allFoods, activeRegion, searchQuery),
    [allFoods, activeRegion, searchQuery]
  );

  const provinceGroups = useMemo(
    () => groupFoodsByProvince(filteredFoods),
    [filteredFoods]
  );

  const handleToggleFood = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleProvince = (items: FoodItem[]) => {
    const ids = items.map((i) => i.id);
    const allSelected = ids.every((id) => selectedIndexMap.has(id));
    if (allSelected) {
      const toRemove = new Set(ids);
      setSelectedIds((prev) => prev.filter((id) => !toRemove.has(id)));
    } else {
      setSelectedIds((prev) => {
        const next = [...prev];
        for (const id of ids) {
          if (!next.includes(id)) next.push(id);
        }
        return next;
      });
    }
  };

  const handleAddCustomFood = (food: FoodItem, addToSelection: boolean) => {
    setCustomFoods((prev) => [food, ...prev]);
    if (addToSelection) {
      setSelectedIds((prev) => [food.id, ...prev]);
    }
  };

  const handleDeleteCustomFood = (id: string) => {
    setCustomFoods((prev) => prev.filter((f) => f.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleRandomPick = () => {
    const pool = filteredFoods.length >= 6 ? filteredFoods : allFoods;
    setSelectedIds(pickRandomIds(pool, 8));
  };

  const handleShuffleSelected = () => {
    setSelectedIds((prev) => shuffleList(prev));
  };

  const handleJumpCatalog = () => {
    setMobileTab('catalog');
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJumpStudio = () => {
    setMobileTab('studio');
    if (window.innerWidth >= 1024) {
      document.getElementById('gif-studio')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1C1917]">
      <TopHeader
        selectedCount={selectedFoods.length}
        onJumpCatalog={handleJumpCatalog}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onJumpStudio={handleJumpStudio}
      />

      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Compact Editorial Masthead */}
        <section className="pb-6 border-b border-[#E7E5E0] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] [text-wrap:balance]">
              中国 34 省日常风味 · 今天吃什么 GIF 选择器
            </h1>
            <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
              每省甄选 3 道日常代表食物，共 <span className="tabular-nums-mono font-medium text-[#1C1917]">{allFoods.length}</span> 道可选。挑出想吃的菜品，或自行添加家常私房菜，一键生成带标题与菜名的动态 GIF，截图决定今天吃什么。
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRandomPick}
              className="h-10 px-3.5 text-sm font-medium text-[#1C1917] bg-white hover:bg-[#F2F0EC] border border-[#D6D3CD] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Dice5 className="w-4 h-4 text-[#C23B22]" />
              随机选 8 道
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="h-10 px-3.5 text-sm font-medium text-[#1C1917] bg-white hover:bg-[#F2F0EC] border border-[#D6D3CD] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#C23B22]" />
              添加自定义食物
            </button>
          </div>
        </section>

        {/* Mobile View Switcher (in flow, zero extra sticky height) */}
        <div className="mt-5 lg:hidden">
          <div
            role="tablist"
            aria-label="移动端视图切换"
            className="grid grid-cols-2 p-1 bg-[#ECEAE4] rounded-xl"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === 'catalog'}
              onClick={() => setMobileTab('catalog')}
              className={`py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                mobileTab === 'catalog'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E]'
              }`}
            >
              挑选食物（{allFoods.length}）
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === 'studio'}
              onClick={() => setMobileTab('studio')}
              className={`py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                mobileTab === 'studio'
                  ? 'bg-white text-[#C23B22] shadow-xs'
                  : 'text-[#57534E]'
              }`}
            >
              GIF 工作室（{selectedFoods.length}）
            </button>
          </div>
        </div>

        {/* Main 2-Column Workspace */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 34-Province Catalog */}
          <section
            id="catalog"
            aria-label="全国日常美食图鉴"
            className={`lg:col-span-8 space-y-6 ${
              mobileTab === 'studio' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Filter & Search Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    aria-hidden="true"
                    className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <label htmlFor="food-search-input" className="sr-only">
                    搜索省份或食物名称
                  </label>
                  <input
                    id="food-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索省份或食物，如：螺蛳粉、四川、肉夹馍..."
                    className="w-full h-10 pl-10 pr-9 text-sm bg-white border border-[#E7E5E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C23B22]/25 focus:border-[#C23B22]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      aria-label="清空搜索"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#78716C] whitespace-nowrap shrink-0 px-1">
                  显示 <span className="tabular-nums-mono font-semibold text-[#1C1917]">{provinceGroups.length}</span> 个地区 ·{' '}
                  <span className="tabular-nums-mono font-semibold text-[#1C1917]">{filteredFoods.length}</span> 道美食
                </div>
              </div>

              {/* Region Filter Tabs */}
              <div
                role="group"
                aria-label="按中国地理大区筛选"
                className="flex items-center gap-1.5 overflow-x-auto thin-scroll pb-1"
              >
                {REGIONS.map((reg) => {
                  const active = activeRegion === reg.key;
                  const label =
                    reg.key === 'custom' && customFoods.length > 0
                      ? `${reg.label} (${customFoods.length})`
                      : reg.label;
                  return (
                    <button
                      key={reg.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setActiveRegion(reg.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#1C1917] text-white'
                          : 'bg-white text-[#57534E] border border-[#E7E5E0] hover:border-[#C8C3BA] hover:text-[#1C1917]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Province Groups */}
            {provinceGroups.length === 0 ? (
              <div className="bg-white border border-[#E7E5E0] rounded-2xl py-14 px-6 text-center space-y-3">
                <p className="text-sm font-medium text-[#1C1917]">
                  {activeRegion === 'custom'
                    ? '还没有添加自定义食物'
                    : `没有找到与“${searchQuery}”匹配的美食`}
                </p>
                <p className="text-xs text-[#78716C]">
                  {activeRegion === 'custom'
                    ? '点击下方按钮添加你常吃的家常菜或外卖，立即加入 GIF 选择器。'
                    : '试试换个省份名，或者直接把这道菜添加到自定义列表。'}
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveRegion('all');
                      }}
                      className="px-4 py-2 text-xs font-medium text-[#57534E] bg-[#F2F0EC] hover:bg-[#E7E5E0] rounded-lg cursor-pointer"
                    >
                      重置筛选
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#C23B22] hover:bg-[#A62E18] rounded-lg cursor-pointer"
                  >
                    添加自定义食物
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {provinceGroups.map((group) => {
                  const allInGroupSelected = group.items.every((item) =>
                    selectedIndexMap.has(item.id)
                  );
                  return (
                    <div
                      key={group.provinceId}
                      data-testid={`province-group-${group.provinceId}`}
                      className="space-y-3"
                    >
                      <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-[#E7E5E0]">
                        <div className="flex items-baseline gap-2.5">
                          <h2 className="font-editorial text-lg font-bold text-[#1C1917]">
                            {group.provinceName}
                          </h2>
                          <span className="text-xs text-[#78716C]">
                            {group.regionLabel} · {group.items.length} 道代表菜
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleProvince(group.items)}
                          className="text-xs font-medium text-[#57534E] hover:text-[#C23B22] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {allInGroupSelected ? `取消全选${group.provinceName}` : `全选${group.provinceName}`}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                        {group.items.map((food) => (
                          <FoodCard
                            key={food.id}
                            food={food}
                            selectedIndex={selectedIndexMap.get(food.id) ?? -1}
                            onToggle={handleToggleFood}
                            onDeleteCustom={
                              food.isCustom ? handleDeleteCustomFood : undefined
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Column: Sticky GIF Studio */}
          <div
            className={`lg:col-span-4 lg:sticky lg:top-22 ${
              mobileTab === 'catalog' ? 'hidden lg:block' : 'block'
            }`}
          >
            <GifStudio
              selectedFoods={selectedFoods}
              onRemoveFood={handleToggleFood}
              onShuffleSelected={handleShuffleSelected}
              onRandomPick={handleRandomPick}
              onClearSelected={() => setSelectedIds([])}
            />
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-[#E7E5E0] py-6">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#78716C]">
          <span>食选 · 中国 34 省日常美食 GIF 选择器</span>
          <span>12 张多宫格拼图智能分割 · 全程本地浏览器合成 GIF</span>
        </div>
      </footer>

      <AddCustomFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddFood={handleAddCustomFood}
      />
    </div>
  );
}
