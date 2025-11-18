"""Helper functions for the Etsy bot."""
import time
import random
from datetime import datetime


def random_delay(min_seconds: float = 2, max_seconds: float = 5):
    """
    Wait for a random amount of time to simulate human behavior.

    Args:
        min_seconds: Minimum delay in seconds
        max_seconds: Maximum delay in seconds
    """
    delay = random.uniform(min_seconds, max_seconds)
    time.sleep(delay)


def log_message(message: str, level: str = "INFO"):
    """
    Print a formatted log message with timestamp.

    Args:
        message: The message to log
        level: Log level (INFO, WARNING, ERROR, SUCCESS)
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    colors = {
        "INFO": "\033[94m",      # Blue
        "WARNING": "\033[93m",   # Yellow
        "ERROR": "\033[91m",     # Red
        "SUCCESS": "\033[92m",   # Green
    }
    reset = "\033[0m"

    color = colors.get(level, colors["INFO"])
    print(f"{color}[{timestamp}] [{level}] {message}{reset}")
