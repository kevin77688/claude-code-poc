import type { Card, RankedCard } from '../types/card';

/** Filter criteria – every field is optional. */
export interface CardFilters {
  cardClass?: string | null;
  clan?: number | null;
  cost?: number | null;
  rarity?: string;
  search?: string;
}

/** Accepted sort keys. */
export type SortKey = 'cost' | 'atk' | 'life' | 'rarity' | 'rank' | 'name';

/** Filter a card list by the given criteria. */
export function filterCards<T extends Card>(cards: T[], filters: CardFilters): T[] {
  return cards.filter((card) => {
    if (filters.cardClass != null && card.card_class !== filters.cardClass) return false;
    if (filters.clan != null && card.clan !== filters.clan) return false;

    if (filters.cost != null) {
      if (filters.cost >= 8 ? card.cost < 8 : card.cost !== filters.cost) return false;
    }

    if (filters.rarity) {
      if (card.rarity_name !== filters.rarity) return false;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const nameMatch = card.card_name.toLowerCase().includes(q);
      const skillMatch = (card.skill_text ?? '').toLowerCase().includes(q);
      if (!nameMatch && !skillMatch) return false;
    }

    return true;
  });
}

/** Sort cards by the given key. */
export function sortCards<T extends Card>(cards: T[], sortBy: string): T[] {
  return [...cards].sort((a, b) => {
    switch (sortBy as SortKey) {
      case 'cost':
        return a.cost - b.cost;
      case 'atk':
        return b.atk - a.atk;
      case 'life':
        return b.life - a.life;
      case 'rarity':
        return b.rarity - a.rarity;
      case 'name':
        return a.card_name.localeCompare(b.card_name);
      case 'rank':
      default: {
        const sa = 'score' in a ? (a as unknown as RankedCard).score : 0;
        const sb = 'score' in b ? (b as unknown as RankedCard).score : 0;
        return sb - sa;
      }
    }
  });
}
