import requests
from bs4 import BeautifulSoup
import urllib.parse

keyword = "aselsan"
url = f"https://eksisozluk.com/basliklar/ara?SearchForm.Keywords={urllib.parse.quote(keyword)}&SearchForm.SortOrder=Date"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
response = requests.get(url, headers=headers)
print(response.status_code)
if response.status_code == 200:
    soup = BeautifulSoup(response.text, "html.parser")
    topics = soup.select("ul.topic-list li a")
    for t in topics[:5]:
        print(t.text.strip(), t.get("href"))
