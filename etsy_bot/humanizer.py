"""Human-like interaction helpers."""
from __future__ import annotations

import math
import random
import time
from typing import Iterable

from selenium.webdriver import ActionChains
from selenium.webdriver.remote.webdriver import WebDriver


def jitter_delay(min_delay: float, max_delay: float) -> None:
    time.sleep(random.uniform(min_delay, max_delay))


def natural_mouse_move(driver: WebDriver, start: tuple[int, int] | None = None) -> None:
    width = driver.get_window_size().get("width", 1280)
    height = driver.get_window_size().get("height", 720)
    path_points = random.randint(3, 6)
    actions = ActionChains(driver)
    for i in range(path_points):
        x = random.randint(0, width)
        y = random.randint(0, height)
        actions.move_by_offset(x, y)
        actions.pause(random.uniform(0.1, 0.4))
    actions.perform()


def soft_scroll(driver: WebDriver, max_depth: int) -> None:
    steps = random.randint(5, 10)
    for step in range(steps):
        portion = random.uniform(0.05, 0.2)
        offset = math.floor(portion * max_depth)
        driver.execute_script("window.scrollBy({top: arguments[0], behavior: 'smooth'});", offset)
        time.sleep(random.uniform(0.5, 1.2))


def random_hover_click(driver: WebDriver, elements: Iterable) -> None:
    elements = list(elements)
    if not elements:
        return
    target = random.choice(elements)
    actions = ActionChains(driver)
    actions.move_to_element(target)
    actions.pause(random.uniform(0.2, 0.5))
    actions.click(target)
    actions.perform()
