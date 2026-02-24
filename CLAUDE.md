# Shadowverse Card Ranking & Strategy

## Project Overview
Interactive web app for Shadowverse: Worlds Beyond card rankings, tier lists, and class strategies with dual language support (English / Traditional Chinese).

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 7 + Tailwind CSS 4
- **i18n**: react-i18next (EN / zh-TW)
- **Icons**: lucide-react
- **Data Fetcher**: Python 3.10+ (managed via `uv`)

## Commands
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript check + production build
npm run preview      # Preview production build
npm run fetch-data   # Re-fetch latest cards from Shadowverse WB API (uses uv)
```

## Project Structure
```
scripts/
  fetch_cards.py          # Fetches card data from SV WB API (EN + zh-TW)
  requirements.txt        # Python deps (requests)
public/
  cards_en.json           # English card data (auto-generated)
  cards_cht.json          # Traditional Chinese card data (auto-generated)
src/
  types/card.ts           # Card interfaces, enums (CardClass, CardType, CardRarity, Tier, RankedCard)
  utils/
    ranking.ts            # Ranking algorithm (keyword analysis + stat efficiency)
    filters.ts            # Card filter & sort utilities
  hooks/
    useCards.ts            # React hook: loads JSON, parses nested structure, applies ranking
  i18n/index.ts           # i18next config with EN + zh-TW translations
  components/
    Header.tsx            # App header with language toggle
    FilterBar.tsx         # Class/cost/rarity/search/sort filters
    CardGrid.tsx          # Responsive card grid with images
    TierList.tsx          # S/A/B/C/D tier list view
    StrategyPanel.tsx     # Per-class strategy recommendations
    CardDetail.tsx        # Card detail modal
  App.tsx                 # Main app with tab navigation
  index.css               # Tailwind imports + dark theme variables
```

## Data Source
- **API**: `https://shadowverse-wb.com/web/CardList/cardList`
  - Headers: `X-Requested-With: XMLHttpRequest`, `Referer: https://shadowverse-wb.com/web/cardList`, `lang: en|cht`
  - Params: `offset` (paginate by 30), `class` (0-7), `cost` (0-10), `lang` (en|cht)
- **JSON structure**: `{ metadata, cards, card_details, specific_effect_card_info }`
  - Card details are nested: `card_details.{id}.common` and `card_details.{id}.evo`
  - Key fields in `common`: `card_id`, `name`, `cost`, `atk`, `life`, `type`, `class`, `rarity`, `tribes`, `skill_text`, `card_image_hash`, `is_token`

## Card Image URLs
- English: `https://shadowverse-wb.com/uploads/card_image/eng/card/{card_image_hash}.png`
- Traditional Chinese: `https://shadowverse-wb.com/uploads/card_image/cht/card/{card_image_hash}.png`

## Class IDs
0=Forestcraft/精靈, 1=Swordcraft/皇家護衛, 2=Runecraft/巫師, 3=Dragoncraft/龍族, 4=Shadowcraft/死靈法師, 5=Bloodcraft/吸血鬼, 6=Havencraft/主教, 7=Portalcraft/超越者

## Conventions
- Dark purple/indigo theme (gaming aesthetic)
- Token cards are filtered out from display
- Ranking tiers: S/A/B/C/D based on score percentiles
- All user-facing text must use i18n translation keys
- Python scripts use `uv` inline script metadata for dependency management
