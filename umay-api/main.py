from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sys
import os

# Scrapers klasörünü Python'un bulabilmesi için yola ekleyelim
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'umay-scrapers')))
from search_scraper import SearchScraper

# Tehdit Analiz modülünü yola ekleyelim
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'umay-tehdit-analiz')))
try:
    from predict import analiz_et
except ImportError:
    def analiz_et(metin):
        return {"kategori": "Hata", "kategori_id": 1, "risk_skoru": 0, "guven": 0.0, "aciklama": "ML modülü yüklenemedi"}
import models
import schemas
from database import engine, get_db
from email_sender import send_threat_alert
import threading

# Veritabanı tablolarını otomatik oluşturur (Eğer yoksa)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UMAY API",
    description="UMAY - Gerçek Zamanlı Tehdit İstihbarat Platformu API'si",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Geliştirme ortamı için tüm kaynaklara izin veriyoruz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "UMAY Platform API'sine Hoş Geldiniz!"}

@app.post("/analyze/", response_model=list[schemas.NewsResponse])
def analyze_keyword(request: schemas.AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Kullanıcıdan gelen anahtar kelimeyi arar, 
    haberleri çeker, (Simüle) Yapay Zeka ile analiz eder ve kaydeder.
    """
    # 1. Scraper'ı çalıştır
    scraper = SearchScraper()
    raw_news = scraper.fetch_all(keyword=request.keyword, timeframe=request.timeframe)
    
    saved_items = []
    
    for news in raw_news:
        db_news = db.query(models.NewsItem).filter(models.NewsItem.url == news["url"]).first()
        if db_news:
            saved_items.append(db_news)
            continue # Varsa atla ama listeye ekle ki kullanıcı görsün
            
        # 2. Yerel Yapay Zeka (LoRA) Analizi
        ai_result = analiz_et(news["title"])
        
        # risk_skoru: 0-100 arası integer, bunu 0.0-1.0 arasına çeviriyoruz
        threat_score = float(ai_result.get("risk_skoru", 0)) / 100.0
        
        # kategori_id: 0(Olumlu), 1(Nötr), 2,3,4 (Negatif)
        cat_id = ai_result.get("kategori_id", 1)
        if cat_id == 0:
            sentiment = "positive"
        elif cat_id == 1:
            sentiment = "neutral"
        else:
            sentiment = "negative"
            
        db_item = models.NewsItem(
            title=news["title"], 
            url=news["url"], 
            source=news["source"],
            threat_score=threat_score,
            sentiment=sentiment,
            explanation=ai_result.get("aciklama", "")
        )
        try:
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            saved_items.append(db_item)
            
            # 3. Yüksek Tehdit Skoru Varsa E-Posta Gönder
            if threat_score >= 0.70:
                threading.Thread(target=send_threat_alert, args=(db_item.title, db_item.url, threat_score, db_item.explanation)).start()
                
        except Exception as e:
            db.rollback()
            print(f"[!] Veritabanı kayıt hatası (URL: {news['url']}): {e}")
            # Veritabanında varsa atlayıp devam et
        
    return saved_items

@app.post("/news/", response_model=schemas.NewsResponse)
def create_news(news: schemas.NewsCreate, db: Session = Depends(get_db)):
    db_news = db.query(models.NewsItem).filter(models.NewsItem.url == news.url).first()
    if db_news:
        raise HTTPException(status_code=400, detail="Haber zaten kayıtlı")
    
    db_item = models.NewsItem(
        title=news.title, 
        url=news.url, 
        source=news.source
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/news/", response_model=list[schemas.NewsResponse])
def read_news(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Veritabanındaki haberleri listele (en yeniler üstte)
    news = db.query(models.NewsItem).order_by(models.NewsItem.id.desc()).offset(skip).limit(limit).all()
    return news
