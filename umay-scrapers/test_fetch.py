import sys
import os
sys.path.append(os.path.abspath("umay-scrapers"))
from search_scraper import SearchScraper
scraper = SearchScraper()
res = scraper.fetch_eksi_sozluk("Roketsan", "1d")
for r in res:
    print(r["title"], r["timestamp"])
