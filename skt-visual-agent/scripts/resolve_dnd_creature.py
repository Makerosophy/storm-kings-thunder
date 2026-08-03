#!/usr/bin/env python3
"""Resolve a creature through the free D&D 5e SRD API without local persistence."""

from __future__ import annotations

import argparse
import json
import re
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


API_BASE = "https://www.dnd5eapi.co/api/2014/monsters"
SITE_BASE = "https://www.dnd5eapi.co"


def slugify(value: str) -> str:
    value = value.casefold().strip().replace("’", "'")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def names(items: list[dict[str, Any]]) -> list[str]:
    return [str(item.get("name", "")) for item in items if item.get("name")]


def normalize(data: dict[str, Any], endpoint: str) -> dict[str, Any]:
    armor = data.get("armor_class") or []
    armor_summary = [
        {
            "type": item.get("type"),
            "value": item.get("value"),
            "description": item.get("desc"),
            "armor": names(item.get("armor") or []),
        }
        for item in armor
    ]
    image_path = data.get("image")
    return {
        "found": True,
        "provider": "dnd5eapi-2014",
        "endpoint": endpoint,
        "index": data.get("index"),
        "name": data.get("name"),
        "description": data.get("desc"),
        "size": data.get("size"),
        "type": data.get("type"),
        "alignment": data.get("alignment"),
        "armor": armor_summary,
        "movement": data.get("speed") or {},
        "senses": data.get("senses") or {},
        "languages": data.get("languages"),
        "damage_resistances": data.get("damage_resistances") or [],
        "damage_immunities": data.get("damage_immunities") or [],
        "special_abilities": names(data.get("special_abilities") or []),
        "actions": names(data.get("actions") or []),
        "image": f"{SITE_BASE}{image_path}" if image_path else None,
        "drawing_warning": (
            "Statistics are not a complete anatomical description. Use the API image, "
            "campaign registry, and explicit scene evidence before drawing."
        ),
    }


def resolve(query: str, timeout: float) -> dict[str, Any]:
    index = slugify(query)
    endpoint = f"{API_BASE}/{index}"
    request = Request(endpoint, headers={"User-Agent": "skt-visual-agent/1.0"})
    try:
        with urlopen(request, timeout=timeout) as response:
            data = json.load(response)
    except HTTPError as error:
        if error.code == 404:
            return {
                "found": False,
                "provider": "dnd5eapi-2014",
                "query": query,
                "index": index,
                "endpoint": endpoint,
                "reason": "not-found-in-srd",
                "fallback": "Use data/creatures.yaml, campaign sources, then conservative inference.",
            }
        raise
    return normalize(data, endpoint)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("creature", help="Creature name, for example: fire giant")
    parser.add_argument("--timeout", type=float, default=15.0)
    args = parser.parse_args()
    try:
        result = resolve(args.creature, args.timeout)
    except (HTTPError, URLError, TimeoutError) as error:
        print(
            json.dumps(
                {
                    "found": False,
                    "provider": "dnd5eapi-2014",
                    "query": args.creature,
                    "reason": "api-unavailable",
                    "error": str(error),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        sys.exit(2)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
