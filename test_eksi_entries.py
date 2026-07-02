import requests
from bs4 import BeautifulSoup
url = "https://eksisozluk.com/aselsan--46255"
headers = {"User-Agent": "Mozilla/5.0"}
response = requests.get(url, headers=headers)
if response.status_code == 200:
    soup = BeautifulSoup(response.text, "html.parser")
    entries = soup.select("ul#entry-item-list li")
    for e in entries[:2]:
        text = e.select_one(".content").text.strip()
        print("ENTRY:", text[:100])
