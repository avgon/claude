"""Main workflow for Etsy bot."""
from __future__ import annotations

import contextlib
import logging
from typing import Sequence

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from .config import BotConfig, DeviceProfile, ProxySettings
from .devices import DeviceProfilePool
from .humanizer import jitter_delay, natural_mouse_move, random_hover_click, soft_scroll
from .proxy import cycle_proxies
from .selenium_client import create_driver

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


class EtsyBot:
    def __init__(self, config: BotConfig):
        self.config = config
        self.device_pool = DeviceProfilePool.from_optional(config.device_profiles)
        self.proxy_iterator = cycle_proxies(config.proxies)

    def run(self) -> None:
        for user_index in range(self.config.users):
            for loop_index in range(self.config.loops_per_user):
                proxy = next(self.proxy_iterator)
                device = self.device_pool.pick()
                logger.info(
                    "Starting session user=%s loop=%s proxy=%s device=%s",
                    user_index + 1,
                    loop_index + 1,
                    getattr(proxy, "host", "direct"),
                    device.user_agent[:32],
                )
                try:
                    self._run_single_session(device=device, proxy=proxy)
                except Exception as exc:  # pylint: disable=broad-except
                    logger.exception("Session failed: %s", exc)

    def _run_single_session(self, device: DeviceProfile, proxy: ProxySettings | None) -> None:
        driver = create_driver(device=device, proxy=proxy, headless=self.config.headless)
        with contextlib.ExitStack() as stack:
            stack.callback(driver.quit)
            driver.get("https://www.etsy.com")
            jitter_delay(self.config.min_delay_seconds, self.config.max_delay_seconds)
            for keyword in self.config.keywords:
                if self._search_and_open_listing(driver, keyword):
                    break
            else:
                raise RuntimeError("Listing not found for provided keywords")

            self._engage_listing(driver)

    # --- search utilities ---
    def _search_and_open_listing(self, driver: WebDriver, keyword: str) -> bool:
        logger.info("Searching keyword '%s'", keyword)
        wait = WebDriverWait(driver, 20)
        try:
            search_box = wait.until(EC.presence_of_element_located((By.NAME, "search_query")))
        except TimeoutException:
            return False
        self._type_like_human(search_box, keyword)
        jitter_delay(self.config.min_delay_seconds, self.config.max_delay_seconds)
        search_box.send_keys(Keys.ENTER)
        try:
            wait.until(EC.presence_of_element_located((By.ID, "search-results")))
        except TimeoutException:
            return False
        natural_mouse_move(driver)
        listing_xpath = f"//a[contains(@href, '/listing/{self.config.listing_id}') and contains(@class, 'listing-link')]"
        try:
            listing_anchor = wait.until(EC.element_to_be_clickable((By.XPATH, listing_xpath)))
        except TimeoutException:
            return False
        listing_anchor.click()
        return True

    def _type_like_human(self, element, text: str) -> None:
        element.clear()
        for char in text:
            element.send_keys(char)
            jitter_delay(0.05, 0.25)

    # --- listing interaction ---
    def _engage_listing(self, driver: WebDriver) -> None:
        wait = WebDriverWait(driver, 20)
        jitter_delay(self.config.min_delay_seconds, self.config.max_delay_seconds)
        soft_scroll(driver, self.config.max_scroll_depth)
        natural_mouse_move(driver)
        self._favorite_listing(driver, wait)
        jitter_delay(self.config.min_delay_seconds, self.config.max_delay_seconds)
        self._add_to_cart(driver, wait)

    def _favorite_listing(self, driver: WebDriver, wait: WebDriverWait) -> None:
        selectors = [
            (By.CSS_SELECTOR, "button[data-favorite-button]") ,
            (By.CSS_SELECTOR, "button[aria-label*='Favorite']"),
        ]
        self._click_first_available(driver, wait, selectors)

    def _add_to_cart(self, driver: WebDriver, wait: WebDriverWait) -> None:
        selectors = [
            (By.CSS_SELECTOR, "button[data-selector='add-to-cart-button']"),
            (By.CSS_SELECTOR, "button[data-buy-box-listing-add-to-cart-button]") ,
            (By.CSS_SELECTOR, "button[aria-label*='Add to cart']"),
        ]
        self._click_first_available(driver, wait, selectors)

    def _click_first_available(
        self,
        driver: WebDriver,
        wait: WebDriverWait,
        selectors: Sequence[tuple[str, str]],
    ) -> None:
        for by, query in selectors:
            try:
                element = wait.until(EC.element_to_be_clickable((by, query)))
                random_hover_click(driver, [element])
                return
            except TimeoutException:
                continue
        raise RuntimeError(f"Could not interact with selectors: {selectors}")
