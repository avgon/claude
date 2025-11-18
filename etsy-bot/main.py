#!/usr/bin/env python3
"""
Etsy Bot - Automated Etsy listing search, favorite, and cart addition with human behavior
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
    """Main Etsy bot orchestrator with natural human behavior."""

    def __init__(self, config_dir: str = "config", headless: bool = False):
        """Initialize the Etsy bot."""
        self.config_loader = ConfigLoader(config_dir)
        self.driver_manager = DriverManager(headless=headless)
        self.driver = None

    def run(self):
        """Run the bot with all configurations."""
        try:
            # Load configurations
            log_message("Loading configurations...")
            emails = self.config_loader.load_emails()
            listings = self.config_loader.load_listings()
            proxies = self.config_loader.load_proxies()

            log_message(f"Loaded {len(emails)} email account(s)")
            log_message(f"Loaded {len(listings)} listing(s) to process")
            log_message(f"Loaded {len(proxies)} proxy/proxies")

            # Display listings info
            for listing in listings:
                log_message(
                    f"  - Listing {listing['listing_id']}: "
                    f"{len(listing['keywords'])} keyword(s)"
                )

            # Process each email account
            for idx, (email, password) in enumerate(emails, 1):
                log_message(f"\n{'='*70}")
                log_message(f"Processing account {idx}/{len(emails)}: {email}")
                log_message(f"{'='*70}")

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
                        log_message(
                            f"Skipping account {email} due to login failure",
                            "WARNING"
                        )
                        self._close_driver()
                        continue

                    random_delay(2, 4)

                    # Process each listing
                    for listing_idx, listing in enumerate(listings, 1):
                        log_message(f"\n{'-'*70}")
                        log_message(
                            f"Processing listing {listing_idx}/{len(listings)}: "
                            f"ID {listing['listing_id']}"
                        )
                        log_message(
                            f"Keywords: {', '.join(listing['keywords'])}"
                        )
                        log_message(f"{'-'*70}")

                        # Process the listing
                        results = etsy_actions.process_listing(
                            listing['listing_id'],
                            listing['keywords']
                        )

                        # Log results
                        self._log_results(results)

                        # Random delay between listings (important for natural behavior)
                        if listing_idx < len(listings):
                            delay_time = random.randint(5, 15)
                            log_message(
                                f"\nWaiting {delay_time}s before next listing..."
                            )
                            random_delay(delay_time - 1, delay_time + 1)

                    # Logout
                    log_message("\nAll listings processed for this account")
                    etsy_login.logout()
                    random_delay(2, 3)

                except Exception as e:
                    log_message(
                        f"Error processing account {email}: {str(e)}",
                        "ERROR"
                    )

                finally:
                    # Close driver after each account
                    self._close_driver()

                # Delay between accounts (very important for avoiding detection)
                if idx < len(emails):
                    delay_time = random.randint(10, 20)
                    log_message(f"\nWaiting {delay_time}s before next account...")
                    random_delay(delay_time - 2, delay_time + 2)

            log_message("\n" + "="*70)
            log_message("Bot execution completed successfully!", "SUCCESS")
            log_message("="*70)

        except FileNotFoundError as e:
            log_message(f"Configuration file error: {str(e)}", "ERROR")
            log_message("Please check that all config files exist in the config/ directory", "ERROR")
        except ValueError as e:
            log_message(f"Configuration value error: {str(e)}", "ERROR")
        except Exception as e:
            log_message(f"Fatal error: {str(e)}", "ERROR")
            self._close_driver()

    def _log_results(self, results: dict):
        """Log the results of processing a listing."""
        listing_id = results['listing_id']

        if results['found']:
            log_message(
                f"✓ Listing {listing_id} found with keyword: '{results['keyword_used']}'",
                "SUCCESS"
            )
            if results['favorited']:
                log_message("  ✓ Added to favorites", "SUCCESS")
            else:
                log_message("  ✗ Failed to add to favorites", "WARNING")

            if results['in_cart']:
                log_message("  ✓ Added to cart", "SUCCESS")
            else:
                log_message("  ✗ Failed to add to cart", "WARNING")
        else:
            log_message(
                f"✗ Listing {listing_id} not found with any keywords",
                "ERROR"
            )

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
        description='Etsy Bot - Natural product engagement automation',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                    # Run with default settings
  python main.py --headless        # Run in headless mode
  python main.py --config custom   # Use custom config directory

Config files (in config/ directory):
  - emails.txt: email:password (one per line)
  - listings.txt: listing_id:keyword1,keyword2,keyword3 (one per line)
  - proxies.txt: ip:port or ip:port:user:pass (one per line, optional)
        """
    )
    parser.add_argument(
        '--headless',
        action='store_true',
        help='Run browser in headless mode (no GUI)'
    )
    parser.add_argument(
        '--config',
        type=str,
        default='config',
        help='Path to config directory (default: config)'
    )

    args = parser.parse_args()

    # Display banner
    print("\n" + "="*70)
    print(" "*25 + "ETSY BOT v2.0")
    print(" "*18 + "Natural Human Behavior Edition")
    print("="*70)
    print("\nFeatures:")
    print("  ✓ Listing ID-based targeting")
    print("  ✓ Multiple keyword search strategies")
    print("  ✓ Human-like browsing patterns")
    print("  ✓ Random delays and behaviors")
    print("  ✓ Mobile device simulation")
    print("  ✓ Proxy rotation support")
    print("="*70 + "\n")

    # Create and run bot
    bot = EtsyBot(
        config_dir=args.config,
        headless=args.headless
    )

    try:
        bot.run()
    except KeyboardInterrupt:
        log_message("\n\nBot stopped by user (Ctrl+C)", "WARNING")
        bot._close_driver()
        sys.exit(0)


if __name__ == "__main__":
    main()
