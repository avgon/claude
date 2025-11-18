"""Entry point for running the Etsy bot."""
from __future__ import annotations

import argparse
import logging

from etsy_bot.config import load_config
from etsy_bot.workflow import EtsyBot


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Etsy Selenium bot")
    parser.add_argument("--config", default="config.yaml", help="Path to YAML configuration file")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config = load_config(args.config)
    logging.info("Loaded configuration for listing %s", config.listing_id)
    bot = EtsyBot(config)
    bot.run()


if __name__ == "__main__":
    main()
