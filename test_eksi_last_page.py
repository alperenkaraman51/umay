import requests
from bs4 import BeautifulSoup
url = "https://eksisozluk.com/aselsan--46255"
headers = {"User-Agent": "Mozilla/5.0"}
res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")
pager = soup.select_one(".pager")
if pager and pager.has_attr("data-pagecount"):
    last_page = pager["data-pagecount"]
    print(f"Last page is {last_page}")
    res = requests.get(url + f"?p={last_page}", headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")
entries = soup.select("ul#entry-item-list li")
for e in entries[-3:]:
    text = e.select_one(".content").text.strip()
    print("ENTRY:", text[:100])
