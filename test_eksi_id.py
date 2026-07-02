import requests
from bs4 import BeautifulSoup
url = "https://eksisozluk.com/aselsan--46255"
headers = {"User-Agent": "Mozilla/5.0"}
res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")
entries = soup.select("ul#entry-item-list li")
for e in entries[-1:]:
    print("ID:", e.get("data-id"))
