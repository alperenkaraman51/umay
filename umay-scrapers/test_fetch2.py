import sys, os
sys.path.append(os.path.abspath("umay-scrapers"))
from search_scraper import SearchScraper
scraper = SearchScraper()
res = scraper.fetch_eksi_sozluk("roketsan", "1d")
print("RESULTS:", res)
