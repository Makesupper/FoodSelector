import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { COVER_TONES } from '../data/chinaFoods';
import type { FoodItem } from '../types/food';

interface FoodCardProps {
  food: FoodItem;
  selectedIndex: number; // -1 if not selected, >= 0 if selected
  onToggle: (id: string) => void;
  onDeleteCustom?: (id: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  selectedIndex,
  onToggle,
  onDeleteCustom,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const isSelected = selectedIndex >= 0;
  const showFallback = !food.image || imgFailed;
  const tone = COVER_TONES[food.coverTone ?? 'vermilion'] ?? COVER_TONES.vermilion;

  return (
    <div className="relative group">
      <button
        type="button"
        aria-pressed={isSelected}
        aria-label={`${isSelected ? '取消选择' : '选择'} ${food.provinceName} ${food.name}`}
        onClick={() => onToggle(food.id)}
        className={`w-full text-left bg-white rounded-xl overflow-hidden transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C23B22] focus-visible:ring-offset-2 ${
          isSelected
            ? 'ring-2 ring-[#C23B22] shadow-sm'
            : 'border border-[#E7E5E0] hover:border-[#C8C3BA] hover:-translate-y-0.5 hover:shadow-sm'
        }`}
      >
        {/* 1:1 Food Photo or Typographic Cover */}
        <div className="relative aspect-square w-full bg-[#F1EFEA] overflow-hidden">
          {showFallback ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none"
              style={{ backgroundColor: tone.bg, color: tone.text }}
            >
              <div
                className="w-full h-full border flex flex-col items-center justify-center px-3"
                style={{ borderColor: `${tone.accent}55` }}
              >
                <span className="font-editorial text-xl font-bold leading-snug line-clamp-2">
                  {food.name}
                </span>
                <span
                  className="mt-1.5 text-xs tracking-wide"
                  style={{ color: tone.sub }}
                >
                  {food.provinceName}
                </span>
              </div>
            </div>
          ) : (
            <img
              src={food.image}
              alt={`${food.provinceName}代表美食：${food.name}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}

          {/* Selection order indicator */}
          <div
            aria-hidden="true"
            className={`absolute top-2.5 right-2.5 h-7 min-w-7 px-1.5 rounded-md flex items-center justify-center text-xs font-semibold transition-all duration-150 ${
              isSelected
                ? 'bg-[#C23B22] text-white shadow-sm'
                : 'bg-white/90 text-[#57534E] border border-[#E7E5E0] opacity-0 group-hover:opacity-100'
            }`}
          >
            {isSelected ? (
              <span className="flex items-center gap-0.5 tabular-nums-mono">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                {selectedIndex + 1}
              </span>
            ) : (
              <span>+</span>
            )}
          </div>
        </div>

        {/* Clean Unboxed Metadata Footer */}
        <div className="p-2 sm:p-3">
          <div className="flex items-baseline justify-between gap-1.5">
            <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#1C1917] truncate">
              {food.name}
            </h3>
            <span className="hidden sm:inline text-xs text-[#78716C] shrink-0">
              {food.provinceName}
            </span>
          </div>
          {food.note && (
            <p className="mt-0.5 text-[11px] sm:text-xs text-[#78716C] truncate">
              {food.note}
            </p>
          )}
        </div>
      </button>

      {/* Sibling Delete Button for Custom Dishes (never nested inside button) */}
      {food.isCustom && onDeleteCustom && (
        <button
          type="button"
          aria-label={`删除自定义食物 ${food.name}`}
          onClick={() => onDeleteCustom(food.id)}
          className="absolute top-2.5 left-2.5 h-7 w-7 rounded-md bg-white/95 hover:bg-[#C23B22] text-[#57534E] hover:text-white border border-[#E7E5E0] flex items-center justify-center transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C23B22]"
          title={`删除 ${food.name}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
