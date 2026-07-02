import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Çevresel değişkenlerden SMTP ayarlarını çek (Render vb. yerlerde kolay ayarlamak için)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "") # E-posta adresiniz
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "") # E-posta şifreniz (veya uygulama şifresi)
ALERT_RECIPIENT = os.getenv("ALERT_RECIPIENT", "") # Uyarıların gideceği adres

def send_threat_alert(title: str, url: str, threat_score: float, explanation: str):
    """
    Tehdit skoru 0.70'in üzerinde olduğunda acil durum e-postası gönderir.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD or not ALERT_RECIPIENT:
        print(f"[ALARM - SİMÜLASYON] Yüksek tehdit algılandı ancak SMTP ayarları eksik!")
        print(f"Tehdit: {title} | Skor: {threat_score}")
        return

    subject = f"🚨 UMAY ACİL DURUM UYARISI: Yüksek Risk Tespit Edildi ({threat_score:.2f}) 🚨"
    
    body = f"""
    <h2>UMAY İstihbarat Platformu - Kritik Tehdit Alarmı</h2>
    <p>Sistemlerimiz, yapılandırılan anahtar kelimelerle eşleşen kritik bir tehdit tespit etmiştir.</p>
    
    <ul>
        <li><b>Başlık:</b> {title}</li>
        <li><b>Tehdit Skoru:</b> <span style="color:red;font-weight:bold;">{threat_score}</span></li>
        <li><b>Yapay Zeka Analizi:</b> {explanation}</li>
        <li><b>Kaynak Bağlantısı:</b> <a href="{url}">{url}</a></li>
    </ul>
    
    <p>Lütfen durumu derhal inceleyiniz.</p>
    <br>
    <i>Bu e-posta UMAY Otonom İstihbarat Platformu tarafından otomatik olarak gönderilmiştir.</i>
    """

    msg = MIMEMultipart()
    msg['From'] = SMTP_USERNAME
    msg['To'] = ALERT_RECIPIENT
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        # TLS bağlantısı ile güvenli gönderim
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"[ALARM - BAŞARILI] {ALERT_RECIPIENT} adresine uyarı e-postası gönderildi.")
    except Exception as e:
        print(f"[ALARM - HATA] E-posta gönderilemedi: {e}")
