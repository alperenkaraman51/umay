from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# API'den veritabanına kayıt yaparken beklediğimiz veri formatı
class NewsCreate(BaseModel):
    title: str
    url: str
    source: str

# API'den veri okurken dışarıya vereceğimiz format (ID ve AI analizleri dahil)
class NewsResponse(BaseModel):
    id: int
    title: str
    url: str
    source: str
    timestamp: datetime
    threat_score: float
    sentiment: str
    explanation: Optional[str] = None

    class Config:
        from_attributes = True # SQLAlchemy modellerini Pydantic'e çevirmek için gerekli

# Arama çubuğundan gelecek istek formatı
class AnalyzeRequest(BaseModel):
    keyword: str
    timeframe: str = "1d" # Varsayılan olarak son 24 saat

