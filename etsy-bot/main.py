#!/usr/bin/env python3
"""
Etsy Bot - Automated Etsy product search, favorite, and cart addition
"""
import os
import sys
import random
import argparse
from dotenv import load_dotenv

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils import ConfigLoader, DriverManager, random_delay, log_message
from modules import EtsyLogin, EtsyActions


class EtsyBot:
    """Main Etsy bot orchestrator."""

    def __init__(self, config_dir: str = "config", headless: bool = False):
        """Initialize the Etsy bot."""
        self.config_loader = ConfigLoader(config_dir)
        self.driver_manager = DriverManager(headless=headless)
        self.driver = None
        self.current_session = 0

    def run(self):
        """Run the bot with all configurations."""
        try:
            # Load configurations
            log_message("Loading configurations...")
            emails = self.config_loader.load_emails()
            keywords = self.config_loader.load_keywords()
            proxies = self.config_loader.load_proxies()

            log_message(f"Loaded {len(emails)} email(s)")
            log_message(f"Loaded {len(keywords)} keyword(s)")
            log_message(f"Loaded {len(proxies)} proxy/proxies")

            # Process each email account
            for idx, (email, password) in enumerate(emails, 1):
                log_message(f"\n{'='*60}")
                log_message(f"Processing account {idx}/{len(emails)}: {email}")
                log_message(f"{'='*60}")

                # Select random proxy if available
                proxy = random.choice(proxies) if proxies else None

                # Create driver with mobile simulation and proxy
                try:
                    self.driver = self.driver_manager.create_driver(
                        proxy=proxy,
                        use_mobile=True
                    )

                    # Initialize modules
                    etsy_login = EtsyLogin(self.driver)
                    etsy_actions = EtsyActions(self.driver)

                    # Login
                    if not etsy_login.login(email, password):
                        log_message(f"Skipping account {email} due to login failure", "WARNING")
                        self._close_driver()
                        continue

                    random_delay(2, 4)

                    # Process each keyword
                    for keyword_idx, keyword in enumerate(keywords, 1):
                        log_message(f"\n--- Keyword {keyword_idx}/{len(keywords)}: {keyword} ---")

                        results = etsy_actions.process_keyword(keyword)

                        # Log results
                        log_message(f"Search: {'✓' if results['search_success'] else '✗'}")
                        log_message(f"Favorite: {'✓' if results['favorite_success'] else '✗'}")
                        log_message(f"Cart: {'✓' if results['cart_success'] else '✗'}")

                        # Random delay between keywords
                        if keyword_idx < len(keywords):
                            random_delay(3, 6)

                    # Logout
                    etsy_login.logout()
                    random_delay(2, 3)

                except Exception as e:
                    log_message(f"Error processing account {email}: {str(e)}", "ERROR")

                finally:
                    # Close driver after each account
                    self._close_driver()

                # Delay between accounts
                if idx < len(emails):
                    log_message("\nWaiting before next account...")
                    random_delay(5, 10)

            log_message("\n" + "="*60)
            log_message("Bot execution completed!", "SUCCESS")
            log_message("="*60)

        except Exception as e:
            log_message(f"Fatal error: {str(e)}", "ERROR")
            self._close_driver()

    def _close_driver(self):
        """Close the WebDriver if it exists."""
        if self.driver:
            try:
                self.driver.quit()
                log_message("Browser closed")
            except Exception as e:
                log_message(f"Error closing browser: {str(e)}", "WARNING")
            finally:
                self.driver = None


def main():
    """Main entry point."""
    # Load environment variables
    load_dotenv()

    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='Etsy Bot - Automated product search, favorite, and cart addition'
    )
    parser.add_argument(
        '--headless',
        action='store_true',
        help='Run browser in headless mode'
    )
    parser.add_argument(
        '--config',
        type=str,
        default='config',
        help='Path to config directory (default: config)'
    )

    args = parser.parse_args()

    # Display banner
    print("\n" + "="*60)
    print(" "*20 + "ETSY BOT")
    print("="*60 + "\n")

    # Create and run bot
    bot = EtsyBot(
        config_dir=args.config,
        headless=args.headless
    )

    try:
        bot.run()
    except KeyboardInterrupt:
        log_message("\nBot stopped by user", "WARNING")
        bot._close_driver()
        sys.exit(0)


if __name__ == "__main__":
    main()
