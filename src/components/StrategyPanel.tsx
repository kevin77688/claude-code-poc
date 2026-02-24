import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RankedCard, CardMetadata } from '../types/card';
import { CardClass } from '../types/card';
import { getStrategyForClass } from '../utils/ranking';

type ClassName = keyof typeof CardClass;

const ALL_CLASSES = Object.keys(CardClass) as ClassName[];

const CLASS_ACCENT: Record<ClassName, string> = {
  Forestcraft: 'border-green-500 text-green-300',
  Swordcraft: 'border-yellow-500 text-yellow-300',
  Runecraft: 'border-blue-500 text-blue-300',
  Dragoncraft: 'border-orange-500 text-orange-300',
  Shadowcraft: 'border-purple-500 text-purple-300',
  Bloodcraft: 'border-red-500 text-red-300',
  Havencraft: 'border-amber-400 text-amber-300',
  Portalcraft: 'border-cyan-500 text-cyan-300',
};

interface StrategyPanelProps {
  rankedCards: RankedCard[];
  metadata?: CardMetadata;
}

export default function StrategyPanel({ rankedCards, metadata }: StrategyPanelProps) {
  const { t } = useTranslation();
  const [activeClass, setActiveClass] = useState<ClassName>('Forestcraft');

  const clanValue = CardClass[activeClass];
  const strategy = getStrategyForClass(clanValue, rankedCards, metadata);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-purple-200">{t('strategy.title')}</h2>

      {/* Class tabs */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_CLASSES.map((cls) => (
          <button
            key={cls}
            onClick={() => setActiveClass(cls)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeClass === cls
                ? `bg-purple-800/60 ${CLASS_ACCENT[cls]}`
                : 'bg-purple-900/40 border-purple-700/40 text-purple-300 hover:bg-purple-800/50'
            }`}
          >
            {t(`classes.${cls}`)}
          </button>
        ))}
      </div>

      {/* Strategy content */}
      <div className={`bg-[var(--bg-card)] rounded-xl border ${CLASS_ACCENT[activeClass].split(' ')[0]} p-5 space-y-4`}>
        {/* Archetype */}
        <div>
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-1">
            {t('strategy.archetype')}
          </h3>
          <p className={`text-lg font-bold ${CLASS_ACCENT[activeClass].split(' ')[1]}`}>
            {strategy.archetype}
          </p>
        </div>

        {/* Key cards */}
        <div>
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">
            {t('strategy.keyCards')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {strategy.keyCards.map((card) => (
              <div
                key={card.card_id}
                className="flex items-center gap-2 bg-purple-900/40 rounded-lg px-3 py-1.5 border border-purple-700/30"
              >
                <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                  {card.cost}
                </span>
                <span className="text-sm text-purple-200">{card.card_name}</span>
                <span className={`text-[10px] font-bold px-1.5 rounded ${
                  card.tier === 'S' ? 'bg-red-600/40 text-red-300' :
                  card.tier === 'A' ? 'bg-orange-600/40 text-orange-300' :
                  'bg-blue-600/40 text-blue-300'
                }`}>
                  {card.tier}
                </span>
              </div>
            ))}
            {strategy.keyCards.length === 0 && (
              <span className="text-sm text-purple-500">No key cards found</span>
            )}
          </div>
        </div>

        {/* Tips */}
        <div>
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">
            {t('strategy.tips')}
          </h3>
          <ul className="space-y-1.5">
            {strategy.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-purple-200">
                <span className="text-purple-500 shrink-0">&#x2022;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
