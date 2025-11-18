"""Etsy product search, favorite, and cart actions."""
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
from utils.helpers import random_delay, log_message
import time


class EtsyActions:
    """Handles Etsy product actions (search, favorite, add to cart)."""

    ETSY_SEARCH_URL = "https://www.etsy.com/search"

    def __init__(self, driver):
        """Initialize with WebDriver instance."""
        self.driver = driver
        self.wait = WebDriverWait(driver, 15)

    def search_product(self, keyword: str) -> bool:
        """
        Search for a product using keyword.

        Args:
            keyword: Search keyword

        Returns:
            True if search successful, False otherwise
        """
        try:
            log_message(f"Searching for: {keyword}")

            # Navigate to Etsy home or use search directly
            self.driver.get("https://www.etsy.com")
            random_delay(2, 3)

            # Find and click search box
            search_box = self.wait.until(
                EC.presence_of_element_located((By.ID, "global-enhancements-search-query"))
            )

            # Clear and type keyword
            search_box.clear()
            self._human_type(search_box, keyword)
            random_delay(0.5, 1)

            # Submit search
            search_box.send_keys(Keys.RETURN)
            random_delay(3, 5)

            # Wait for search results to load
            try:
                self.wait.until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "div.wt-grid__item-xs-6")
                    )
                )
                log_message(f"Search results loaded for: {keyword}", "SUCCESS")
                return True
            except TimeoutException:
                log_message(f"No results found for: {keyword}", "WARNING")
                return False

        except Exception as e:
            log_message(f"Error during search: {str(e)}", "ERROR")
            return False

    def favorite_first_product(self) -> bool:
        """
        Favorite the first product in search results.

        Returns:
            True if favorited successfully, False otherwise
        """
        try:
            log_message("Attempting to favorite first product...")

            # Scroll a bit to ensure products are loaded
            self.driver.execute_script("window.scrollTo(0, 300)")
            random_delay(1, 2)

            # Find favorite buttons (hearts)
            favorite_buttons = self.driver.find_elements(
                By.CSS_SELECTOR, "button[aria-label*='Add'][aria-label*='Favorites']"
            )

            if not favorite_buttons:
                # Try alternative selector
                favorite_buttons = self.driver.find_elements(
                    By.CSS_SELECTOR, "button.favorite-listing-button"
                )

            if favorite_buttons:
                # Click the first favorite button
                first_favorite = favorite_buttons[0]

                # Scroll to element
                self.driver.execute_script("arguments[0].scrollIntoView(true);", first_favorite)
                random_delay(0.5, 1)

                # Try to click
                try:
                    first_favorite.click()
                except ElementClickInterceptedException:
                    # Try JavaScript click if normal click fails
                    self.driver.execute_script("arguments[0].click();", first_favorite)

                random_delay(1, 2)
                log_message("Product favorited successfully", "SUCCESS")
                return True
            else:
                log_message("No favorite buttons found", "WARNING")
                return False

        except Exception as e:
            log_message(f"Error favoriting product: {str(e)}", "ERROR")
            return False

    def add_first_product_to_cart(self) -> bool:
        """
        Add the first product in search results to cart.

        Returns:
            True if added successfully, False otherwise
        """
        try:
            log_message("Attempting to add first product to cart...")

            # Find product links
            product_links = self.driver.find_elements(
                By.CSS_SELECTOR, "a.listing-link"
            )

            if not product_links:
                # Try alternative selector
                product_links = self.driver.find_elements(
                    By.CSS_SELECTOR, "a[href*='/listing/']"
                )

            if not product_links:
                log_message("No product links found", "WARNING")
                return False

            # Click first product
            first_product = product_links[0]
            product_url = first_product.get_attribute('href')

            # Open product in same window
            self.driver.get(product_url)
            random_delay(3, 4)

            # Handle variations if they exist (size, color, etc.)
            self._handle_variations()

            # Find and click "Add to cart" button
            try:
                add_to_cart_btn = self.wait.until(
                    EC.element_to_be_clickable(
                        (By.CSS_SELECTOR, "button[data-add-to-cart-button]")
                    )
                )
                add_to_cart_btn.click()
                random_delay(2, 3)

                log_message("Product added to cart successfully", "SUCCESS")
                return True

            except TimeoutException:
                # Try alternative selector
                try:
                    add_to_cart_btn = self.driver.find_element(
                        By.XPATH, "//button[contains(text(), 'Add to cart')]"
                    )
                    add_to_cart_btn.click()
                    random_delay(2, 3)

                    log_message("Product added to cart successfully", "SUCCESS")
                    return True
                except NoSuchElementException:
                    log_message("Add to cart button not found", "WARNING")
                    return False

        except Exception as e:
            log_message(f"Error adding product to cart: {str(e)}", "ERROR")
            return False

    def _handle_variations(self):
        """Handle product variations (size, color, etc.) if present."""
        try:
            # Look for dropdown variations
            dropdowns = self.driver.find_elements(By.CSS_SELECTOR, "select.wt-select__element")

            for dropdown in dropdowns:
                # Get all options
                options = dropdown.find_elements(By.TAG_NAME, "option")
                if len(options) > 1:
                    # Select the second option (first is usually placeholder)
                    options[1].click()
                    random_delay(0.5, 1)

            # Look for button variations (color swatches, etc.)
            variation_buttons = self.driver.find_elements(
                By.CSS_SELECTOR, "button[data-variation-select-button]"
            )

            if variation_buttons:
                variation_buttons[0].click()
                random_delay(0.5, 1)

        except Exception as e:
            # Variations might not exist, continue silently
            pass

    def _human_type(self, element, text: str):
        """
        Type text in a human-like manner.

        Args:
            element: WebElement to type into
            text: Text to type
        """
        for char in text:
            element.send_keys(char)
            random_delay(0.05, 0.15)

    def process_keyword(self, keyword: str) -> dict:
        """
        Process a keyword: search, favorite, and add to cart.

        Args:
            keyword: Keyword to search for

        Returns:
            Dictionary with results of each action
        """
        results = {
            'keyword': keyword,
            'search_success': False,
            'favorite_success': False,
            'cart_success': False
        }

        # Search for product
        if self.search_product(keyword):
            results['search_success'] = True

            # Favorite first product
            if self.favorite_first_product():
                results['favorite_success'] = True

            # Go back to search results
            self.driver.back()
            random_delay(2, 3)

            # Add first product to cart
            if self.add_first_product_to_cart():
                results['cart_success'] = True

        return results
