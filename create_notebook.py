import nbformat as nbf
from nbformat.v4 import new_notebook, new_markdown_cell, new_code_cell

nb = new_notebook()

nb.cells.append(new_markdown_cell("# UMAY Tehdit Analizi - Google Colab Eğitim Ortamı\n\nBu dosya, UMAY sisteminin yapay zeka modelini Google'ın ücretsiz T4 GPU'sunu kullanarak çok hızlı bir şekilde (1-2 dakikada) eğitmeniz için hazırlanmıştır. Aşağıdaki hücreleri sırasıyla 'Play' tuşuna basarak çalıştırın."))

nb.cells.append(new_code_cell("# 1. Gerekli Kütüphaneleri Kur (Yaklaşık 30 saniye sürer)\n!pip install -q transformers peft pandas scikit-learn accelerate \"torchao>=0.16.0\""))

nb.cells.append(new_markdown_cell("## 2. Eğitim Verisi ve Scriptlerin Yüklenmesi\nBurada yerelde oluşturduğumuz verileri ve train scriptini Colab'a kopyalıyoruz."))

code_data = '''import os
os.makedirs("data", exist_ok=True)
os.makedirs("models", exist_ok=True)

# Labeled dataset'i oluştur
with open("data/labeled_dataset.csv", "w", encoding="utf-8") as f:
    f.write("""text,label,source,date
"Kurumun yeni başlattığı yapay zeka projesi gerçekten gurur verici, tebrikler.",0,Twitter,2026-06-30
"Savunma sanayi alanındaki bu yeni sistemler çok başarılı olmuş, mühendislerin ellerine sağlık.",0,Haber Yorumu,2026-06-30
"Harika bir uygulama, arayüzü çok sade ve hızlı çalışıyor.",0,Ekşi Sözlük,2026-06-30
"Ekip gerçekten çok çalışıyor, destekliyoruz.",0,Twitter,2026-06-30
"Yaptıkları son etkinlik ile sektörde fark yarattılar, muazzam bir vizyon.",0,LinkedIn,2026-06-30
"Bu ürün hayat kurtaracak nitelikte, yerli üretim olması da cabası.",0,Haber Yorumu,2026-06-30
"Gelecek vizyonlarını çok beğendim, uzun vadede iyi işler çıkacak.",0,Twitter,2026-06-30
"Emeği geçen herkese teşekkür ederim, çok faydalı oldu.",0,Ekşi Sözlük,2026-06-30
"Şirket bugün 3. çeyrek finansal raporlarını açıkladı.",1,Haber,2026-06-30
"Yeni ürün lansmanı haftaya perşembe günü gerçekleştirilecek.",1,Twitter,2026-06-30
"Genel müdürün yaptığı basın açıklaması kurumun web sitesinde yayınlandı.",1,Haber,2026-06-30
"Hava durumu nedeniyle uçuşlarda bazı aksaklıklar bekleniyor.",1,Haber,2026-06-30
"Toplantı notları tüm çalışanların mail adreslerine gönderilmiştir.",1,İç Ağ,2026-06-30
"Sunucu bakımı bu gece saat 03:00'te yapılacaktır.",1,Duyuru,2026-06-30
"Bugünkü döviz kurları ve borsa açılış verileri paylaşıldı.",1,Haber,2026-06-30
"Yeni şubenin açılışı için hazırlıklar devam ediyor.",1,Haber,2026-06-30
"Müşteri hizmetlerine 40 dakikadır ulaşamıyorum, bu nasıl bir rezalet?",2,Twitter,2026-06-30
"Uygulama dünden beri sürekli çöküyor, lütfen şunu düzeltin artık.",2,Uygulama Marketi,2026-06-30
"Aldığım ürün kargoda paramparça olmuş, iade süreci de çok yavaş.",2,Şikayetvar,2026-06-30
"Paramı kestiler ama hizmeti vermediler, böyle saçmalık görmedim.",2,Twitter,2026-06-30
"İnternet hızınız vaat ettiğinizin çeyreği bile değil, aboneliğimi iptal edeceğim.",2,Ekşi Sözlük,2026-06-30
"Şubedeki çalışanların tavırları son derece kaba ve ilgisizdi.",2,Şikayetvar,2026-06-30
"Her güncellemede sistemi daha da bozmayı nasıl başarıyorsunuz?",2,Twitter,2026-06-30
"Kargo şirketi adresime gelmeden geldik yoktunuz mesajı atıyor.",2,Ekşi Sözlük,2026-06-30
"Sizin yapacağınız işin ta içine edeyim, alayınız hırsızsınız lan şerefsizler!",3,Twitter,2026-06-30
"Böyle aşağılık bir kurum görmedim, hepiniz haysiyetsizsiniz.",3,Ekşi Sözlük,2026-06-30
"Geri zekalı sürüsü toplanmış oraya, bir işi beceremiyorsunuz aptallar.",3,Twitter,2026-06-30
"Müdürünüz de siz de haysiyet fukarası satılmışlarsınız.",3,Ekşi Sözlük,2026-06-30
"Allah belanızı versin, hepiniz hapse gireceksiniz soysuz köpekler.",3,Twitter,2026-06-30
"Ulan gerizekalılar bu ne biçim karar, beyninizi mi yediniz?",3,Ekşi Sözlük,2026-06-30
"O klavyenin başında oturanları bulup evire çevire dövmek lazım, şerefsizler.",3,Twitter,2026-06-30
"Siz ne anlarsınız ulan o. çocukları, siktirin gidin oradan.",3,Ekşi Sözlük,2026-06-30
"Sisteminize sızdık, tüm müşteri veritabanınızı ele geçirdik. Yarın her şeyi sızdıracağız.",4,Dark Web,2026-06-30
"Merkez binanıza saat 15:00'te bomba yerleştirdim, hepiniz öleceksiniz.",4,Telegram,2026-06-30
"CEO'nuzun nerede oturduğunu biliyorum, akşam evine giderken ona pusu kuracağız.",4,Twitter,2026-06-30
"Eğer hesaplarımdaki bloku kaldırmazsanız yarın şubeye gelip hepinizi kurşuna dizerim.",4,Email,2026-06-30
"Sunucularınıza DDoS saldırısı başlattık, 10 Bitcoin ödemezseniz sisteminizi çökerteceğiz.",4,Hacker Forum,2026-06-30
"Yarın sabah o binaya giremeyeceksiniz, her tarafı ateşe vereceğiz.",4,Twitter,2026-06-30
"Yöneticinizi infaz edeceğiz, artık geri dönüş yok bekleyin ve görün.",4,Telegram,2026-06-30
"Güvenlik kameralarınızı hackledim, içerideki herkesin hareketlerini izliyorum, kan akacak.",4,Dark Web,2026-06-30
""")

print("Veri seti oluşturuldu.")
'''
nb.cells.append(new_code_cell(code_data))

nb.cells.append(new_markdown_cell("## 3. Eğitimi Başlat\nEğitim scriptini yazıp çalıştırıyoruz. T4 GPU'da işlem çok hızlı biter."))

code_train = '''%%writefile train.py
import os
import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model, TaskType
from sklearn.metrics import accuracy_score, f1_score

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

print("[*] Veri yükleniyor...")
df = pd.read_csv("data/labeled_dataset.csv").dropna(subset=['text', 'label'])
X, y = df['text'].tolist(), df['label'].tolist()
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("[*] Model yükleniyor (dbmdz/bert-base-turkish-cased)...")
model_name = "dbmdz/bert-base-turkish-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=5)

lora_config = LoraConfig(task_type=TaskType.SEQ_CLS, r=8, lora_alpha=16, lora_dropout=0.1, target_modules=["query", "value"], modules_to_save=["classifier"])
model = get_peft_model(model, lora_config)

train_encodings = tokenizer(X_train, truncation=True, padding=True, max_length=128)
val_encodings = tokenizer(X_val, truncation=True, padding=True, max_length=128)
train_dataset, val_dataset = TehditDataset(train_encodings, y_train), TehditDataset(val_encodings, y_val)

training_args = TrainingArguments(
    output_dir='./results', num_train_epochs=30, per_device_train_batch_size=8, per_device_eval_batch_size=8,
    gradient_accumulation_steps=1, eval_strategy="epoch", save_strategy="epoch",
    load_best_model_at_end=True, metric_for_best_model="f1_macro", learning_rate=1e-3, remove_unused_columns=False
)

trainer = Trainer(model=model, args=training_args, train_dataset=train_dataset, eval_dataset=val_dataset, compute_metrics=compute_metrics)

print("[*] Eğitim başladı!")
trainer.train()

model.save_pretrained("models/umay-tehdit-v1")
tokenizer.save_pretrained("models/umay-tehdit-v1")
print("[*] Model kaydedildi!")
'''
nb.cells.append(new_code_cell(code_train))
nb.cells.append(new_code_cell("!python train.py"))

nb.cells.append(new_markdown_cell("## 4. İndirilebilir Modeli Ziple (Opsiyonel)\nEğitilen modeli bilgisayarınıza indirmek isterseniz aşağıdaki kodu çalıştırın."))
nb.cells.append(new_code_cell("!zip -r umay-tehdit-v1.zip models/umay-tehdit-v1/\nfrom google.colab import files\nfiles.download('umay-tehdit-v1.zip')"))

with open('umay-tehdit-analiz/Umay_Egitim_Colab.ipynb', 'w') as f:
    nbf.write(nb, f)

print("Jupyter Notebook was successfully generated.")
