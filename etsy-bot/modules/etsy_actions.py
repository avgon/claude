"""Etsy product search, favorite, and cart actions with human behavior."""
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    ElementClickInterceptedException,
    StaleElementReferenceException
)
from utils.helpers import random_delay, log_message
from utils.human_behavior import HumanBehavior
import time
import random


class EtsyActions:
    """Handles Etsy product actions with natural human behavior."""

    def __init__(self, driver):
        """Initialize with WebDriver instance."""
        self.driver = driver
        self.wait = WebDriverWait(driver, 20)
        self.human = HumanBehavior(driver)

    def search_with_keyword(self, keyword: str) -> bool:
        """
        Search for products using keyword.

        Args:
            keyword: Search keyword

        Returns:
            True if search successful, False otherwise
        """
        try:
            log_message(f"Searching for: {keyword}")

            # Navigate to Etsy home
            self.driver.get("https://www.etsy.com")
            random_delay(2, 4)

            # Sometimes browse a bit before searching (more natural)
            if random.random() < 0.3:
                self.human.random_scroll("down")
                random_delay(1, 2)

            # Find search box
            search_box = self.wait.until(
                EC.presence_of_element_located((By.ID, "global-enhancements-search-query"))
            )

            # Move mouse to search box
            self.human.mouse_movement_to_element(search_box)
            random_delay(0.3, 0.7)

            # Click and type keyword naturally
            search_box.click()
            random_delay(0.2, 0.5)
            search_box.clear()
            self._human_type(search_box, keyword)
            random_delay(0.5, 1.5)

            # Submit search
            search_box.send_keys(Keys.RETURN)
            random_delay(3, 5)

            # Wait for results to load
            try:
                self.wait.until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "div.wt-grid__item-xs-6, div.v2-listing-card")
                    )
                )
                log_message(f"Search results loaded for: {keyword}", "SUCCESS")

                # Natural browsing behavior on search results
                self.human.random_scroll("down")
                random_delay(1, 2)

                return True

            except TimeoutException:
                log_message(f"No results found for: {keyword}", "WARNING")
                return False

        except Exception as e:
            log_message(f"Error during search: {str(e)}", "ERROR")
            return False

    def find_listing_in_results(self, listing_id: str) -> bool:
        """
        Find specific listing in search results and click it.

        Args:
            listing_id: The Etsy listing ID to find

        Returns:
            True if listing found and opened, False otherwise
        """
        try:
            log_message(f"Looking for listing ID: {listing_id}")

            # Scroll through results to find the listing
            max_scrolls = 10
            scrolls = 0

            while scrolls < max_scrolls:
                # Find all listing links on current view
                listing_links = self.driver.find_elements(
                    By.CSS_SELECTOR,
                    f"a[href*='/listing/{listing_id}']"
                )

                if listing_links:
                    log_message(f"Found listing {listing_id}!", "SUCCESS")

                    # Sometimes hover over other listings first (decoy)
                    if random.random() < 0.4:
                        self.human.browse_similar_items()
                        random_delay(1, 2)

                    # Scroll to target listing
                    target_listing = listing_links[0]
                    self.driver.execute_script(
                        "arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});",
                        target_listing
                    )
                    random_delay(1, 2)

                    # Hover before clicking
                    self.human.mouse_movement_to_element(target_listing)
                    random_delay(0.5, 1.5)

                    # Click the listing
                    try:
                        target_listing.click()
                    except (ElementClickInterceptedException, StaleElementReferenceException):
                        # Try JavaScript click
                        self.driver.execute_script("arguments[0].click();", target_listing)

                    random_delay(3, 5)

                    # Wait for product page to load
                    try:
                        self.wait.until(
                            EC.presence_of_element_located(
                                (By.CSS_SELECTOR, "h1, div[data-listing-id]")
                            )
                        )
                        log_message("Product page loaded", "SUCCESS")
                        return True
                    except TimeoutException:
                        log_message("Product page failed to load", "ERROR")
                        return False

                # Listing not found yet, scroll down
                log_message(f"Scrolling to find listing... ({scrolls + 1}/{max_scrolls})")
                self.human.random_scroll("down")
                random_delay(2, 3)
                scrolls += 1

            log_message(f"Listing {listing_id} not found in search results", "WARNING")
            return False

        except Exception as e:
            log_message(f"Error finding listing: {str(e)}", "ERROR")
            return False

    def view_product_naturally(self, quick: bool = False):
        """
        View product page with natural human behavior.

        Args:
            quick: If True, do a quicker viewing
        """
        try:
            log_message("Viewing product naturally...")

            # Perform natural viewing behaviors
            self.human.natural_product_viewing(quick=quick)

            # Random additional pause
            self.human.random_pause(1, 3)

        except Exception as e:
            log_message(f"Error during natural viewing: {str(e)}", "WARNING")

    def add_to_favorites(self) -> bool:
        """
        Add current product to favorites.

        Returns:
            True if successfully favorited, False otherwise
        """
        try:
            log_message("Adding to favorites...")

            # Scroll to top where favorite button usually is
            self.driver.execute_script("window.scrollTo(0, 0)")
            random_delay(0.5, 1)

            # Try multiple selectors for favorite button
            favorite_selectors = [
                "button[aria-label*='Add to Favorites']",
                "button[data-add-to-favorite]",
                "button.favorite-button",
                "button[aria-label*='Favorite']",
                "button.wt-btn--icon[aria-label*='Add']"
            ]

            favorite_button = None
            for selector in favorite_selectors:
                try:
                    favorite_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if favorite_button and favorite_button.is_displayed():
                        break
                except NoSuchElementException:
                    continue

            if not favorite_button:
                log_message("Favorite button not found", "WARNING")
                return False

            # Check if already favorited
            aria_label = favorite_button.get_attribute('aria-label')
            if aria_label and 'Remove' in aria_label:
                log_message("Product already in favorites", "INFO")
                return True

            # Scroll to button
            self.driver.execute_script(
                "arguments[0].scrollIntoView({block: 'center'});",
                favorite_button
            )
            random_delay(0.3, 0.7)

            # Move mouse to button naturally
            self.human.mouse_movement_to_element(favorite_button)
            random_delay(0.5, 1)

            # Click favorite button
            try:
                favorite_button.click()
            except ElementClickInterceptedException:
                # Try JavaScript click
                self.driver.execute_script("arguments[0].click();", favorite_button)

            random_delay(1, 2)

            log_message("Product added to favorites!", "SUCCESS")
            return True

        except Exception as e:
            log_message(f"Error adding to favorites: {str(e)}", "ERROR")
            return False

    def add_to_cart(self) -> bool:
        """
        Add current product to cart.

        Returns:
            True if successfully added to cart, False otherwise
        """
        try:
            log_message("Adding to cart...")

            # Handle variations if they exist
            self._handle_variations()
            random_delay(0.5, 1)

            # Find "Add to cart" button
            add_to_cart_selectors = [
                "button[data-add-to-cart-button]",
                "button[aria-label*='Add to cart']",
                "button.add-to-cart-button",
                "button:has-text('Add to cart')"
            ]

            cart_button = None
            for selector in add_to_cart_selectors:
                try:
                    cart_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if cart_button and cart_button.is_displayed():
                        break
                except NoSuchElementException:
                    continue

            if not cart_button:
                # Try XPath as fallback
                try:
                    cart_button = self.driver.find_element(
                        By.XPATH,
                        "//button[contains(text(), 'Add to cart') or contains(@aria-label, 'Add to cart')]"
                    )
                except NoSuchElementException:
                    log_message("Add to cart button not found", "WARNING")
                    return False

            # Scroll to button
            self.driver.execute_script(
                "arguments[0].scrollIntoView({block: 'center'});",
                cart_button
            )
            random_delay(0.5, 1)

            # Move mouse to button
            self.human.mouse_movement_to_element(cart_button)
            random_delay(0.5, 1.5)

            # Click add to cart
            try:
                cart_button.click()
            except ElementClickInterceptedException:
                self.driver.execute_script("arguments[0].click();", cart_button)

            random_delay(2, 3)

            log_message("Product added to cart!", "SUCCESS")
            return True

        except Exception as e:
            log_message(f"Error adding to cart: {str(e)}", "ERROR")
            return False

    def _handle_variations(self):
        """Handle product variations (size, color, etc.) if present."""
        try:
            # Look for select dropdowns
            dropdowns = self.driver.find_elements(By.CSS_SELECTOR, "select.wt-select__element")

            for dropdown in dropdowns:
                if dropdown.is_displayed():
                    options = dropdown.find_elements(By.TAG_NAME, "option")
                    if len(options) > 1:
                        # Select random option (skip first if it's placeholder)
                        valid_options = [opt for opt in options[1:] if opt.is_enabled()]
                        if valid_options:
                            random.choice(valid_options).click()
                            random_delay(0.3, 0.7)

            # Look for button variations (color swatches, size buttons)
            variation_buttons = self.driver.find_elements(
                By.CSS_SELECTOR,
                "button[data-variation-select], input[type='radio'] + label"
            )

            if variation_buttons:
                # Select first available or random
                available = [btn for btn in variation_buttons if btn.is_displayed()]
                if available:
                    random.choice(available).click()
                    random_delay(0.3, 0.7)

        except Exception:
            # Variations might not exist or already selected
            pass

    def _human_type(self, element, text: str):
        """
        Type text in a human-like manner with random delays.

        Args:
            element: WebElement to type into
            text: Text to type
        """
        for char in text:
            element.send_keys(char)
            # Variable typing speed
            delay = random.uniform(0.05, 0.2)
            # Occasionally pause longer (thinking)
            if random.random() < 0.1:
                delay = random.uniform(0.3, 0.7)
            time.sleep(delay)

    def process_listing(self, listing_id: str, keywords: list) -> dict:
        """
        Process a listing: search with keywords, find listing, favorite, and add to cart.

        Args:
            listing_id: The Etsy listing ID
            keywords: List of keywords to search with

        Returns:
            Dictionary with results
        """
        results = {
            'listing_id': listing_id,
            'keyword_used': None,
            'found': False,
            'favorited': False,
            'in_cart': False
        }

        # Try each keyword until listing is found
        for keyword in keywords:
            log_message(f"\nTrying keyword: '{keyword}' for listing {listing_id}")

            # Search with keyword
            if not self.search_with_keyword(keyword):
                continue

            # Try to find listing in results
            if self.find_listing_in_results(listing_id):
                results['found'] = True
                results['keyword_used'] = keyword

                # View product naturally
                self.view_product_naturally(quick=random.choice([True, False]))
                random_delay(1, 2)

                # Add to favorites
                if self.add_to_favorites():
                    results['favorited'] = True
                    random_delay(1, 2)

                # Add to cart
                if self.add_to_cart():
                    results['in_cart'] = True

                # Successfully processed, break out of keyword loop
                break
            else:
                log_message(f"Listing not found with keyword '{keyword}', trying next...", "WARNING")

        if not results['found']:
            log_message(f"Listing {listing_id} not found with any of the keywords", "ERROR")

        return results
