import requests
from bs4 import BeautifulSoup
import urllib.parse
keyword = "aselsan"
url = f"https://eksisozluk.com/basliklar/ara?SearchForm.Keywords={urllib.parse.quote(keyword)}&SearchForm.SortOrder=Date"
headers = {"User-Agent": "Mozilla/5.0"}
res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")
topics = soup.select("ul.topic-list li a")
for t in topics[:2]:
    print(t.get("href"))
