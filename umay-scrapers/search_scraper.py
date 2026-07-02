import requests
from bs4 import BeautifulSoup
import datetime
import urllib.parse

class SearchScraper:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    def fetch_news(self, keyword, timeframe="1d"):
        """
        Belirtilen anahtar kelime ve zaman aralığına göre Google News RSS'den haber çeker.
        Sadece Türkiye lokasyonlu haberleri getirir.
        """
        # location:turkey operatörü ile sadece Türkiye içi haberleri filtreliyoruz
        search_query = f"{keyword} location:turkey"
        encoded_keyword = urllib.parse.quote(search_query)
        rss_url = f"https://news.google.com/rss/search?q={encoded_keyword}+when:{timeframe}&hl=tr&gl=TR&ceid=TR:tr"
        
        print(f"[*] Google News taranıyor: '{keyword}' (Zaman Aralığı: {timeframe})")
        
        try:
            response = requests.get(rss_url, headers=self.headers, timeout=10)
            response.raise_for_status()
        except Exception as e:
            print(f"[!] Hata oluştu: {e}")
            return []

        import xml.etree.ElementTree as ET
        try:
            root = ET.fromstring(response.content)
        except Exception as e:
            print(f"[!] XML Ayrıştırma Hatası: {e}")
            return []
            
        items = root.findall('.//item')
        news_list = []
        
        for item in items:
            title = item.findtext('title') or "Başlık Yok"
            link = item.findtext('link') or ""
            pub_date = item.findtext('pubDate') or datetime.datetime.now().isoformat()
            source = item.findtext('source') or "Google News"
            
            if not link:
                continue
                
            news_list.append({
                "title": title,
                "url": link,
                "timestamp": pub_date,
                "source": source
            })
            
            if len(news_list) >= 15:
                break
                
        return news_list

    def fetch_eksi_sozluk(self, keyword, timeframe="1d"):
        """
        Belirtilen anahtar kelimeyi Ekşi Sözlük'te arar ve sadece ilgili zaman aralığındaki ve 
        içinde anahtar kelime geçen entry'leri çeker.
        """
        news_list = []
        encoded_keyword = urllib.parse.quote(keyword)
        url = f"https://eksisozluk.com/basliklar/ara?SearchForm.Keywords={encoded_keyword}&SearchForm.SortOrder=Date"
        
        now = datetime.datetime.now()
        if timeframe == "1d":
            start_date = now - datetime.timedelta(days=1)
        elif timeframe == "7d":
            start_date = now - datetime.timedelta(days=7)
        else:
            start_date = now - datetime.timedelta(days=365)
            
        print(f"[*] Ekşi Sözlük taranıyor: '{keyword}' (Sadece {timeframe} ve içinde kelime geçenler)")
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                print(f"[!] Ekşi Sözlük Hatası: {response.status_code}")
                return []
                
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, "html.parser")
            topics = soup.select("ul.topic-list li a")
            
            # Daha fazla başlığa bakalım ki sonuç bulma ihtimali artsın
            for t in topics[:3]:
                topic_title = t.text.strip()
                topic_url = "https://eksisozluk.com" + t.get("href")
                
                # Başlığın içine girip sayfayı çekelim
                topic_res = requests.get(topic_url, headers=self.headers, timeout=10)
                if topic_res.status_code == 200:
                    t_soup = BeautifulSoup(topic_res.text, "html.parser")
                    
                    # Son sayfayı bul ve oraya git
                    pager = t_soup.select_one(".pager")
                    if pager and pager.has_attr("data-pagecount"):
                        last_page = pager["data-pagecount"]
                        last_page_url = f"{topic_url}?p={last_page}"
                        topic_res = requests.get(last_page_url, headers=self.headers, timeout=10)
                        t_soup = BeautifulSoup(topic_res.text, "html.parser")
                        
                    entries = t_soup.select("ul#entry-item-list li")
                    
                    # Sayfadaki TÜM entryleri tarayıp kelimeyi ve tarihi kontrol edelim
                    for e in entries:
                        content_div = e.select_one(".content")
                        date_el = e.select_one("a.entry-date")
                        
                        if content_div and date_el:
                            text = content_div.text.strip()
                            
                            # 1. KURAL: Entry'nin İÇİNDE kelime geçmek zorunda
                            if keyword.lower() not in text.lower():
                                continue
                                
                            # 2. KURAL: Zaman aralığına uymak zorunda
                            date_text = date_el.text.strip().split("~")[0].strip()
                            try:
                                if len(date_text) > 10:
                                    entry_date = datetime.datetime.strptime(date_text, "%d.%m.%Y %H:%M")
                                else:
                                    entry_date = datetime.datetime.strptime(date_text, "%d.%m.%Y")
                            except ValueError:
                                entry_date = now # Çevrilemezse bugünü kabul et
                                
                            if entry_date < start_date:
                                continue # Entry çok eski, atla
                                
                            entry_id = e.get("data-id", str(datetime.datetime.now().timestamp()))
                            unique_url = f"{topic_url}?entry={entry_id}"
                            
                            news_list.append({
                                "title": f"{topic_title} - {text[:150]}...",
                                "url": unique_url,
                                "timestamp": entry_date.isoformat(),
                                "source": "Ekşi Sözlük"
                            })
                            
        except Exception as e:
            print(f"[!] Ekşi Sözlük çekilirken hata: {e}")
            
        return news_list

    def fetch_all(self, keyword, timeframe="1d"):
        """Hem Google News hem de Ekşi Sözlük verilerini birleştirir."""
        google_news = self.fetch_news(keyword, timeframe)
        eksi_news = self.fetch_eksi_sozluk(keyword, timeframe)
        return google_news + eksi_news
# Sadece bu dosya çalıştırıldığında test etmek için
if __name__ == "__main__":
    scraper = SearchScraper()
    results = scraper.fetch_news("Aselsan", "1d")
    for r in results:
        print(f"- {r['title']} | {r['source']}")
