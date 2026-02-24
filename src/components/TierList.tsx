import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RankedCard, CardMetadata } from '../types/card';
import { CardClass, CardClassName } from '../types/card';

type ClassName = keyof typeof CardClass;

const TIERS = ['S', 'A', 'B', 'C', 'D'] as const;

const TIER_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  S: { bg: 'bg-red-950/50', border: 'border-red-700/50', label: 'bg-gradient-to-r from-red-600 to-amber-500' },
  A: { bg: 'bg-orange-950/50', border: 'border-orange-700/50', label: 'bg-gradient-to-r from-orange-600 to-orange-400' },
  B: { bg: 'bg-blue-950/50', border: 'border-blue-700/50', label: 'bg-gradient-to-r from-blue-600 to-blue-400' },
  C: { bg: 'bg-green-950/50', border: 'border-green-700/50', label: 'bg-gradient-to-r from-green-600 to-green-400' },
  D: { bg: 'bg-gray-950/50', border: 'border-gray-700/50', label: 'bg-gradient-to-r from-gray-600 to-gray-400' },
};

const ALL_CLASSES = Object.keys(CardClass) as ClassName[];

function getCardImageUrl(card: RankedCard, lang: string): string {
  const imgLang = lang.startsWith('zh') ? 'cht' : 'eng';
  if (card.card_image_hash) {
    return `https://shadowverse-wb.com/uploads/card_image/${imgLang}/card/${card.card_image_hash}.png`;
  }
  return '';
}

interface TierListProps {
  rankedCards: RankedCard[];
  metadata?: CardMetadata;
}

export default function TierList({ rankedCards }: TierListProps) {
  const { t, i18n } = useTranslation();
  const [classFilter, setClassFilter] = useState<ClassName | null>(null);

  const filtered = classFilter
    ? rankedCards.filter((c) => CardClassName[c.clan] === classFilter)
    : rankedCards;

  const cardsByTier = TIERS.reduce<Record<string, RankedCard[]>>((acc, tier) => {
    acc[tier] = filtered.filter((c) => c.tier === tier);
    return acc;
  }, {} as Record<string, RankedCard[]>);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-purple-200">{t('tierList.title')}</h2>

      {/* Class tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setClassFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            classFilter === null
              ? 'bg-purple-600 border-purple-400 text-white'
              : 'bg-purple-900/40 border-purple-700/40 text-purple-300 hover:bg-purple-800/50'
          }`}
        >
          {t('tierList.allClasses')}
        </button>
        {ALL_CLASSES.map((cls) => (
          <button
            key={cls}
            onClick={() => setClassFilter(classFilter === cls ? null : cls)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              classFilter === cls
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'bg-purple-900/40 border-purple-700/40 text-purple-300 hover:bg-purple-800/50'
            }`}
          >
            {t(`classes.${cls}`)}
          </button>
        ))}
      </div>

      {/* Tier rows */}
      <div className="space-y-2">
        {TIERS.map((tier) => {
          const cards = cardsByTier[tier];
          const style = TIER_STYLES[tier];
          return (
            <div
              key={tier}
              className={`flex items-stretch rounded-xl border overflow-hidden ${style.bg} ${style.border}`}
            >
              {/* Tier label */}
              <div
                className={`flex items-center justify-center w-16 shrink-0 ${style.label}`}
              >
                <span className="text-xl font-extrabold text-white">{tier}</span>
              </div>
              {/* Cards */}
              <div className="flex flex-wrap gap-2 p-3 min-h-[60px]">
                {cards.length === 0 ? (
                  <span className="text-xs text-purple-500 self-center">—</span>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.card_id}
                      className="group relative w-12 h-16 rounded-lg overflow-hidden border border-purple-700/30 bg-purple-950/60 hover:border-purple-400/60 transition-all"
                      title={card.card_name}
                    >
                      <img
                        src={getCardImageUrl(card, i18n.language)}
                        alt={card.card_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 px-0.5 py-px">
                        <p className="text-[7px] text-white truncate text-center">{card.card_name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
