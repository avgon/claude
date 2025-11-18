# claude Etsy bot prototype

This workspace now contains a Selenium-based Etsy automation bot that can search for a given listing ID via multiple SEO keywords, open the listing, scroll through it, favorite it, and add it to the cart while rotating proxies and device fingerprints.

## Features
- Configurable keywords, listing ID, delay intervals, scroll depth, and session counts.
- Proxy rotation with optional authentication per proxy.
- Device profile pool with custom user agents, viewport sizes, locales, and timezones; automatic generation when not provided.
- Human-behavior simulation utilities (jittery typing, mouse movement, scrolling, hover/click).
- Chrome driver factory that applies common anti-detection tweaks (stealth scripts, navigator patches, locale/timezone overrides).

## Project layout
```
requirements.txt
config.example.yaml
main.py
etsy_bot/
  __init__.py
  config.py
  devices.py
  humanizer.py
  proxy.py
  selenium_client.py
  workflow.py
```

## Getting started
1. Install system dependencies:
   - Google Chrome / Chromium
   - Matching ChromeDriver binary in `PATH`
   - Python 3.10+
2. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `config.example.yaml` to `config.yaml` and edit values:
   - `listing_id`: the Etsy listing numeric ID (e.g., `1802588667`).
   - `keywords`: search phrases to locate the listing.
   - `users`/`loops_per_user`: how many user personas to simulate and how many passes each should perform.
   - `proxies`: optional HTTP proxies with credentials.
   - `device_profiles`: optional explicit device fingerprints.
4. Run the bot:
   ```bash
   python main.py --config config.yaml
   ```

## Notes
- Ensure each proxy is a high-quality residential endpoint; data-center proxies will usually be flagged quickly.
- Adjust the delay/scroll parameters if Etsy introduces new bot-detection heuristics.
- Expand `humanizer.py` to emulate cursor wiggles, key presses, or idling for even more human-like sessions.
- Consider integrating captcha solving or session warm-up flows (login, random browsing) when Etsy tightens restrictions.
