from sqlalchemy import Column, Integer, String, DateTime, Float
from database import Base
import datetime

class NewsItem(Base):
    __tablename__ = "news_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    url = Column(String, unique=True, index=True)
    source = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Yapay zeka modeli analiz ettikten sonra bu alanları dolduracak
    threat_score = Column(Float, default=0.0) # 0 ile 1 arası tehdit skoru
    sentiment = Column(String, default="neutral") # negative, neutral, positive
    explanation = Column(String, default="") # AI tarafından üretilen kısa açıklama
