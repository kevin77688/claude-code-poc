import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { CardClass } from '../types/card';

type ClassName = keyof typeof CardClass;

const CLASS_COLORS: Record<ClassName, string> = {
  Forestcraft: 'bg-green-700 border-green-500 hover:bg-green-600',
  Swordcraft: 'bg-yellow-700 border-yellow-500 hover:bg-yellow-600',
  Runecraft: 'bg-blue-700 border-blue-500 hover:bg-blue-600',
  Dragoncraft: 'bg-orange-700 border-orange-500 hover:bg-orange-600',
  Shadowcraft: 'bg-purple-700 border-purple-500 hover:bg-purple-600',
  Bloodcraft: 'bg-red-700 border-red-500 hover:bg-red-600',
  Havencraft: 'bg-amber-600 border-amber-400 hover:bg-amber-500',
  Portalcraft: 'bg-cyan-700 border-cyan-500 hover:bg-cyan-600',
};

const ALL_CLASSES = Object.keys(CardClass) as ClassName[];

export interface Filters {
  selectedClass: ClassName | null;
  costFilter: number | null;
  rarityFilter: string;
  searchQuery: string;
  sortBy: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const { t } = useTranslation();

  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-3 p-4 bg-[var(--bg-secondary)] rounded-xl border border-purple-800/30">
      {/* Class filter buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update({ selectedClass: null })}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            filters.selectedClass === null
              ? 'bg-purple-600 border-purple-400 text-white'
              : 'bg-purple-900/40 border-purple-700/40 text-purple-300 hover:bg-purple-800/50'
          }`}
        >
          {t('filter.allClasses')}
        </button>
        {ALL_CLASSES.map((cls) => (
          <button
            key={cls}
            onClick={() => update({ selectedClass: filters.selectedClass === cls ? null : cls })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              filters.selectedClass === cls
                ? `${CLASS_COLORS[cls]} text-white`
                : 'bg-purple-900/40 border-purple-700/40 text-purple-300 hover:bg-purple-800/50'
            }`}
          >
            {t(`classes.${cls}`)}
          </button>
        ))}
      </div>

      {/* Second row: cost, rarity, search, sort */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Cost filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-purple-400">{t('filter.cost')}:</span>
          <div className="flex gap-1">
            <button
              onClick={() => update({ costFilter: null })}
              className={`w-7 h-7 rounded text-xs font-medium border transition-colors cursor-pointer ${
                filters.costFilter === null
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-purple-900/40 border-purple-700/40 text-purple-300 hover:bg-purple-800/50'
              }`}
            >
              {t('filter.costAll')}
            </button>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cost) => (
              <button
                key={cost}
                onClick={() => update({ costFilter: filters.costFilter === cost ? null : cost })}
                className={`w-7 h-7 rounded text-xs font-medium border transition-colors cursor-pointer ${
                  filters.costFilter === cost
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-purple-900/40 border-purple-700/40 text-purple-300 hover:bg-purple-800/50'
                }`}
              >
                {cost === 8 ? '8+' : cost}
              </button>
            ))}
          </div>
        </div>

        {/* Rarity dropdown */}
        <select
          value={filters.rarityFilter}
          onChange={(e) => update({ rarityFilter: e.target.value })}
          className="bg-purple-900/40 border border-purple-700/40 text-purple-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-purple-500"
        >
          <option value="">{t('filter.rarityOptions.all')}</option>
          <option value="Bronze">{t('filter.rarityOptions.bronze')}</option>
          <option value="Silver">{t('filter.rarityOptions.silver')}</option>
          <option value="Gold">{t('filter.rarityOptions.gold')}</option>
          <option value="Legendary">{t('filter.rarityOptions.legendary')}</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-500" />
          <input
            type="text"
            placeholder={t('filter.search')}
            value={filters.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            className="w-full bg-purple-900/40 border border-purple-700/40 text-purple-200 text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-purple-500 placeholder-purple-600"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-purple-400">{t('filter.sortBy')}:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value })}
            className="bg-purple-900/40 border border-purple-700/40 text-purple-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-purple-500"
          >
            <option value="rank">{t('filter.sortOptions.rank')}</option>
            <option value="cost">{t('filter.sortOptions.cost')}</option>
            <option value="atk">{t('filter.sortOptions.atk')}</option>
            <option value="life">{t('filter.sortOptions.life')}</option>
            <option value="name">{t('filter.sortOptions.name')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
