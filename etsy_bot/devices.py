"""Device fingerprint utilities."""
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Iterable, List, Optional

from fake_useragent import UserAgent

from .config import DeviceProfile


@dataclass
class DeviceProfilePool:
    """Stores and rotates device profiles."""

    profiles: List[DeviceProfile]

    @classmethod
    def from_optional(cls, profiles: Optional[Iterable[DeviceProfile]]) -> "DeviceProfilePool":
        if profiles:
            return cls(list(profiles))
        # fallback to random generation via fake-useragent
        generated = []
        ua = UserAgent()
        for _ in range(5):
            generated.append(
                DeviceProfile(
                    user_agent=ua.random,
                    viewport_width=random.choice([1280, 1366, 1440, 1536, 1920]),
                    viewport_height=random.choice([720, 768, 800, 900, 1080]),
                    timezone=random.choice([
                        "America/New_York",
                        "America/Los_Angeles",
                        "Europe/Berlin",
                        "Europe/Stockholm",
                        "Asia/Tokyo",
                    ]),
                    language=random.choice(["en-US", "en-GB", "de-DE", "sv-SE"]),
                )
            )
        return cls(generated)

    def pick(self) -> DeviceProfile:
        return random.choice(self.profiles)
