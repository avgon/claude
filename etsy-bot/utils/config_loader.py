"""Configuration file loader for Etsy bot."""
import os
from typing import List, Tuple


class ConfigLoader:
    """Loads and manages configuration files."""

    def __init__(self, config_dir: str = "config"):
        """Initialize config loader with config directory path."""
        self.config_dir = config_dir

    def load_emails(self) -> List[Tuple[str, str]]:
        """Load email:password pairs from emails.txt."""
        emails = []
        file_path = os.path.join(self.config_dir, "emails.txt")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Email list not found: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if ':' in line:
                        email, password = line.split(':', 1)
                        emails.append((email.strip(), password.strip()))

        if not emails:
            raise ValueError("No valid emails found in emails.txt")

        return emails

    def load_keywords(self) -> List[str]:
        """Load keywords from keywords.txt."""
        keywords = []
        file_path = os.path.join(self.config_dir, "keywords.txt")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Keywords list not found: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    keywords.append(line)

        if not keywords:
            raise ValueError("No valid keywords found in keywords.txt")

        return keywords

    def load_listings(self) -> List[dict]:
        """
        Load listing ID and keywords from listings.txt.

        Returns:
            List of dicts with 'listing_id' and 'keywords' (list of strings)
        """
        listings = []
        file_path = os.path.join(self.config_dir, "listings.txt")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Listings file not found: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if ':' in line:
                        listing_id, keywords_str = line.split(':', 1)
                        keywords = [k.strip() for k in keywords_str.split(',') if k.strip()]

                        if listing_id.strip() and keywords:
                            listings.append({
                                'listing_id': listing_id.strip(),
                                'keywords': keywords
                            })

        if not listings:
            raise ValueError("No valid listings found in listings.txt")

        return listings

    def load_proxies(self) -> List[dict]:
        """Load proxies from proxies.txt."""
        proxies = []
        file_path = os.path.join(self.config_dir, "proxies.txt")

        if not os.path.exists(file_path):
            print(f"Warning: Proxy list not found: {file_path}. Running without proxies.")
            return proxies

        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    parts = line.split(':')
                    if len(parts) >= 2:
                        proxy = {
                            'host': parts[0],
                            'port': parts[1],
                            'username': parts[2] if len(parts) > 2 else None,
                            'password': parts[3] if len(parts) > 3 else None
                        }
                        proxies.append(proxy)

        return proxies
