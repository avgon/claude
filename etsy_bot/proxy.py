"""Proxy rotation utilities."""
from __future__ import annotations

import itertools
from typing import Iterable, Iterator, Optional

from .config import ProxySettings


def cycle_proxies(proxies: Optional[Iterable[ProxySettings]]) -> Iterator[ProxySettings | None]:
    if not proxies:
        while True:
            yield None
    else:
        for proxy in itertools.cycle(list(proxies)):
            yield proxy
