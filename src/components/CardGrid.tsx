import { useTranslation } from 'react-i18next';
import type { RankedCard } from '../types/card';
import { CardClassName } from '../types/card';

const TIER_COLORS: Record<string, string> = {
  S: 'bg-gradient-to-r from-red-600 to-amber-500 text-white',
  A: 'bg-gradient-to-r from-orange-600 to-orange-400 text-white',
  B: 'bg-gradient-to-r from-blue-600 to-blue-400 text-white',
  C: 'bg-gradient-to-r from-green-600 to-green-400 text-white',
  D: 'bg-gradient-to-r from-gray-600 to-gray-400 text-white',
};

function getImageLang(lang: string): string {
  return lang.startsWith('zh') ? 'cht' : 'eng';
}

function getCardImageUrl(card: RankedCard, lang: string): string {
  if (card.card_image_hash) {
    return `https://shadowverse-wb.com/uploads/card_image/${getImageLang(lang)}/card/${card.card_image_hash}.png`;
  }
  return `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" fill="%231a1130"><rect width="200" height="280"/><text x="100" y="140" text-anchor="middle" fill="%237c3aed" font-size="14">No Image</text></svg>'
  )}`;
}

interface CardGridProps {
  cards: RankedCard[];
  onSelectCard: (card: RankedCard) => void;
}

export default function CardGrid({ cards, onSelectCard }: CardGridProps) {
  const { t, i18n } = useTranslation();

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-purple-400">
        {t('state.noCards')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const className = CardClassName[card.clan] || 'Unknown';
        return (
          <div
            key={card.card_id}
            onClick={() => onSelectCard(card)}
            className="group bg-[var(--bg-card)] rounded-xl border border-purple-800/30 overflow-hidden cursor-pointer transition-all duration-200 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:-translate-y-0.5"
          >
            {/* Card image */}
            <div className="relative aspect-[3/4] bg-purple-950/50 overflow-hidden">
              <img
                src={getCardImageUrl(card, i18n.language)}
                alt={card.card_name}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" fill="%231a1130"><rect width="200" height="280"/><text x="100" y="140" text-anchor="middle" fill="%237c3aed" font-size="14">No Image</text></svg>'
                  )}`;
                }}
              />
              {/* Cost badge */}
              <div className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {card.cost}
              </div>
              {/* Tier badge */}
              <div
                className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-xs font-bold shadow-lg ${
                  TIER_COLORS[card.tier] || TIER_COLORS.D
                }`}
              >
                {card.tier}
              </div>
            </div>
            {/* Card info */}
            <div className="p-2">
              <p className="text-xs font-medium text-purple-100 truncate">{card.card_name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-purple-400">
                  {t(`classes.${className}`)}
                </span>
                {card.atk !== undefined && card.life !== undefined && (
                  <span className="text-[10px] text-purple-400">
                    {t('card.atk')} {card.atk} / {t('card.life')} {card.life}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
