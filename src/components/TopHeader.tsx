import React from 'react';
import { Star } from 'lucide-react';

const REPO_URL = 'https://github.com/Makesupper/FoodSelector';

interface TopHeaderProps {
  selectedCount: number;
  onJumpCatalog: () => void;
  onOpenAddModal: () => void;
  onJumpStudio: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  selectedCount,
  onJumpCatalog,
  onOpenAddModal,
  onJumpStudio,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-[#E7E5E0]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#catalog"
          onClick={(e) => {
            e.preventDefault();
            onJumpCatalog();
          }}
          className="font-editorial text-xl font-bold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C23B22] rounded"
        >
          食选 · 今天吃什么
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="主导航"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          <button
            type="button"
            onClick={onJumpCatalog}
            className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#1C1917] cursor-pointer"
          >
            全部美食图鉴
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#1C1917] cursor-pointer"
          >
            添加自定义食物
          </button>
          <button
            type="button"
            onClick={onJumpStudio}
            className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#1C1917] cursor-pointer"
          >
            GIF 生成器
          </button>
        </nav>

        {/* Zone 3: Star repo & Primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="在 GitHub 上 Star 源项目"
            className="px-3 py-2 text-sm font-medium text-[#1C1917] bg-white hover:bg-[#F2F0EC] border border-[#D6D3CD] active:scale-[0.98] transition-all rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C23B22] focus-visible:ring-offset-2"
          >
            <Star className="w-3.5 h-3.5 text-[#C23B22]" aria-hidden="true" />
            <span className="hidden sm:inline">Star 源项目</span>
            <span className="sm:hidden">Star</span>
          </a>
          <button
            type="button"
            onClick={onJumpStudio}
            className="px-4 py-2 text-sm font-medium text-white bg-[#C23B22] hover:bg-[#A62E18] active:scale-[0.98] transition-all rounded-lg whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C23B22] focus-visible:ring-offset-2"
          >
            生成 GIF（<span className="tabular-nums-mono">{selectedCount}</span>）
          </button>
        </div>
      </div>
    </header>
  );
};
