// ---------------------------------------------------------------------------
// Card class (craft) identifiers
// ---------------------------------------------------------------------------

export const CardClass = {
  Forestcraft: 0,
  Swordcraft: 1,
  Runecraft: 2,
  Dragoncraft: 3,
  Shadowcraft: 4,
  Bloodcraft: 5,
  Havencraft: 6,
  Portalcraft: 7,
} as const;
export type CardClass = (typeof CardClass)[keyof typeof CardClass];

// ---------------------------------------------------------------------------
// Card type identifiers
// ---------------------------------------------------------------------------

export const CardType = {
  Follower: 1,
  Spell: 2,
  Amulet: 3,
  FollowerEvo: 4,
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

// ---------------------------------------------------------------------------
// Card rarity identifiers
// ---------------------------------------------------------------------------

export const CardRarity = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
  Legendary: 4,
} as const;
export type CardRarity = (typeof CardRarity)[keyof typeof CardRarity];

// ---------------------------------------------------------------------------
// Display-name lookup maps
// ---------------------------------------------------------------------------

export const CardClassName: Record<number, string> = {
  [CardClass.Forestcraft]: 'Forestcraft',
  [CardClass.Swordcraft]: 'Swordcraft',
  [CardClass.Runecraft]: 'Runecraft',
  [CardClass.Dragoncraft]: 'Dragoncraft',
  [CardClass.Shadowcraft]: 'Shadowcraft',
  [CardClass.Bloodcraft]: 'Bloodcraft',
  [CardClass.Havencraft]: 'Havencraft',
  [CardClass.Portalcraft]: 'Portalcraft',
};

export const CardTypeName: Record<number, string> = {
  [CardType.Follower]: 'Follower',
  [CardType.Spell]: 'Spell',
  [CardType.Amulet]: 'Amulet',
  [CardType.FollowerEvo]: 'Follower (Evolved)',
};

export const CardRarityName: Record<number, string> = {
  [CardRarity.Bronze]: 'Bronze',
  [CardRarity.Silver]: 'Silver',
  [CardRarity.Gold]: 'Gold',
  [CardRarity.Legendary]: 'Legendary',
};

// ---------------------------------------------------------------------------
// Card interface – enriched with display-ready fields
// ---------------------------------------------------------------------------

export interface Card {
  // Core identity
  card_id: number;
  card_name: string;

  // Class / craft
  clan: number;
  card_class: string; // e.g. "Forestcraft"

  // Type
  char_type: number;
  card_type: string; // e.g. "Follower"

  // Tribe
  tribe: number;
  tribe_name: string;

  // Rarity
  rarity: number;
  rarity_name: string; // e.g. "Legendary"

  // Stats
  cost: number;
  atk: number;
  life: number;
  evo_atk: number;
  evo_life: number;

  // Skill text (may contain HTML markup)
  skill_text: string;
  evo_skill_text: string;

  // Metadata
  is_token: number;
  card_set_id: number;
  card_set_name: string;
  card_image_hash: string;
}

// ---------------------------------------------------------------------------
// Metadata lookup maps shipped with the card JSON
// ---------------------------------------------------------------------------

export interface CardMetadata {
  tribe_names: Record<string, string>;
  card_set_names: Record<string, string>;
  skill_names: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Raw JSON shape produced by the fetch_cards.py script
// ---------------------------------------------------------------------------

export interface CardData {
  metadata: CardMetadata & {
    skill_replace_text_names?: Record<string, string>;
    stats_list?: Record<string, unknown>;
  };
  cards: Record<string, Record<string, unknown>>;
  card_details: Record<string, Record<string, unknown>>;
  specific_effect_card_info: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Ranking types
// ---------------------------------------------------------------------------

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

export interface RankedCard extends Card {
  score: number;
  tier: Tier;
}

export interface Strategy {
  archetype: string;
  description: string;
  keyCards: RankedCard[];
  tips: string[];
}
