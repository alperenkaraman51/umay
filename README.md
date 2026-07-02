# UMAY Platform

Türkçe Büyük Dil Modeli Tabanlı Gerçek Zamanlı Açık Kaynak İstihbarat ve Anomali Tespit Platformu.

## Mimari

Proje monorepo mimarisi ile tasarlanmıştır:
- `umay-core/`: Yapay zeka modelleri, Multi-Agent sistemi ve RAG entegrasyonu.
- `umay-scrapers/`: Veri toplayıcı mikroservisler (Twitter, Haberler, Ekşi Sözlük).
- `umay-api/`: FastAPI tabanlı REST API ve veritabanı iletişimi.
- `umay-dashboard/`: Next.js tabanlı gerçek zamanlı kullanıcı arayüzü.

## Geliştirme Ortamı

Python backend servisleri için kök dizinde sanal ortam oluşturulur:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
