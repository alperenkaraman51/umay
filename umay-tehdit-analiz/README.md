# UMAY Tehdit Analiz Motoru (ML Pipeline)

Bu klasör, UMAY projesinin siber istihbarat ve duygu analizi ihtiyaçları için geliştirilmiş, yerel olarak eğitilebilir ve çalıştırılabilir bir Yapay Zeka (Makine Öğrenmesi) modelidir. 

**Model Altyapısı:** HuggingFace `dbmdz/bert-base-turkish-cased`
**Optimizasyon:** PEFT (LoRA) - Düşük hafıza ile fine-tuning.
**Sınıflandırma Mantığı (0-4):**
- 0: Olumlu (Övgü, Pozitif)
- 1: Nötr (Haber, Bilgi)
- 2: Şikayet (Sitem, Memnuniyetsizlik)
- 3: Saldırgan (Küfür, Hakaret)
- 4: Tehdit (Saldırı, Bomba ihbarı, Ciddi Risk)

## Kurulum
Python (tercihen v3.10+) ortamınızda kütüphaneleri kurun:
```bash
pip install -r requirements.txt
```

## Eğitimi Başlatmak (Google Colab / Yerel GPU)
Elinizdeki veriyi (`data/labeled_dataset.csv`) kullanarak modeli eğitmek için:
```bash
python train.py
```
*Not: Bu işlem CPU'da uzun sürebilir. Mümkünse bu klasörü bir Google Colab ortamına taşıyarak T4 GPU üzerinde (1-2 dakika içinde) eğitebilirsiniz. Eğitim tamamlandığında model `models/umay-tehdit-v1/` dizinine kaydedilir.*

## Yeni Veri Eklemek
Sistemin daha akıllı olmasını isterseniz, `data/labeled_dataset.csv` dosyasını Excel ile veya metin editörüyle açarak yeni satırlar ekleyebilirsiniz. 
Örnek: `"Sitenizi yine hackledik", 4, "Twitter", "2026-06-30"`
Veri ekledikten sonra modeli tekrar (`python train.py`) eğitmeniz gerekir.

## Tahmin (Inference) Yapmak
Uygulama içinde modeli kullanmak için `predict.py` modülünü içe aktarmanız yeterlidir:

```python
from predict import analiz_et, analiz_et_toplu

sonuc = analiz_et("Merkez binanızı havaya uçuracağız!")
print(sonuc)
# Çıktı: {'kategori': 'Tehdit', 'kategori_id': 4, 'risk_skoru': 95, 'guven': 0.98, 'aciklama': 'Doğrudan tehdit, şiddet çağrısı, ciddi risk'}
```

## Model Değerlendirmesi
Modelin başarı oranını (Accuracy, F1 vs.) ölçmek için:
```bash
python evaluate.py
```
Bu script, yanlış tahmin edilen cümleleri `hatali_tahminler.csv` dosyasına kaydedecektir.
