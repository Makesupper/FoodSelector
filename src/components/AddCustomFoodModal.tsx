import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Link2, Palette, X } from 'lucide-react';
import { COVER_TONES, PROVINCES } from '../data/chinaFoods';
import type { CustomCoverTone, FoodItem } from '../types/food';
import { createCustomFoodItem, validateCustomFoodDraft } from '../utils/foodCatalog';
import { resizeImageFileToSquareDataUrl } from '../utils/gifEncoder';

interface AddCustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: FoodItem, addToSelection: boolean) => void;
}

type ImageMode = 'upload' | 'url' | 'cover';

const TONE_KEYS: CustomCoverTone[] = ['vermilion', 'ochre', 'jade', 'indigo', 'ink'];

export const AddCustomFoodModal: React.FC<AddCustomFoodModalProps> = ({
  isOpen,
  onClose,
  onAddFood,
}) => {
  const [name, setName] = useState('');
  const [provinceId, setProvinceId] = useState('custom');
  const [note, setNote] = useState('');
  const [imageMode, setImageMode] = useState<ImageMode>('upload');
  const [uploadedDataUrl, setUploadedDataUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [coverTone, setCoverTone] = useState<CustomCoverTone>('vermilion');
  const [addToSelection, setAddToSelection] = useState(true);
  const [error, setError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 30);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeImage =
    imageMode === 'upload'
      ? uploadedDataUrl
      : imageMode === 'url'
        ? imageUrl.trim()
        : '';

  const selectedProvinceName =
    provinceId === 'custom'
      ? '自定义'
      : PROVINCES.find((p) => p.id === provinceId)?.name ?? '自定义';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setIsProcessingImage(true);
    try {
      const dataUrl = await resizeImageFileToSquareDataUrl(file, 400);
      setUploadedDataUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片读取失败，请重试');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft = {
      name,
      provinceId,
      note,
      image: activeImage,
      coverTone,
    };
    const validation = validateCustomFoodDraft(draft);
    if (!validation.valid) {
      setError(validation.error ?? '请检查输入内容');
      return;
    }

    const newItem = createCustomFoodItem(draft);
    onAddFood(newItem, addToSelection);

    // Reset form
    setName('');
    setProvinceId('custom');
    setNote('');
    setUploadedDataUrl('');
    setImageUrl('');
    setCoverTone('vermilion');
    setAddToSelection(true);
    setError('');
    onClose();
  };

  const previewTone = COVER_TONES[coverTone];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-custom-food-title"
        className="w-full max-w-lg bg-white rounded-2xl border border-[#E7E5E0] shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E0]">
          <h2
            id="add-custom-food-title"
            className="font-editorial text-lg font-bold text-[#1C1917]"
          >
            添加自定义食物
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭添加食物窗口"
            className="h-9 w-9 rounded-lg flex items-center justify-center text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F3EF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5 max-h-[82vh] overflow-y-auto thin-scroll">
          {error && (
            <div
              role="alert"
              className="px-3.5 py-2.5 rounded-lg bg-[#FDF2F0] border border-[#F3C5BC] text-sm text-[#B42318]"
            >
              {error}
            </div>
          )}

          {/* Dish Name + Province */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-3">
              <label
                htmlFor="custom-food-name"
                className="block text-sm font-medium text-[#1C1917] mb-1.5"
              >
                食物名称 <span className="text-[#C23B22]">*</span>
              </label>
              <input
                ref={nameInputRef}
                id="custom-food-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="例如：番茄炒蛋、沙县拌面、炸鸡"
                maxLength={24}
                className="w-full h-10 px-3 text-sm bg-[#FAF9F7] border border-[#D6D3CD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C23B22]/30 focus:border-[#C23B22]"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="custom-food-province"
                className="block text-sm font-medium text-[#1C1917] mb-1.5"
              >
                所属地区
              </label>
              <select
                id="custom-food-province"
                value={provinceId}
                onChange={(e) => setProvinceId(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-[#FAF9F7] border border-[#D6D3CD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C23B22]/30 focus:border-[#C23B22]"
              >
                <option value="custom">自定义</option>
                {PROVINCES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}（{p.regionLabel}）
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label
              htmlFor="custom-food-note"
              className="block text-sm font-medium text-[#1C1917] mb-1.5"
            >
              风味简述（选填）
            </label>
            <input
              id="custom-food-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：酸甜下饭、楼下常去的小店"
              maxLength={28}
              className="w-full h-10 px-3 text-sm bg-[#FAF9F7] border border-[#D6D3CD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C23B22]/30 focus:border-[#C23B22]"
            />
          </div>

          {/* Image Source Mode */}
          <div>
            <span className="block text-sm font-medium text-[#1C1917] mb-2">
              食物配图方式
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F2F0EC] rounded-lg">
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  imageMode === 'upload'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <ImagePlus className="w-3.5 h-3.5" />
                上传照片
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  imageMode === 'url'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                图片链接
              </button>
              <button
                type="button"
                onClick={() => setImageMode('cover')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  imageMode === 'cover'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                文字封面
              </button>
            </div>

            <div className="mt-3 flex items-start gap-4">
              {/* Live Square Thumbnail Preview */}
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#E7E5E0] shrink-0 bg-[#F5F3EF]">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt="配图预览"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                    style={{ backgroundColor: previewTone.bg, color: previewTone.text }}
                  >
                    <span className="font-editorial text-sm font-bold leading-tight line-clamp-2">
                      {name.trim() || '美食预览'}
                    </span>
                    <span className="mt-1 text-[10px]" style={{ color: previewTone.sub }}>
                      {selectedProvinceName}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Image Input */}
              <div className="flex-1 min-w-0">
                {imageMode === 'upload' && (
                  <div className="space-y-2">
                    <label
                      htmlFor="custom-food-file"
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#1C1917] bg-[#FAF9F7] hover:bg-[#F2F0EC] border border-[#D6D3CD] rounded-lg cursor-pointer transition-colors"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      {isProcessingImage ? '正在裁剪图片...' : '选择本地图片'}
                    </label>
                    <input
                      id="custom-food-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <p className="text-xs text-[#78716C] leading-relaxed">
                      自动居中裁剪为方形并压缩保存。若暂不上传，将自动使用右侧文字封面。
                    </p>
                  </div>
                )}

                {imageMode === 'url' && (
                  <div className="space-y-1.5">
                    <label htmlFor="custom-food-url" className="sr-only">
                      图片网址
                    </label>
                    <input
                      id="custom-food-url"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/food.jpg"
                      className="w-full h-10 px-3 text-sm bg-[#FAF9F7] border border-[#D6D3CD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C23B22]/30 focus:border-[#C23B22]"
                    />
                    <p className="text-xs text-[#78716C]">
                      注：部分外部网站可能禁止跨域导出 GIF，建议优先使用本地上传或文字封面。
                    </p>
                  </div>
                )}

                {imageMode === 'cover' && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#78716C]">
                      无需找图，直接生成中式食帖色卡：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TONE_KEYS.map((toneKey) => {
                        const t = COVER_TONES[toneKey];
                        const active = coverTone === toneKey;
                        return (
                          <button
                            key={toneKey}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setCoverTone(toneKey)}
                            className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors duration-100 cursor-pointer flex items-center gap-1.5 ${
                              active
                                ? 'border-[#1C1917] bg-[#1C1917] text-white'
                                : 'border-[#E7E5E0] bg-white text-[#57534E] hover:border-[#A8A29E]'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-xs shrink-0"
                              style={{ backgroundColor: t.bg }}
                            />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Auto-add toggle */}
          <label className="flex items-center gap-2.5 text-sm text-[#44403C] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addToSelection}
              onChange={(e) => setAddToSelection(e.target.checked)}
              className="w-4 h-4 accent-[#C23B22] rounded cursor-pointer"
            />
            添加后立即加入右侧 GIF 选择池
          </label>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E7E5E0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F3EF] rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isProcessingImage}
              className="px-5 py-2 text-sm font-medium text-white bg-[#C23B22] hover:bg-[#A62E18] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
