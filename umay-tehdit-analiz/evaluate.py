import os
import pandas as pd
from sklearn.metrics import classification_report, accuracy_score, f1_score
from predict import analiz_et_toplu

def evaluate_model():
    print("=============================================")
    print("      UMAY TEHDİT ANALİZ DEĞERLENDİRME     ")
    print("=============================================")
    
    data_path = "data/labeled_dataset.csv"
    if not os.path.exists(data_path):
        print(f"[!] Hata: {data_path} bulunamadı.")
        return
        
    print(f"[*] Veri seti yükleniyor: {data_path}")
    df = pd.read_csv(data_path)
    df = df.dropna(subset=['text', 'label'])
    
    gercek_etiketler = df['label'].tolist()
    metinler = df['text'].tolist()
    
    # Tahminleri yap
    print("[*] Tahminler çalıştırılıyor, bu biraz zaman alabilir...")
    sonuclar_df = analiz_et_toplu(metinler)
    
    tahmin_etiketleri = sonuclar_df['kategori_id'].tolist()
    
    # Sınıf isimleri
    target_names = ["0-Olumlu", "1-Nötr", "2-Şikayet", "3-Saldırgan", "4-Tehdit"]
    
    # Raporu hesapla
    acc = accuracy_score(gercek_etiketler, tahmin_etiketleri)
    f1 = f1_score(gercek_etiketler, tahmin_etiketleri, average='macro')
    
    print("\n---------------- SONUÇLAR ----------------")
    print(f"Genel Doğruluk (Accuracy): %{acc*100:.2f}")
    print(f"F1 Skoru (Macro): %{f1*100:.2f}")
    print("\nDetaylı Rapor:")
    print(classification_report(gercek_etiketler, tahmin_etiketleri, target_names=target_names, zero_division=0))
    
    # Hata analizi: Yanlış tahmin edilenleri bul
    print("---------------- HATA ANALİZİ ----------------")
    df['tahmin'] = tahmin_etiketleri
    df['risk_skoru'] = sonuclar_df['risk_skoru']
    df['guven'] = sonuclar_df['guven']
    
    hatali_df = df[df['label'] != df['tahmin']].copy()
    
    if not hatali_df.empty:
        hatali_dosya = "hatali_tahminler.csv"
        hatali_df.to_csv(hatali_dosya, index=False)
        print(f"[*] {len(hatali_df)} adet hatalı tahmin bulundu.")
        print(f"[*] Hatalı tahminler '{hatali_dosya}' dosyasına kaydedildi.")
        
        print("\nÖrnek hatalar:")
        for _, row in hatali_df.head(3).iterrows():
            print(f"\nMetin: {row['text'][:80]}...")
            print(f"Gerçek: {row['label']} | Tahmin: {row['tahmin']} (Güven: {row['guven']})")
    else:
        print("[*] Harika! Hatalı tahmin bulunamadı (Model %100 doğru).")

if __name__ == "__main__":
    evaluate_model()
