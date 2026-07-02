import requests
from bs4 import BeautifulSoup
import json
import datetime

class NewsScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    def fetch_latest_news(self):
        """Haber sitesinin ana sayfasındaki son dakika veya manşet haberlerini çeker."""
        print(f"[*] {self.base_url} adresinden haberler çekiliyor...")
        
        try:
            response = requests.get(self.base_url, headers=self.headers)
            response.raise_for_status() # Hata varsa (örn. 404) fırlatır
        except Exception as e:
            print(f"[!] Hata oluştu: {e}")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        
        news_items = []
        
        # Sitedeki tüm linkleri alalım
        articles = soup.find_all('a')
        count = 0
        
        for article in articles:
            # Başlık metnini veya 'title' özelliğini almaya çalışalım
            title = article.text.strip()
            if not title and article.get('title'):
                title = article.get('title').strip()
                
            link = article.get('href', '')
            
            # Başlık yeterince uzunsa (kelime sayısı > 3 veya karakter > 20) haber olabilir
            if title and len(title) > 15 and link:
                if not link.startswith('http'):
                    link = self.base_url.rstrip('/') + '/' + link.lstrip('/')
                    
                news_items.append({
                    "title": title,
                    "url": link,
                    "timestamp": datetime.datetime.now().isoformat(),
                    "source": self.base_url
                })
                count += 1
                
                # Sadece ilk 10 haberi alalım
                if count >= 10:
                    break
                    
        return news_items

def send_to_api(news_list, api_url="http://localhost:8000/news/"):
    print(f"\n[*] Haberler API'ye ({api_url}) gönderiliyor...")
    success_count = 0
    for news in news_list:
        try:
            # Sadece API'nin beklediği alanları gönderiyoruz
            payload = {
                "title": news["title"],
                "url": news["url"],
                "source": news["source"]
            }
            response = requests.post(api_url, json=payload)
            if response.status_code == 200:
                success_count += 1
            elif response.status_code == 400:
                # Haber zaten kayıtlıysa
                pass
            else:
                print(f"Hata: {response.status_code} - {response.text}")
        except requests.exceptions.ConnectionError:
            print("\n[!] API'ye ulaşılamadı. Lütfen 'uvicorn main:app --reload' komutu ile API'yi başlattığınızdan emin olun.")
            break
    print(f"[*] {success_count} yeni haber veritabanına eklendi.")

if __name__ == "__main__":
    # Test etmek için örnek bir haber sitesi veriyoruz
    scraper = NewsScraper("https://www.trthaber.com")
    latest_news = scraper.fetch_latest_news()
    
    print("\n--- ÇEKİLEN HABERLER ---\n")
    for news in latest_news:
        print(f"Başlık: {news['title']}")
        print(f"Link: {news['url']}")
        print("-" * 30)
        
    # Çekilen haberleri API'ye gönderelim
    send_to_api(latest_news)
