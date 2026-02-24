#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["requests"]
# ///
"""Fetch all Shadowverse Worlds Beyond card data from the official API."""

import json
import os
import time
import requests

API_URL = "https://shadowverse-wb.com/web/CardList/cardList"
HEADERS = {
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://shadowverse-wb.com/web/cardList",
}
CLASSES = list(range(8))  # 0-7
PAGE_SIZE = 30
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "public")


def fetch_page(class_id: int, offset: int, lang: str) -> dict:
    """Fetch a single page of cards from the API."""
    params = {"offset": offset, "class": class_id, "lang": lang}
    headers = {**HEADERS, "lang": lang}

    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(API_URL, params=params, headers=headers, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except (requests.RequestException, json.JSONDecodeError) as e:
            if attempt < MAX_RETRIES - 1:
                print(f"  Retry {attempt + 1}/{MAX_RETRIES - 1} for class={class_id} offset={offset}: {e}")
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                raise


def fetch_all_cards(lang: str) -> dict:
    """Fetch all cards for a given language, returning combined data."""
    all_card_details = {}
    all_cards = {}
    all_specific_effects = {}
    metadata = {}
    total_fetched = 0

    for class_id in CLASSES:
        # First request to get count
        data = fetch_page(class_id, 0, lang)
        payload = data["data"]
        count = payload["count"]

        # Save metadata from first response (same across pages)
        if not metadata:
            metadata = {
                "tribe_names": payload.get("tribe_names", {}),
                "card_set_names": payload.get("card_set_names", {}),
                "skill_names": payload.get("skill_names", {}),
                "skill_replace_text_names": payload.get("skill_replace_text_names", {}),
                "stats_list": payload.get("stats_list", {}),
            }

        # Collect from first page
        all_cards.update(payload.get("cards", {}))
        all_card_details.update(payload.get("card_details", {}))
        all_specific_effects.update(payload.get("specific_effect_card_info", {}))
        page_count = len(payload.get("card_details", {}))
        total_fetched += page_count

        print(f"  [{lang}] class={class_id} offset=0 fetched={page_count} total_for_class={count}")

        # Paginate through remaining
        offset = PAGE_SIZE
        while offset < count:
            data = fetch_page(class_id, offset, lang)
            payload = data["data"]
            all_cards.update(payload.get("cards", {}))
            all_card_details.update(payload.get("card_details", {}))
            all_specific_effects.update(payload.get("specific_effect_card_info", {}))
            page_count = len(payload.get("card_details", {}))
            total_fetched += page_count

            print(f"  [{lang}] class={class_id} offset={offset} fetched={page_count}")
            offset += PAGE_SIZE
            time.sleep(0.3)  # Be polite to the server

        time.sleep(0.2)

    print(f"  [{lang}] Total unique card details: {len(all_card_details)}")

    return {
        "metadata": metadata,
        "cards": all_cards,
        "card_details": all_card_details,
        "specific_effect_card_info": all_specific_effects,
    }


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for lang in ("en", "cht"):
        print(f"Fetching cards for lang={lang}...")
        result = fetch_all_cards(lang)

        output_path = os.path.join(OUTPUT_DIR, f"cards_{lang}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"Saved {output_path} ({len(result['card_details'])} card details)\n")

    print("Done!")


if __name__ == "__main__":
    main()
