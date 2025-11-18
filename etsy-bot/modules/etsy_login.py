"""Etsy login functionality."""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from utils.helpers import random_delay, log_message


class EtsyLogin:
    """Handles Etsy login operations."""

    ETSY_URL = "https://www.etsy.com"
    SIGN_IN_URL = "https://www.etsy.com/signin"

    def __init__(self, driver):
        """Initialize with WebDriver instance."""
        self.driver = driver
        self.wait = WebDriverWait(driver, 15)

    def login(self, email: str, password: str) -> bool:
        """
        Login to Etsy with provided credentials.

        Args:
            email: User email
            password: User password

        Returns:
            True if login successful, False otherwise
        """
        try:
            log_message(f"Attempting login for: {email}")

            # Navigate to sign in page
            self.driver.get(self.SIGN_IN_URL)
            random_delay(2, 4)

            # Wait for email field and enter email
            email_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "join_neu_email_field"))
            )
            email_field.clear()
            self._human_type(email_field, email)
            random_delay(1, 2)

            # Click continue or submit button
            try:
                # Try to find and click the continue button
                continue_btn = self.driver.find_element(By.NAME, "submit_attempt")
                continue_btn.click()
                random_delay(2, 3)
            except NoSuchElementException:
                log_message("Continue button not found, trying alternative method", "WARNING")

            # Wait for password field and enter password
            try:
                password_field = self.wait.until(
                    EC.presence_of_element_located((By.ID, "join_neu_password_field"))
                )
                password_field.clear()
                self._human_type(password_field, password)
                random_delay(1, 2)
            except TimeoutException:
                log_message("Password field not found immediately", "WARNING")
                # Sometimes the password field appears on the same page
                password_field = self.driver.find_element(By.ID, "password")
                password_field.clear()
                self._human_type(password_field, password)
                random_delay(1, 2)

            # Click sign in button
            try:
                sign_in_btn = self.driver.find_element(By.NAME, "submit_attempt")
                sign_in_btn.click()
            except NoSuchElementException:
                # Alternative selectors
                sign_in_btn = self.driver.find_element(
                    By.XPATH, "//button[@type='submit' and contains(text(), 'Sign in')]"
                )
                sign_in_btn.click()

            random_delay(3, 5)

            # Check if login was successful
            if self._is_logged_in():
                log_message(f"Successfully logged in as: {email}", "SUCCESS")
                return True
            else:
                log_message(f"Login failed for: {email}", "ERROR")
                return False

        except TimeoutException as e:
            log_message(f"Timeout during login: {str(e)}", "ERROR")
            return False
        except Exception as e:
            log_message(f"Error during login: {str(e)}", "ERROR")
            return False

    def _is_logged_in(self) -> bool:
        """
        Check if user is logged in.

        Returns:
            True if logged in, False otherwise
        """
        try:
            # Check for user menu or account icon
            self.wait.until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "button[aria-label='Account menu']")
                )
            )
            return True
        except TimeoutException:
            try:
                # Alternative check: look for sign out link
                self.driver.find_element(By.LINK_TEXT, "Sign out")
                return True
            except NoSuchElementException:
                return False

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

    def logout(self) -> bool:
        """
        Logout from Etsy.

        Returns:
            True if logout successful, False otherwise
        """
        try:
            log_message("Logging out...")

            # Click account menu
            account_menu = self.wait.until(
                EC.element_to_be_clickable(
                    (By.CSS_SELECTOR, "button[aria-label='Account menu']")
                )
            )
            account_menu.click()
            random_delay(1, 2)

            # Click sign out
            sign_out_link = self.wait.until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Sign out"))
            )
            sign_out_link.click()
            random_delay(2, 3)

            log_message("Logged out successfully", "SUCCESS")
            return True

        except Exception as e:
            log_message(f"Error during logout: {str(e)}", "ERROR")
            return False
