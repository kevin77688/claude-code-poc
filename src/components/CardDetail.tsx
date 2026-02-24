import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { RankedCard, CardMetadata } from '../types/card';
import { CardClassName, CardRarity } from '../types/card';

const TIER_COLORS: Record<string, string> = {
  S: 'bg-gradient-to-r from-red-600 to-amber-500',
  A: 'bg-gradient-to-r from-orange-600 to-orange-400',
  B: 'bg-gradient-to-r from-blue-600 to-blue-400',
  C: 'bg-gradient-to-r from-green-600 to-green-400',
  D: 'bg-gradient-to-r from-gray-600 to-gray-400',
};

const RARITY_NAMES: Record<number, string> = {
  [CardRarity.Bronze]: 'Bronze',
  [CardRarity.Silver]: 'Silver',
  [CardRarity.Gold]: 'Gold',
  [CardRarity.Legendary]: 'Legendary',
};

const TYPE_NAMES: Record<number, string> = {
  1: 'Follower',
  2: 'Spell',
  3: 'Amulet',
  4: 'Follower (Evo)',
};

function getCardImageUrl(card: RankedCard, lang: string): string {
  const imgLang = lang.startsWith('zh') ? 'cht' : 'eng';
  if (card.card_image_hash) {
    return `https://shadowverse-wb.com/uploads/card_image/${imgLang}/card/${card.card_image_hash}.png`;
  }
  return `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" fill="%231a1130"><rect width="400" height="560"/><text x="200" y="280" text-anchor="middle" fill="%237c3aed" font-size="20">No Image</text></svg>'
  )}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

interface CardDetailProps {
  card: RankedCard | null;
  metadata?: CardMetadata;
  onClose: () => void;
}

export default function CardDetail({ card, metadata, onClose }: CardDetailProps) {
  const { t, i18n } = useTranslation();

  if (!card) return null;

  const className = CardClassName[card.clan] || 'Unknown';
  const rarityName = RARITY_NAMES[card.rarity] || `Rarity ${card.rarity}`;
  const typeName = TYPE_NAMES[card.char_type] || `Type ${card.char_type}`;
  const tribeName = metadata?.tribe_names?.[String(card.tribe)] || '';
  const setName = metadata?.card_set_names?.[String(card.card_set_id)] || '';
  const skillText = card.skill_text ? stripHtml(card.skill_text) : '';
  const evoSkillText = card.evo_skill_text ? stripHtml(card.evo_skill_text) : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-[var(--bg-secondary)] rounded-2xl border border-purple-700/40 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-purple-800/60 hover:bg-purple-700 flex items-center justify-center text-purple-300 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Card image */}
        <div className="relative aspect-[3/4] max-h-[400px] bg-purple-950/50 overflow-hidden rounded-t-2xl">
          <img
            src={getCardImageUrl(card, i18n.language)}
            alt={card.card_name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" fill="%231a1130"><rect width="400" height="560"/><text x="200" y="280" text-anchor="middle" fill="%237c3aed" font-size="20">No Image</text></svg>'
              )}`;
            }}
          />
          {/* Tier badge */}
          <div className={`absolute top-3 right-12 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${TIER_COLORS[card.tier] || TIER_COLORS.D} text-white`}>
            {t(`tier.${card.tier}`)}
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-purple-100">{card.card_name}</h2>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-purple-400">{t('card.score')}:</span>
              <span className="text-sm font-bold text-purple-200">{card.score.toFixed(1)}</span>
            </div>
          </div>

          {/* Stats table */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <StatRow label={t('card.cost')} value={String(card.cost)} />
            <StatRow label={t('card.atk')} value={String(card.atk)} />
            <StatRow label={t('card.life')} value={String(card.life)} />
            <StatRow label={t('card.class')} value={t(`classes.${className}`)} />
            <StatRow label={t('card.rarity')} value={rarityName} />
            <StatRow label={t('card.type')} value={typeName} />
            {tribeName && <StatRow label={t('card.tribe')} value={tribeName} />}
            {setName && <StatRow label={t('card.set')} value={setName} />}
          </div>

          {/* Skill text */}
          {skillText && (
            <div>
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5">
                {t('card.skill')}
              </h3>
              <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-800/30">
                <p className="text-sm text-purple-200 whitespace-pre-line leading-relaxed">
                  {skillText}
                </p>
              </div>
            </div>
          )}

          {/* Evo skill text */}
          {evoSkillText && evoSkillText !== skillText && (
            <div>
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5">
                {t('card.skill')} (Evolved)
              </h3>
              <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-800/30">
                <p className="text-sm text-purple-200 whitespace-pre-line leading-relaxed">
                  {evoSkillText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between bg-purple-950/40 rounded-lg px-3 py-1.5 border border-purple-800/20">
      <span className="text-purple-400">{label}</span>
      <span className="font-medium text-purple-200">{value}</span>
    </div>
  );
}
