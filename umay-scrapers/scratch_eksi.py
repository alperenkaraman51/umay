import requests
from bs4 import BeautifulSoup

headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
url = "https://eksisozluk.com/basliklar/ara?SearchForm.Keywords=aselsan&SearchForm.SortOrder=Date"
res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")
topics = soup.select("ul.topic-list li a")
if not topics:
    print("No topics found or blocked.")
for t in topics[:2]:
    print("Topic:", t.text.strip())
    topic_url = "https://eksisozluk.com" + t.get("href")
    t_res = requests.get(topic_url, headers=headers)
    t_soup = BeautifulSoup(t_res.text, "html.parser")
    entries = t_soup.select("ul#entry-item-list li")
    for e in entries[-2:]:
        content = e.select_one(".content").text.strip()
        date_el = e.select_one("a.entry-date")
        date_text = date_el.text.strip() if date_el else "Unknown Date"
        print(" - Date:", date_text)
        print(" - Content:", content[:50])

