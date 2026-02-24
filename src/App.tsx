import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { useCards } from './hooks/useCards';
import { filterCards, sortCards } from './utils/filters';
import Header from './components/Header';
import FilterBar, { type Filters } from './components/FilterBar';
import CardGrid from './components/CardGrid';
import TierList from './components/TierList';
import StrategyPanel from './components/StrategyPanel';
import CardDetail from './components/CardDetail';
import type { RankedCard } from './types/card';
import { Loader2 } from 'lucide-react';

type Tab = 'rankings' | 'tierList' | 'strategy';

export default function App() {
  const { t } = useTranslation();
  const { rankedCards, metadata, loading, error, retry } = useCards();

  const [activeTab, setActiveTab] = useState<Tab>('rankings');
  const [selectedCard, setSelectedCard] = useState<RankedCard | null>(null);
  const [filters, setFilters] = useState<Filters>({
    selectedClass: null,
    costFilter: null,
    rarityFilter: '',
    searchQuery: '',
    sortBy: 'rank',
  });

  const filteredCards = filterCards(rankedCards, {
    cardClass: filters.selectedClass || undefined,
    cost: filters.costFilter ?? undefined,
    rarity: filters.rarityFilter || undefined,
    search: filters.searchQuery || undefined,
  });

  const sortedCards = sortCards(filteredCards, filters.sortBy);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="text-purple-500 animate-spin" />
        <p className="text-purple-400 text-sm">{t('state.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-red-400 text-sm">{t('state.error')}</p>
        <p className="text-red-400/60 text-xs">{error}</p>
        <button
          onClick={retry}
          className="mt-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors cursor-pointer"
        >
          {t('state.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />

      <main className="max-w-7xl mx-auto px-4 py-5">
        {activeTab === 'rankings' && (
          <div className="space-y-4">
            <FilterBar filters={filters} onChange={setFilters} />
            <CardGrid cards={sortedCards} onSelectCard={setSelectedCard} />
          </div>
        )}

        {activeTab === 'tierList' && (
          <TierList rankedCards={rankedCards} metadata={metadata} />
        )}

        {activeTab === 'strategy' && (
          <StrategyPanel rankedCards={rankedCards} metadata={metadata} />
        )}
      </main>

      <CardDetail
        card={selectedCard}
        metadata={metadata}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}
