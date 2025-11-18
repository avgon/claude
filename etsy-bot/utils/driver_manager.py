"""WebDriver manager with proxy and mobile device simulation."""
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent


class DriverManager:
    """Manages Selenium WebDriver with proxy and mobile simulation."""

    # Mobile device configurations
    MOBILE_DEVICES = [
        {
            'name': 'iPhone 12 Pro',
            'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'width': 390,
            'height': 844,
            'pixel_ratio': 3
        },
        {
            'name': 'iPhone 13',
            'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            'width': 390,
            'height': 844,
            'pixel_ratio': 3
        },
        {
            'name': 'Samsung Galaxy S21',
            'user_agent': 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
            'width': 360,
            'height': 800,
            'pixel_ratio': 3
        },
        {
            'name': 'Samsung Galaxy S22',
            'user_agent': 'Mozilla/5.0 (Linux; Android 12; SM-S906B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Mobile Safari/537.36',
            'width': 360,
            'height': 800,
            'pixel_ratio': 3
        },
        {
            'name': 'Google Pixel 6',
            'user_agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',
            'width': 412,
            'height': 915,
            'pixel_ratio': 2.625
        }
    ]

    def __init__(self, headless: bool = False):
        """Initialize driver manager."""
        self.headless = headless
        self.ua = UserAgent()

    def create_driver(self, proxy: dict = None, use_mobile: bool = True):
        """
        Create a new WebDriver instance with proxy and mobile simulation.

        Args:
            proxy: Proxy configuration dict with host, port, username, password
            use_mobile: Whether to simulate mobile device

        Returns:
            WebDriver instance
        """
        options = Options()

        # Select random mobile device
        if use_mobile:
            device = random.choice(self.MOBILE_DEVICES)
            mobile_emulation = {
                "deviceMetrics": {
                    "width": device['width'],
                    "height": device['height'],
                    "pixelRatio": device['pixel_ratio']
                },
                "userAgent": device['user_agent']
            }
            options.add_experimental_option("mobileEmulation", mobile_emulation)
            print(f"Using mobile device: {device['name']}")
        else:
            # Use random desktop user agent
            options.add_argument(f'user-agent={self.ua.random}')

        # Configure proxy if provided
        if proxy:
            proxy_str = f"{proxy['host']}:{proxy['port']}"
            if proxy.get('username') and proxy.get('password'):
                proxy_str = f"{proxy['username']}:{proxy['password']}@{proxy_str}"

            options.add_argument(f'--proxy-server=http://{proxy_str}')
            print(f"Using proxy: {proxy['host']}:{proxy['port']}")

        # Additional options for stealth
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)

        # Disable images for faster loading
        prefs = {
            "profile.managed_default_content_settings.images": 2,
            "profile.default_content_setting_values.notifications": 2
        }
        options.add_experimental_option("prefs", prefs)

        if self.headless:
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')

        # Create driver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

        # Set additional properties to avoid detection
        driver.execute_cdp_cmd('Network.setUserAgentOverride', {
            "userAgent": device['user_agent'] if use_mobile else self.ua.random
        })
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)

        return driver
