import { CardClass, CardType, CardClassName } from '../types/card';
import type { Card, CardMetadata, RankedCard, Tier, Strategy } from '../types/card';

// ------------------------------------------------------------------ //
//  Keyword weights – higher = more impactful ability                  //
// ------------------------------------------------------------------ //

const KEYWORD_WEIGHTS: [RegExp, number][] = [
  // High-impact offensive
  [/\bStorm\b/i, 3.0],
  [/\bBane\b/i, 2.5],
  [/\bInvocation\b/i, 2.5],
  [/\bBanish/i, 2.0],
  // Defensive / sustain
  [/\bWard\b/i, 2.0],
  [/\bDrain\b/i, 2.0],
  // Tempo
  [/\bRush\b/i, 2.0],
  [/\bAccelerate/i, 2.0],
  [/\bUnion Burst/i, 2.0],
  [/\bReanimate/i, 2.0],
  // Flexibility / value
  [/\bCrystallize/i, 1.5],
  [/\bAmbush\b/i, 1.5],
  [/\bFanfare/i, 1.5],
  [/\bLast Words/i, 1.5],
  [/\bEnhance/i, 1.5],
  [/\bSpellboost/i, 1.5],
  [/\bTransform/i, 1.5],
  // Conditional / class mechanic
  [/\bClash/i, 1.0],
  [/\bStrike/i, 1.0],
  [/\bEarth Rite/i, 1.0],
  [/\bOverflow\b/i, 1.0],
  [/\bVengeance\b/i, 1.0],
  [/\bNecromancy/i, 1.0],
  [/\bResonance\b/i, 1.0],
  [/\bAvarice\b/i, 1.0],
  [/\bRally/i, 1.0],
  [/\bBurial Rite/i, 1.0],
  [/\bWrath\b/i, 1.0],
];

const TEXT_BONUSES: [RegExp, number][] = [
  [/can'?t be destroyed/i, 2.0],
  [/can'?t be targeted/i, 1.5],
  [/destroy (an?|all) (enemy|other)/i, 1.5],
  [/deal \d+ damage/i, 1.0],
  [/draw (a|\d+) card/i, 1.0],
  [/restore \d+ defense/i, 0.5],
  [/gain \+\d+\/\+\d+/i, 0.5],
];

// ------------------------------------------------------------------ //
//  Scoring helpers                                                    //
// ------------------------------------------------------------------ //

function scoreKeywords(text: string): { total: number; count: number } {
  let total = 0;
  let count = 0;
  for (const [re, weight] of KEYWORD_WEIGHTS) {
    if (re.test(text)) {
      total += weight;
      count++;
    }
  }
  for (const [re, weight] of TEXT_BONUSES) {
    if (re.test(text)) {
      total += weight;
    }
  }
  return { total, count };
}

function scoreStatEfficiency(card: Card): number {
  if (card.char_type !== CardType.Follower) return 0;
  const expected = card.cost * 2 + 1;
  const base = (card.atk + card.life - expected) * 0.5;
  const evoExpected = expected + 4;
  const evo = (card.evo_atk + card.evo_life - evoExpected) * 0.25;
  return base + evo;
}

function scoreCard(card: Card): number {
  const skillText = `${card.skill_text ?? ''} ${card.evo_skill_text ?? ''}`;
  const kw = scoreKeywords(skillText);
  let score = kw.total;

  // Multi-keyword versatility bonus
  if (kw.count >= 5) score += 2.0;
  else if (kw.count >= 3) score += 1.0;

  // Stat efficiency for followers
  score += scoreStatEfficiency(card);

  // Low-cost efficiency premium
  if (card.cost <= 1 && score > 2) score += 1.5;
  else if (card.cost <= 2 && score > 3) score += 1.0;

  // Rarity nudge
  if (card.rarity === 4) score += 0.5;
  else if (card.rarity === 3) score += 0.25;

  // Token penalty
  if (card.is_token) score -= 1.0;

  return score;
}

// ------------------------------------------------------------------ //
//  Tier assignment via percentiles                                    //
// ------------------------------------------------------------------ //

function assignTier(
  score: number,
  p: { p90: number; p75: number; p50: number; p25: number },
): Tier {
  if (score >= p.p90) return 'S';
  if (score >= p.p75) return 'A';
  if (score >= p.p50) return 'B';
  if (score >= p.p25) return 'C';
  return 'D';
}

function computePercentiles(scores: number[]) {
  const sorted = [...scores].sort((a, b) => a - b);
  const at = (p: number) => sorted[Math.floor(sorted.length * p)] ?? 0;
  return { p90: at(0.9), p75: at(0.75), p50: at(0.5), p25: at(0.25) };
}

// ------------------------------------------------------------------ //
//  Public API                                                         //
// ------------------------------------------------------------------ //

/** Score every card and assign a tier. */
export function rankCards(cards: Card[]): RankedCard[] {
  const scored = cards.map((c) => ({ ...c, score: scoreCard(c) }));
  const pct = computePercentiles(scored.map((c) => c.score));
  return scored
    .map((c) => ({ ...c, tier: assignTier(c.score, pct) }))
    .sort((a, b) => b.score - a.score);
}

/** Return the top N ranked cards for a given class. */
export function getTopCardsByClass(
  rankedCards: RankedCard[],
  classId: number,
  limit = 10,
): RankedCard[] {
  return rankedCards.filter((c) => c.clan === classId).slice(0, limit);
}

// ------------------------------------------------------------------ //
//  Class strategy recommendations                                     //
// ------------------------------------------------------------------ //

interface ClassArchetype {
  archetype: string;
  description: string;
  tips: string[];
  keywordAffinity: RegExp[];
}

const CLASS_ARCHETYPES: Record<number, ClassArchetype> = {
  [CardClass.Forestcraft]: {
    archetype: 'Combo Forest',
    description:
      'Swarm the board with Fairies and leverage combo effects that count cards played this turn.',
    tips: [
      'Play low-cost cards to build combo count before key payoffs.',
      'Prioritize cards that generate tokens for hand refuel.',
      'Use Accelerate effects for flexible combo turns.',
    ],
    keywordAffinity: [/Fairy/i, /combo/i, /cards? played/i, /Accelerate/i],
  },
  [CardClass.Swordcraft]: {
    archetype: 'Midrange Sword',
    description:
      'Build a resilient board with Officer and Commander synergies for steady pressure.',
    tips: [
      'Curve out with efficient followers each turn.',
      'Commander buffs stack \u2013 play them after establishing a board.',
      'Rally payoffs reward aggressive early drops.',
    ],
    keywordAffinity: [/Officer/i, /Commander/i, /Rally/i, /Storm/i],
  },
  [CardClass.Runecraft]: {
    archetype: 'Spellboost Rune',
    description:
      'Cast cheap spells to Spellboost powerful finishers and board clears.',
    tips: [
      'Mulligan for early Spellboost enablers.',
      'Earth Rite cards provide value \u2013 track your sigil count.',
      'Save board clears for wide enemy boards.',
    ],
    keywordAffinity: [/Spellboost/i, /Earth Rite/i, /spell/i],
  },
  [CardClass.Dragoncraft]: {
    archetype: 'Ramp Dragon',
    description:
      'Accelerate your play-point curve to deploy overwhelming threats ahead of schedule.',
    tips: [
      'Prioritise ramp (play-point gain) in the early game.',
      'Overflow unlocks powerful bonus effects \u2013 reach 7 PP quickly.',
      'High-cost Storm followers close games fast after ramping.',
    ],
    keywordAffinity: [/Overflow/i, /Play Point/i, /ramp/i, /Storm/i],
  },
  [CardClass.Shadowcraft]: {
    archetype: 'Midrange Shadow',
    description:
      'Trade efficiently, fuel Necromancy, and generate value from Last Words effects.',
    tips: [
      'Trade followers freely to build shadow count for Necromancy.',
      'Reanimate high-value targets for repeated impact.',
      'Burial Rite puts key followers into the graveyard on purpose.',
    ],
    keywordAffinity: [/Necromancy/i, /Last Words/i, /Reanimate/i, /Burial Rite/i],
  },
  [CardClass.Bloodcraft]: {
    archetype: 'Aggro Blood',
    description:
      'Aggressively lower your own defense to activate Vengeance, then deliver burst damage.',
    tips: [
      'Manage your defense total \u2013 Vengeance activates at 10 or below.',
      'Avarice rewards you for drawing extra cards each turn.',
      'Wrath payoffs trigger after taking self-damage 7 times.',
    ],
    keywordAffinity: [/Vengeance/i, /Avarice/i, /Wrath/i, /Drain/i],
  },
  [CardClass.Havencraft]: {
    archetype: 'Control Haven',
    description:
      'Stall with healing and Ward while countdown amulets build towards powerful effects.',
    tips: [
      'Countdown amulets delay effects \u2013 plan two or three turns ahead.',
      'Banish removes threats permanently \u2013 save it for key targets.',
      'Stack Ward followers to protect your leader.',
    ],
    keywordAffinity: [/Countdown/i, /Ward/i, /Banish/i, /restore/i],
  },
  [CardClass.Portalcraft]: {
    archetype: 'Artifact Portal',
    description:
      'Generate and recycle Artifacts while toggling Resonance for bonus effects.',
    tips: [
      'Resonance flips when your deck count is even \u2013 track it.',
      'Artifact tokens fuel board presence and synergy payoffs.',
      'Float plays to keep Resonance aligned for key turns.',
    ],
    keywordAffinity: [/Artifact/i, /Resonance/i],
  },
};

/** Build a strategy recommendation for a class based on its top-ranked cards. */
export function getStrategyForClass(
  classId: number,
  rankedCards: RankedCard[],
  _metadata?: CardMetadata,
): Strategy {
  const archetype = CLASS_ARCHETYPES[classId] ?? {
    archetype: CardClassName[classId] ?? 'Unknown',
    description: 'No specific archetype data available.',
    tips: [],
    keywordAffinity: [],
  };

  const classCards = rankedCards.filter((c) => c.clan === classId);
  const affinityCards = classCards.filter((c) => {
    const text = `${c.skill_text ?? ''} ${c.evo_skill_text ?? ''}`;
    return archetype.keywordAffinity.some((re) => re.test(text));
  });

  const keyCards =
    affinityCards.length >= 5 ? affinityCards.slice(0, 8) : classCards.slice(0, 8);

  return {
    archetype: archetype.archetype,
    description: archetype.description,
    keyCards,
    tips: archetype.tips,
  };
}
