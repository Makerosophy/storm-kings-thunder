#!/usr/bin/env python3
"""Validate an SKT image prompt contract without generating an image."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


SECTIONS = [
    "SCENE",
    "CAST",
    "CREATURES",
    "ENVIRONMENT",
    "SPATIAL RELATIONSHIPS",
    "CAMERA AND COMPOSITION",
    "LIGHTING AND PALETTE",
    "STYLE",
    "CONTINUITY CONSTRAINTS",
    "NEGATIVE CONSTRAINTS",
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("prompt", type=Path)
    parser.add_argument("--require", action="append", default=[])
    parser.add_argument("--forbid", action="append", default=[])
    args = parser.parse_args()

    text = args.prompt.read_text(encoding="utf-8")
    positions = {section: text.find(f"## {section}") for section in SECTIONS}
    missing_sections = [section for section, position in positions.items() if position < 0]
    ordered = not missing_sections and list(positions.values()) == sorted(positions.values())
    missing_terms = [term for term in args.require if term.casefold() not in text.casefold()]
    forbidden_terms = [term for term in args.forbid if term.casefold() in text.casefold()]

    result = {
        "passed": not missing_sections and ordered and not missing_terms and not forbidden_terms,
        "section_count": len(SECTIONS) - len(missing_sections),
        "sections_in_order": ordered,
        "missing_sections": missing_sections,
        "missing_required_terms": missing_terms,
        "present_forbidden_terms": forbidden_terms,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["passed"] else 1)


if __name__ == "__main__":
    main()
