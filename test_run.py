import sys
sys.path.append("umay-scrapers")
from search_scraper import SearchScraper
s = SearchScraper()
print(s.fetch_eksi_sozluk("aselsan"))
