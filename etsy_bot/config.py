"""Configuration models for the Etsy bot."""
from __future__ import annotations

from pathlib import Path
from typing import List, Optional

import yaml
from pydantic import BaseModel, Field, PositiveInt, field_validator


class ProxySettings(BaseModel):
    host: str
    port: PositiveInt
    username: Optional[str] = None
    password: Optional[str] = None

    @property
    def selenium_argument(self) -> str:
        creds = f"{self.username}:{self.password}@" if self.username and self.password else ""
        return f"{creds}{self.host}:{self.port}"


class DeviceProfile(BaseModel):
    user_agent: str
    viewport_width: PositiveInt = Field(default=1280)
    viewport_height: PositiveInt = Field(default=720)
    timezone: str = Field(default="UTC")
    language: str = Field(default="en-US")


class BotConfig(BaseModel):
    listing_id: str
    keywords: List[str]
    users: PositiveInt = Field(default=1)
    loops_per_user: PositiveInt = Field(default=1)
    min_delay_seconds: float = Field(default=1.5)
    max_delay_seconds: float = Field(default=4.0)
    max_scroll_depth: int = Field(default=2000)
    headless: bool = Field(default=False)
    proxies: List[ProxySettings] | None = None
    device_profiles: List[DeviceProfile] | None = None

    @field_validator("keywords")
    @classmethod
    def validate_keywords(cls, value: List[str]) -> List[str]:
        cleaned = [keyword.strip() for keyword in value if keyword.strip()]
        if not cleaned:
            raise ValueError("At least one keyword is required")
        return cleaned

    @field_validator("max_delay_seconds")
    @classmethod
    def validate_delays(cls, value: float, values) -> float:
        min_delay = values.data.get("min_delay_seconds", 0)
        if value <= min_delay:
            raise ValueError("max_delay_seconds must be greater than min_delay_seconds")
        return value


def load_config(path: str | Path) -> BotConfig:
    config_path = Path(path)
    raw = yaml.safe_load(config_path.read_text())
    return BotConfig(**raw)
