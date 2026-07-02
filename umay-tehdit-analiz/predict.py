import os
import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from peft import PeftModel, PeftConfig

# Global model ve tokenizer değişkenleri (sadece bir kez yüklenmesi için)
_model = None
_tokenizer = None

def load_model():
    """Modeli ve tokenizer'ı belleğe yükler (Singleton mantığı)."""
    global _model, _tokenizer
    
    if _model is not None and _tokenizer is not None:
        return _model, _tokenizer

    base_model_name = "dbmdz/bert-base-turkish-cased"
    
    # Modelin yolunu predict.py dosyasının bulunduğu konuma göre mutlak (absolute) hale getirelim
    base_dir = os.path.dirname(os.path.abspath(__file__))
    lora_model_path = os.path.join(base_dir, "models", "umay-tehdit-v1")
    
    print("[*] Tokenizer yükleniyor...")
    _tokenizer = AutoTokenizer.from_pretrained(base_model_name)
    
    # 5 sınıf için etiket tanımları
    id2label = {0: "Olumlu", 1: "Nötr", 2: "Şikayet", 3: "Saldırgan", 4: "Tehdit"}
    label2id = {"Olumlu": 0, "Nötr": 1, "Şikayet": 2, "Saldırgan": 3, "Tehdit": 4}

    if os.path.exists(lora_model_path):
        print(f"[*] Fine-tune edilmiş LoRA modeli bulundu: {lora_model_path}")
        # Base modeli yükle
        base_model = AutoModelForSequenceClassification.from_pretrained(
            base_model_name,
            num_labels=5,
            id2label=id2label,
            label2id=label2id
        )
        # Üzerine LoRA ağırlıklarını ekle
        _model = PeftModel.from_pretrained(base_model, lora_model_path)
    else:
        print(f"[*] Fine-tune edilmiş model bulunamadı. Base model (Baseline) yükleniyor: {base_model_name}")
        print("[!] UYARI: Bu model eğitilmemiştir, tahminler rastgele veya yanlış olabilir!")
        _model = AutoModelForSequenceClassification.from_pretrained(
            base_model_name,
            num_labels=5,
            id2label=id2label,
            label2id=label2id
        )
        
    # GPU varsa GPU'ya al
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Cihaz: {device}")
    _model = _model.to(device)
    _model.eval()  # Tahmin moduna al
    
    return _model, _tokenizer

def hesapla_risk_skoru(kategori_id, guven):
    """
    Kategori ve modelin güven skorunu birleştirerek 0-100 arası bir risk skoru üretir.
    Formül: (Kategori * 20) + (Güven * 20)
    Örnek: Tehdit(4) ve %90 Güven(0.9) -> (4*20) + (0.9*20) = 80 + 18 = 98
    """
    taban_puan = kategori_id * 20
    ek_puan = guven * 20
    skor = taban_puan + ek_puan
    
    # Sınırları aşmasın
    skor = max(0, min(100, int(skor)))
    return skor

def aciklama_uret(kategori_id):
    """Kategoriye göre açıklayıcı metin döner."""
    aciklamalar = {
        0: "Övgü veya pozitif içerik tespit edildi.",
        1: "Duygu içermeyen, standart bilgi/haber metni.",
        2: "Hizmet eleştirisi veya memnuniyetsizlik ifadesi.",
        3: "Hakaret, küfür veya saldırgan bir üslup kullanılmış.",
        4: "Doğrudan tehdit, şiddet çağrısı veya ciddi güvenlik riski tespit edildi!"
    }
    return aciklamalar.get(kategori_id, "Bilinmeyen Kategori")

def analiz_et(metin: str) -> dict:
    """
    Verilen tek bir metni analiz eder ve risk skorunu hesaplar.
    """
    if not metin or not str(metin).strip():
        return {
            "kategori": "Hata",
            "kategori_id": -1,
            "risk_skoru": 0,
            "guven": 0.0,
            "aciklama": "Boş metin gönderildi."
        }
        
    # Çok uzun metinleri kırp
    if len(metin) > 1000:
        metin = metin[:1000]

    model, tokenizer = load_model()
    device = model.device
    
    inputs = tokenizer(metin, return_tensors="pt", truncation=True, padding=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        # Softmax ile olasılıklara çevir
        probabilities = torch.nn.functional.softmax(logits, dim=-1)[0]
        
    predicted_class_id = torch.argmax(probabilities).item()
    confidence = probabilities[predicted_class_id].item()
    
    category_name = model.config.id2label[predicted_class_id]
    risk_score = hesapla_risk_skoru(predicted_class_id, confidence)
    
    return {
        "kategori": category_name,
        "kategori_id": predicted_class_id,
        "risk_skoru": risk_score,
        "guven": round(confidence, 4),
        "aciklama": aciklama_uret(predicted_class_id)
    }

def analiz_et_toplu(metin_listesi: list) -> pd.DataFrame:
    """
    Verilen metin listesini analiz eder ve bir Pandas DataFrame döner.
    """
    print(f"[*] Toplu analiz başlatıldı ({len(metin_listesi)} metin)...")
    sonuclar = []
    for metin in metin_listesi:
        sonuc = analiz_et(metin)
        sonuc['metin'] = metin
        sonuclar.append(sonuc)
        
    # DataFrame oluştur ve sütun sırasını düzenle
    df = pd.DataFrame(sonuclar)
    if not df.empty:
        df = df[['metin', 'kategori', 'kategori_id', 'risk_skoru', 'guven', 'aciklama']]
    return df

# Test kodu
if __name__ == "__main__":
    test_metin = "Şirketinizin yaptığı bu yeni atılımı çok beğendim."
    print(f"Test Metni: {test_metin}")
    sonuc = analiz_et(test_metin)
    print("Sonuç:", sonuc)
