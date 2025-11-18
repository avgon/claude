"""Human-like behavior simulation for Etsy bot."""
import random
import time
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException, JavascriptException


class HumanBehavior:
    """Simulates human-like behavior to avoid bot detection."""

    def __init__(self, driver):
        """Initialize with WebDriver instance."""
        self.driver = driver

    def random_scroll(self, scroll_type: str = "random"):
        """
        Perform random scrolling behavior.

        Args:
            scroll_type: Type of scroll - "random", "down", "up", "read"
        """
        try:
            if scroll_type == "random":
                # Random scroll direction and amount
                scroll_amount = random.randint(200, 800)
                direction = random.choice([1, -1])
                self.driver.execute_script(f"window.scrollBy(0, {scroll_amount * direction})")

            elif scroll_type == "down":
                # Scroll down gradually like reading
                scroll_steps = random.randint(3, 7)
                for _ in range(scroll_steps):
                    scroll_amount = random.randint(150, 400)
                    self.driver.execute_script(f"window.scrollBy(0, {scroll_amount})")
                    time.sleep(random.uniform(0.5, 1.5))

            elif scroll_type == "up":
                # Scroll up
                scroll_amount = random.randint(200, 500)
                self.driver.execute_script(f"window.scrollBy(0, -{scroll_amount})")

            elif scroll_type == "read":
                # Simulate reading page - slow scroll down
                total_height = self.driver.execute_script("return document.body.scrollHeight")
                current_position = 0
                max_scroll = min(total_height, random.randint(800, 1500))

                while current_position < max_scroll:
                    scroll_amount = random.randint(100, 300)
                    self.driver.execute_script(f"window.scrollBy(0, {scroll_amount})")
                    current_position += scroll_amount
                    time.sleep(random.uniform(0.8, 2.0))

        except JavascriptException:
            # Page might not be fully loaded
            pass

    def hover_random_elements(self, selector: str = None, count: int = None):
        """
        Hover over random elements on the page.

        Args:
            selector: CSS selector for elements to hover (None = any clickable)
            count: Number of elements to hover (None = random 1-3)
        """
        try:
            if selector:
                elements = self.driver.find_elements("css selector", selector)
            else:
                # Find any visible elements
                elements = self.driver.find_elements("css selector", "img, a, button")

            if elements:
                hover_count = count if count else random.randint(1, 3)
                elements_to_hover = random.sample(elements, min(hover_count, len(elements)))

                actions = ActionChains(self.driver)
                for element in elements_to_hover:
                    try:
                        # Check if element is visible
                        if element.is_displayed():
                            actions.move_to_element(element).perform()
                            time.sleep(random.uniform(0.5, 1.5))
                    except:
                        continue

        except NoSuchElementException:
            pass

    def read_description(self):
        """Simulate reading product description."""
        try:
            # Scroll to description area
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2)")
            time.sleep(random.uniform(1, 2))

            # Slow scroll through description
            self.random_scroll("read")

            # Sometimes scroll back up
            if random.random() < 0.3:
                time.sleep(random.uniform(0.5, 1))
                self.random_scroll("up")

        except:
            pass

    def look_at_images(self):
        """Simulate looking at product images."""
        try:
            # Find image thumbnails or main image
            image_elements = self.driver.find_elements("css selector",
                "img[data-listing-image], img.wt-max-width-full, div[data-thumbnail-image]")

            if image_elements:
                # Look at 1-3 images
                images_to_view = random.sample(image_elements,
                    min(random.randint(1, 3), len(image_elements)))

                actions = ActionChains(self.driver)
                for img in images_to_view:
                    try:
                        if img.is_displayed():
                            # Scroll to image
                            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", img)
                            time.sleep(random.uniform(0.3, 0.7))

                            # Hover over image
                            actions.move_to_element(img).perform()
                            time.sleep(random.uniform(1, 3))

                            # Maybe click to enlarge (if clickable)
                            if random.random() < 0.3:
                                try:
                                    img.click()
                                    time.sleep(random.uniform(1, 2))
                                    # Close if modal opened
                                    try:
                                        close_btn = self.driver.find_element("css selector",
                                            "button[aria-label='Close'], .close-button")
                                        close_btn.click()
                                    except:
                                        # Press ESC
                                        from selenium.webdriver.common.keys import Keys
                                        from selenium.webdriver.common.by import By
                                        self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)
                                except:
                                    pass
                    except:
                        continue

        except:
            pass

    def check_reviews(self):
        """Simulate checking product reviews."""
        try:
            # Scroll to reviews section
            reviews_section = None
            try:
                reviews_section = self.driver.find_element("css selector",
                    "div[data-reviews-section], #reviews, .reviews-section")
            except:
                pass

            if reviews_section:
                # Scroll to reviews
                self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth'});",
                    reviews_section)
                time.sleep(random.uniform(1, 2))

                # Read some reviews
                self.random_scroll("down")
                time.sleep(random.uniform(2, 4))

        except:
            pass

    def check_seller_info(self):
        """Simulate checking seller information."""
        try:
            # Look for seller section
            seller_elements = self.driver.find_elements("css selector",
                "a[href*='/shop/'], .shop-name, .seller-info")

            if seller_elements and random.random() < 0.4:
                # Hover over seller info
                actions = ActionChains(self.driver)
                actions.move_to_element(seller_elements[0]).perform()
                time.sleep(random.uniform(1, 2))

        except:
            pass

    def browse_similar_items(self):
        """Simulate browsing similar items (decoy behavior)."""
        try:
            # Sometimes look at similar items
            if random.random() < 0.3:
                similar_items = self.driver.find_elements("css selector",
                    "a.listing-link, a[href*='/listing/']")

                if similar_items and len(similar_items) > 1:
                    # Pick a random similar item (not the target)
                    decoy_item = random.choice(similar_items[1:min(5, len(similar_items))])

                    # Hover over it
                    actions = ActionChains(self.driver)
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});",
                        decoy_item)
                    time.sleep(random.uniform(0.5, 1))
                    actions.move_to_element(decoy_item).perform()
                    time.sleep(random.uniform(1, 2))

        except:
            pass

    def natural_product_viewing(self, quick: bool = False):
        """
        Perform natural product viewing behavior.

        Args:
            quick: If True, perform quicker viewing (less thorough)
        """
        if quick:
            # Quick view - just scroll and look at images briefly
            behaviors = [
                (self.random_scroll, {"scroll_type": "down"}),
                (self.look_at_images, {}),
            ]
        else:
            # Full natural viewing
            behaviors = [
                (self.look_at_images, {}),
                (self.random_scroll, {"scroll_type": "down"}),
                (self.read_description, {}),
                (self.check_seller_info, {}),
                (self.check_reviews, {}),
            ]

        # Randomize order
        random.shuffle(behaviors)

        # Execute random subset of behaviors
        num_behaviors = random.randint(2, len(behaviors)) if not quick else random.randint(1, 2)
        selected_behaviors = behaviors[:num_behaviors]

        for behavior_func, kwargs in selected_behaviors:
            try:
                behavior_func(**kwargs)
                time.sleep(random.uniform(0.5, 1.5))
            except:
                continue

    def mouse_movement_to_element(self, element):
        """
        Move mouse to element in a human-like way.

        Args:
            element: WebElement to move to
        """
        try:
            actions = ActionChains(self.driver)

            # Get element location
            location = element.location
            size = element.size

            # Move to a random point within the element
            offset_x = random.randint(0, size['width'])
            offset_y = random.randint(0, size['height'])

            # Move with slight delay
            actions.move_to_element_with_offset(element, offset_x, offset_y).perform()
            time.sleep(random.uniform(0.1, 0.3))

        except:
            pass

    def random_pause(self, min_seconds: float = 1.0, max_seconds: float = 3.0):
        """Random pause with human-like timing."""
        pause_time = random.uniform(min_seconds, max_seconds)
        time.sleep(pause_time)
