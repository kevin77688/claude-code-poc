import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CardClassName,
  CardTypeName,
  CardRarityName,
} from '../types/card';
import type { Card, CardData, CardMetadata, RankedCard } from '../types/card';
import { rankCards } from '../utils/ranking';

export interface UseCardsResult {
  cards: Card[];
  rankedCards: RankedCard[];
  metadata: CardMetadata | undefined;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/** In-memory cache keyed by JSON path. */
const cache: Record<
  string,
  { cards: Card[]; ranked: RankedCard[]; metadata: CardMetadata }
> = {};

// ------------------------------------------------------------------ //
//  Helpers to transform raw JSON into enriched Card objects            //
// ------------------------------------------------------------------ //

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}

function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (v == null) return fallback;
  return String(v);
}

function parseCards(data: CardData): { cards: Card[]; metadata: CardMetadata } {
  const meta: CardMetadata = {
    tribe_names: data.metadata?.tribe_names ?? {},
    card_set_names: data.metadata?.card_set_names ?? {},
    skill_names: data.metadata?.skill_names ?? {},
  };

  // card_details holds per-card info nested as { common: {...}, evo: {...} }
  const details = data.card_details ?? {};

  const cards: Card[] = Object.entries(details)
    .map(([id, detail]) => {
      const wrapper = detail as Record<string, unknown>;
      // The actual card data is nested under "common" and "evo"
      const common = (wrapper['common'] ?? wrapper) as Record<string, unknown>;
      const evo = (wrapper['evo'] ?? {}) as Record<string, unknown>;

      const clan = num(common['class']);
      const charType = num(common['type']);
      const tribes = common['tribes'] as number[] | undefined;
      const firstTribe = tribes?.[0] ?? 0;
      const rarity = num(common['rarity']);
      const cardSetId = num(common['card_set_id']);
      const isToken = common['is_token'];

      return {
        card_id: num(common['card_id'] ?? id),
        card_name: str(common['name']),

        clan,
        card_class: CardClassName[clan] ?? `Class ${clan}`,

        char_type: charType,
        card_type: CardTypeName[charType] ?? `Type ${charType}`,

        tribe: firstTribe,
        tribe_name: meta.tribe_names[String(firstTribe)] ?? '',

        rarity,
        rarity_name: CardRarityName[rarity] ?? `Rarity ${rarity}`,

        cost: num(common['cost']),
        atk: num(common['atk']),
        life: num(common['life']),
        evo_atk: 0,
        evo_life: 0,

        skill_text: str(common['skill_text']),
        evo_skill_text: str(evo['skill_text']),

        is_token: isToken === true || isToken === 1 ? 1 : 0,
        card_set_id: cardSetId,
        card_set_name: meta.card_set_names[String(cardSetId)] ?? '',
        card_image_hash: str(common['card_image_hash']),
      };
    })
    // Filter out token cards
    .filter((c) => c.is_token === 0);

  return { cards, metadata: meta };
}

// ------------------------------------------------------------------ //
//  Hook                                                               //
// ------------------------------------------------------------------ //

/**
 * Load the card JSON for the current i18next language, rank every card,
 * and return the results.
 */
export function useCards(): UseCardsResult {
  const { i18n } = useTranslation();
  const [cards, setCards] = useState<Card[]>([]);
  const [rankedCards, setRankedCards] = useState<RankedCard[]>([]);
  const [metadata, setMetadata] = useState<CardMetadata | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lang = i18n.language;
  const base = import.meta.env.BASE_URL;
  const jsonPath = lang.startsWith('zh') ? `${base}cards_cht.json` : `${base}cards_en.json`;

  const loadCards = useCallback(
    async (bypassCache = false) => {
      // Return cached data if available
      if (!bypassCache && cache[jsonPath]) {
        const c = cache[jsonPath];
        setCards(c.cards);
        setRankedCards(c.ranked);
        setMetadata(c.metadata);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(jsonPath);
        if (!res.ok) throw new Error(`Failed to fetch ${jsonPath}: ${res.status}`);

        const raw: CardData = await res.json();
        const { cards: parsed, metadata: meta } = parseCards(raw);
        const ranked = rankCards(parsed);

        cache[jsonPath] = { cards: parsed, ranked, metadata: meta };

        setCards(parsed);
        setRankedCards(ranked);
        setMetadata(meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [jsonPath],
  );

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const retry = useCallback(() => {
    void loadCards(true);
  }, [loadCards]);

  return { cards, rankedCards, metadata, loading, error, retry };
}
