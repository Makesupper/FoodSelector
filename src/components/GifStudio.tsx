import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Pause,
  Play,
  RefreshCw,
  Shuffle,
  Trash2,
  X,
} from 'lucide-react';
import type { FoodItem, GeneratedGifResult, GifOptions, GifThemeId } from '../types/food';
import {
  DEFAULT_GIF_OPTIONS,
  GIF_THEMES,
  drawDishFrameToCanvas,
  formatByteSize,
  generateSelectorGif,
  loadHtmlImage,
} from '../utils/gifEncoder';

interface GifStudioProps {
  selectedFoods: FoodItem[];
  onRemoveFood: (id: string) => void;
  onShuffleSelected: () => void;
  onRandomPick: () => void;
  onClearSelected: () => void;
}

const SPEED_PRESETS = [
  { ms: 80, label: '极速 80ms' },
  { ms: 120, label: '畅快 120ms' },
  { ms: 200, label: '适中 200ms' },
  { ms: 380, label: '慢速 380ms' },
];

const THEME_IDS: GifThemeId[] = ['porcelain', 'midnight', 'vermilion'];

export const GifStudio: React.FC<GifStudioProps> = ({
  selectedFoods,
  onRemoveFood,
  onShuffleSelected,
  onRandomPick,
  onClearSelected,
}) => {
  const [options, setOptions] = useState<GifOptions>(DEFAULT_GIF_OPTIONS);
  const [isPlaying, setIsPlaying] = useState(true);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [stageMode, setStageMode] = useState<'live' | 'gif'>('live');

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genError, setGenError] = useState('');
  const [generatedGif, setGeneratedGif] = useState<GeneratedGifResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement | null>>(new Map());
  const prevGifUrlRef = useRef<string | null>(null);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (prevGifUrlRef.current) {
        URL.revokeObjectURL(prevGifUrlRef.current);
      }
    };
  }, []);

  // Clamp preview index when selectedFoods changes
  useEffect(() => {
    setPreviewIndex((idx) =>
      selectedFoods.length === 0 ? 0 : idx % selectedFoods.length
    );
  }, [selectedFoods.length]);

  // Live roulette ticker
  useEffect(() => {
    if (!isPlaying || stageMode !== 'live' || selectedFoods.length <= 1) return;
    const timer = window.setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % selectedFoods.length);
    }, Math.max(70, options.delayMs));
    return () => window.clearInterval(timer);
  }, [isPlaying, stageMode, selectedFoods.length, options.delayMs]);

  // Draw current preview frame onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stageMode !== 'live') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (selectedFoods.length === 0) {
      ctx.fillStyle = '#FAF8F4';
      ctx.fillRect(0, 0, options.width, options.height);
      ctx.fillStyle = '#78716C';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '500 18px "Noto Sans SC", sans-serif';
      ctx.fillText('请先在左侧选择至少 1 道食物', options.width / 2, options.height / 2);
      return;
    }

    const safeIdx = previewIndex % selectedFoods.length;
    const dish = selectedFoods[safeIdx];
    let cancelled = false;

    const renderWithImage = (img: HTMLImageElement | null) => {
      if (cancelled) return;
      drawDishFrameToCanvas(ctx, dish, img, options, safeIdx, selectedFoods.length);
    };

    if (imageCacheRef.current.has(dish.image)) {
      renderWithImage(imageCacheRef.current.get(dish.image) ?? null);
    } else {
      // Draw immediately with fallback while loading, then redraw when image arrives
      renderWithImage(null);
      loadHtmlImage(dish.image).then((img) => {
        imageCacheRef.current.set(dish.image, img);
        renderWithImage(img);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [selectedFoods, previewIndex, options, stageMode]);

  const currentDish =
    selectedFoods.length > 0
      ? selectedFoods[previewIndex % selectedFoods.length]
      : null;

  const handleGenerateGif = async () => {
    if (selectedFoods.length === 0) {
      setGenError('请至少选择 1 道食物后再生成 GIF');
      return;
    }
    setGenError('');
    setIsGenerating(true);
    setProgress(0);

    try {
      const { blob, bytes } = await generateSelectorGif(
        selectedFoods,
        options,
        (pct) => setProgress(pct)
      );

      if (prevGifUrlRef.current) {
        URL.revokeObjectURL(prevGifUrlRef.current);
      }
      const nextUrl = URL.createObjectURL(blob);
      prevGifUrlRef.current = nextUrl;

      setGeneratedGif({
        url: nextUrl,
        byteLength: bytes.byteLength,
        frameCount: selectedFoods.length,
        delayMs: options.delayMs,
        createdAt: Date.now(),
      });
      setStageMode('gif');
      requestAnimationFrame(() => {
        stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    } catch (err) {
      setGenError(err instanceof Error ? err.message : '生成 GIF 失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFileName = `${(options.title.trim() || '今天吃什么选择器').replace(/[\\/:*?"<>|]/g, '')}.gif`;

  return (
    <aside
      id="gif-studio"
      aria-label="今天吃什么 GIF 生成器"
      className="bg-white border border-[#E7E5E0] rounded-2xl p-4 sm:p-5 space-y-4 lg:max-h-[calc(100vh-5.75rem)] lg:overflow-y-auto thin-scroll"
    >
      {/* Header Row */}
      <div ref={stageRef} className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-editorial text-lg font-bold text-[#1C1917]">
            GIF 生成工作室
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            已选 <span className="tabular-nums-mono font-semibold text-[#1C1917]">{selectedFoods.length}</span> 道 · 含标题与菜名
          </p>
        </div>

        {/* Toggle between Live Preview and Generated GIF when GIF exists */}
        {generatedGif && (
          <div className="flex items-center p-0.5 bg-[#F2F0EC] rounded-lg">
            <button
              type="button"
              aria-pressed={stageMode === 'live'}
              onClick={() => setStageMode('live')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                stageMode === 'live'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              预览
            </button>
            <button
              type="button"
              aria-pressed={stageMode === 'gif'}
              onClick={() => setStageMode('gif')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                stageMode === 'gif'
                  ? 'bg-white text-[#C23B22] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              成图 GIF
            </button>
          </div>
        )}
      </div>

      {/* Preview / Generated GIF Frame Stage */}
      <div className="relative rounded-xl overflow-hidden border border-[#E7E5E0] bg-[#F5F3EE] flex flex-col items-center">
        {stageMode === 'gif' && generatedGif ? (
          <div className="w-full" data-testid="generated-gif-container">
            <div className="px-4 pt-3 pb-2 flex justify-center bg-[#F5F3EE]">
              <img
                src={generatedGif.url}
                alt={`${options.title || '今天吃什么选择器'} 动态 GIF`}
                className="w-full max-w-[290px] h-auto block rounded-lg shadow-xs"
                data-testid="generated-gif-image"
              />
            </div>
            <div className="px-3.5 py-2.5 bg-[#FAF9F7] border-t border-[#E7E5E0] flex items-center justify-between gap-2 text-xs text-[#57534E]">
              <span className="tabular-nums-mono">
                {generatedGif.frameCount} 帧 · {generatedGif.delayMs}ms · {formatByteSize(generatedGif.byteLength)}
              </span>
              <a
                href={generatedGif.url}
                download={downloadFileName}
                className="inline-flex items-center gap-1 font-semibold text-[#C23B22] hover:text-[#A62E18] whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                保存 GIF
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="px-4 pt-3 pb-2 flex justify-center bg-[#F5F3EE]">
              <canvas
                ref={canvasRef}
                width={options.width}
                height={options.height}
                data-testid="live-preview-canvas"
                aria-label={
                  currentDish
                    ? `实时预览：${options.title} - ${currentDish.name}`
                    : '实时预览画布'
                }
                className="w-full max-w-[290px] h-auto block rounded-lg shadow-xs"
              />
            </div>
            <div className="px-3.5 py-2.5 bg-[#FAF9F7] border-t border-[#E7E5E0] flex items-center justify-between gap-2">
              <div className="text-xs text-[#57534E] truncate">
                {currentDish ? (
                  <>
                    当前：<strong className="text-[#1C1917] font-semibold">{currentDish.name}</strong>
                    <span className="mx-1 text-[#A8A29E]">·</span>
                    <span>{currentDish.provinceName}</span>
                  </>
                ) : (
                  <span>尚未选择食物</span>
                )}
              </div>
              <button
                type="button"
                disabled={selectedFoods.length <= 1}
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#1C1917] bg-white hover:bg-[#F2F0EC] border border-[#D6D3CD] disabled:opacity-40 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3" />
                    停！抽一个
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    继续滚动
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Generate / Download CTA */}
      <div className="space-y-2.5">
        {genError && (
          <p role="alert" className="text-xs text-[#B42318]">
            {genError}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isGenerating || selectedFoods.length === 0}
            onClick={handleGenerateGif}
            className="flex-1 h-11 px-4 text-sm font-semibold text-white bg-[#C23B22] hover:bg-[#A62E18] disabled:opacity-45 active:scale-[0.99] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C23B22] focus-visible:ring-offset-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                正在合成 GIF（<span className="tabular-nums-mono">{progress}%</span>）
              </>
            ) : generatedGif ? (
              '重新生成 GIF 动图'
            ) : (
              '生成 GIF 动图'
            )}
          </button>

          {generatedGif && (
            <a
              href={generatedGif.url}
              download={downloadFileName}
              className="h-11 px-4 text-sm font-semibold text-[#1C1917] bg-[#F2F0EC] hover:bg-[#E7E5E0] rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              下载 GIF
            </a>
          )}
        </div>
      </div>

      {/* GIF Customization Controls */}
      <div className="pt-4 border-t border-[#E7E5E0] space-y-4">
        <div>
          <label
            htmlFor="gif-title-input"
            className="block text-xs font-medium text-[#57534E] mb-1.5"
          >
            GIF 顶部标题
          </label>
          <input
            id="gif-title-input"
            type="text"
            value={options.title}
            onChange={(e) => {
              setOptions((prev) => ({ ...prev, title: e.target.value }));
              if (stageMode === 'gif') setStageMode('live');
            }}
            maxLength={18}
            placeholder="今天吃什么选择器"
            className="w-full h-9 px-3 text-sm bg-[#FAF9F7] border border-[#D6D3CD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C23B22]/30 focus:border-[#C23B22]"
          />
        </div>

        {/* Speed Selector */}
        <div>
          <span className="block text-xs font-medium text-[#57534E] mb-1.5">
            跳转速度
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {SPEED_PRESETS.map((preset) => {
              const active = options.delayMs === preset.ms;
              return (
                <button
                  key={preset.ms}
                  type="button"
                  onClick={() => {
                    setOptions((prev) => ({ ...prev, delayMs: preset.ms }));
                    if (stageMode === 'gif') setStageMode('live');
                  }}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#1C1917] text-white border-[#1C1917]'
                      : 'bg-[#FAF9F7] text-[#57534E] border-[#E7E5E0] hover:border-[#C8C3BA]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme & Province Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F2F0EC] rounded-lg">
            {THEME_IDS.map((themeId) => {
              const t = GIF_THEMES[themeId];
              const active = options.theme === themeId;
              return (
                <button
                  key={themeId}
                  type="button"
                  onClick={() => {
                    setOptions((prev) => ({ ...prev, theme: themeId }));
                    if (stageMode === 'gif') setStageMode('live');
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white text-[#1C1917] shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <label className="inline-flex items-center gap-1.5 text-xs text-[#57534E] cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={options.showProvince}
              onChange={(e) => {
                setOptions((prev) => ({ ...prev, showProvince: e.target.checked }));
                if (stageMode === 'gif') setStageMode('live');
              }}
              className="w-3.5 h-3.5 accent-[#C23B22] rounded cursor-pointer"
            />
            显示省份
          </label>
        </div>
      </div>

      {/* Selected Dishes Pool */}
      <div className="pt-4 border-t border-[#E7E5E0] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-[#1C1917]">
            候选池（<span className="tabular-nums-mono">{selectedFoods.length}</span>）
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={onRandomPick}
              className="text-[#57534E] hover:text-[#C23B22] transition-colors whitespace-nowrap cursor-pointer"
            >
              随机换8道
            </button>
            <span className="text-[#D6D3CD]" aria-hidden="true">/</span>
            <button
              type="button"
              disabled={selectedFoods.length <= 1}
              onClick={onShuffleSelected}
              aria-label="打乱已选顺序"
              className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1C1917] disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Shuffle className="w-3 h-3" />
              打乱
            </button>
            <span className="text-[#D6D3CD]" aria-hidden="true">/</span>
            <button
              type="button"
              disabled={selectedFoods.length === 0}
              onClick={onClearSelected}
              aria-label="清空已选食物"
              className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#B42318] disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              清空
            </button>
          </div>
        </div>

        {selectedFoods.length === 0 ? (
          <p className="text-xs text-[#78716C] py-3 text-center bg-[#FAF9F7] rounded-lg border border-dashed border-[#D6D3CD]">
            点击左侧任意美食卡片加入选择池
          </p>
        ) : (
          <ul
            aria-label="已选食物列表"
            className="max-h-44 overflow-y-auto thin-scroll divide-y divide-[#F0EDE8] border border-[#E7E5E0] rounded-lg"
          >
            {selectedFoods.map((item, idx) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-[#FAF9F7] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="tabular-nums-mono text-[11px] text-[#A8A29E] w-4 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-medium text-[#1C1917] truncate">
                    {item.name}
                  </span>
                  <span className="text-[#78716C] shrink-0">
                    {item.provinceName}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`从候选池移除 ${item.name}`}
                  onClick={() => onRemoveFood(item.id)}
                  className="p-1 text-[#A8A29E] hover:text-[#B42318] rounded transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};
