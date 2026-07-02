import requests
from bs4 import BeautifulSoup
import datetime

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
url = "https://eksisozluk.com/basliklar/ara?SearchForm.Keywords=Roketsan&SearchForm.SortOrder=Date"

res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")
topics = soup.select("ul.topic-list li a")

for t in topics[:1]:
    topic_url = "https://eksisozluk.com" + t.get("href")
    print(f"Topic: {topic_url}")
    t_res = requests.get(topic_url, headers=headers)
    t_soup = BeautifulSoup(t_res.text, "html.parser")
    entries = t_soup.select("ul#entry-item-list li")
    for e in entries:
        date_el = e.select_one("a.entry-date")
        if date_el:
            raw_date = date_el.text
            print(f"RAW DATE: {repr(raw_date)}")
            date_text = raw_date.strip().split("~")[0].strip()
            print(f"CLEAN DATE: {repr(date_text)}")
            try:
                if len(date_text) > 10:
                    entry_date = datetime.datetime.strptime(date_text, "%d.%m.%Y %H:%M")
                else:
                    entry_date = datetime.datetime.strptime(date_text, "%d.%m.%Y")
                print(f"PARSED: {entry_date}")
            except Exception as ex:
                print(f"ERROR: {ex}")
        else:
            print("NO DATE EL")
        break

