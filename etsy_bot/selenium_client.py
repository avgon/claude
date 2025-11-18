"""Selenium driver factory tailored for anti-detection."""
from __future__ import annotations

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from .config import DeviceProfile, ProxySettings


STEALTH_SCRIPT = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
window.chrome = {...window.chrome, runtime: {}};
Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
"""


def _apply_stealth(driver):
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": STEALTH_SCRIPT},
    )


def create_driver(
    device: DeviceProfile,
    proxy: ProxySettings | None,
    headless: bool,
) -> webdriver.Chrome:
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-infobars")
    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument(f"--lang={device.language}")
    if headless:
        options.add_argument("--headless=new")
    if proxy:
        options.add_argument(f"--proxy-server=http://{proxy.selenium_argument}")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    driver = webdriver.Chrome(options=options)
    driver.set_window_size(device.viewport_width, device.viewport_height)

    _apply_stealth(driver)
    driver.execute_cdp_cmd(
        "Network.setUserAgentOverride",
        {"userAgent": device.user_agent, "acceptLanguage": device.language, "platform": ""},
    )
    driver.execute_cdp_cmd("Emulation.setLocaleOverride", {"locale": device.language})
    driver.execute_cdp_cmd("Emulation.setTimezoneOverride", {"timezoneId": device.timezone})
    return driver
