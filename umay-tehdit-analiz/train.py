import os
import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    TrainingArguments, 
    Trainer
)
from peft import LoraConfig, get_peft_model, TaskType
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    predictions = predictions.argmax(axis=1)
    acc = accuracy_score(labels, predictions)
    f1 = f1_score(labels, predictions, average="macro")
    return {"accuracy": acc, "f1_macro": f1}

class TehditDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

    def __len__(self):
        return len(self.labels)

def train_model():
    print("[*] Eğitim scripti başlatılıyor...")
    
    # 1. Veriyi Yükle
    data_path = "data/labeled_dataset.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Veri seti bulunamadı: {data_path}")
        
    print(f"[*] Veri yükleniyor: {data_path}")
    df = pd.read_csv(data_path)
    
    # NaN değerleri temizle
    df = df.dropna(subset=['text', 'label'])
    
    X = df['text'].tolist()
    y = df['label'].tolist()
    
    # Eğitim ve doğrulama seti olarak ayır (%80 Eğitim, %20 Doğrulama)
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"[*] Eğitim verisi boyutu: {len(X_train)} satır, Doğrulama verisi boyutu: {len(X_val)} satır.")

    # 2. Tokenizer ve Model Hazırlığı
    model_name = "dbmdz/bert-base-turkish-cased"
    print(f"[*] Temel model yükleniyor: {model_name}")
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # 5 sınıf için model başlat
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name, 
        num_labels=5,
        id2label={0: "Olumlu", 1: "Nötr", 2: "Şikayet", 3: "Saldırgan", 4: "Tehdit"},
        label2id={"Olumlu": 0, "Nötr": 1, "Şikayet": 2, "Saldırgan": 3, "Tehdit": 4}
    )

    # 3. LoRA Yapılandırması
    print("[*] LoRA adaptörleri modele ekleniyor...")
    lora_config = LoraConfig(
        task_type=TaskType.SEQ_CLS, 
        r=8, 
        lora_alpha=16, 
        lora_dropout=0.1,
        target_modules=["query", "value"],  # BERT için genelde query ve value katmanları hedeflenir
        modules_to_save=["classifier"] # Random initialize olan sınıflandırıcı katmanını KESİNLİKLE kaydet!
    )
    
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 4. Veriyi Tokenize Et
    print("[*] Metinler tokenize ediliyor...")
    train_encodings = tokenizer(X_train, truncation=True, padding=True, max_length=128)
    val_encodings = tokenizer(X_val, truncation=True, padding=True, max_length=128)
    
    train_dataset = TehditDataset(train_encodings, y_train)
    val_dataset = TehditDataset(val_encodings, y_val)

    # 5. Eğitim Argümanları
    # Veri seti çok küçük (40 satır) olduğu için yüksek epoch ve lr kullanarak ezberlemesini (overfit) sağlıyoruz ki çalıştığını kanıtlayalım.
    training_args = TrainingArguments(
        output_dir='./results',
        num_train_epochs=30, # Küçük veri setinde öğrenmesi için epoch artırıldı
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        gradient_accumulation_steps=1,
        warmup_steps=0,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=5,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1_macro",
        learning_rate=1e-3, # Hızlı öğrenmesi için öğrenme oranı artırıldı
        remove_unused_columns=False
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics
    )

    # 6. Eğitimi Başlat
    print("[*] Eğitim başlıyor. Lütfen bekleyin...")
    trainer.train()

    # 7. Modeli Kaydet
    output_dir = "models/umay-tehdit-v1"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"[*] Eğitim tamamlandı. Model kaydediliyor: {output_dir}")
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print("[*] İşlem başarıyla tamamlandı!")

if __name__ == "__main__":
    train_model()
