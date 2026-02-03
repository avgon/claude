"""Setup script to initialize the AutoKidsFactory directory structure."""
from __future__ import annotations

from pathlib import Path


STRUCTURE = [
    "AutoKidsFactory/assets/character_reference",
    "AutoKidsFactory/assets/music",
    "AutoKidsFactory/comfy_workflows",
    "AutoKidsFactory/output/raw_videos",
    "AutoKidsFactory/output/audio",
    "AutoKidsFactory/output/final_renders",
    "AutoKidsFactory/src",
]


def create_structure(base_dir: Path) -> None:
    for relative_path in STRUCTURE:
        target = base_dir / relative_path
        target.mkdir(parents=True, exist_ok=True)


def main() -> None:
    base_dir = Path.cwd()
    create_structure(base_dir)
    print("AutoKidsFactory folder structure created.")


if __name__ == "__main__":
    main()
