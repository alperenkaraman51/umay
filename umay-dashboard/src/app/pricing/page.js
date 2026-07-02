"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { ShieldCheck, Zap, GlobeLock } from 'lucide-react';

export default function PricingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 cyber-grid-bg flex flex-col`}>
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 flex flex-col items-center pt-24 pb-20 px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--foreground)' }}>
            Şeffaf ve Esnek <span style={{ color: 'var(--primary-red)' }}>Ücretlendirme</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Bireysel araştırmacılardan ulusal güvenlik ajanslarına kadar her seviyeye uygun Açık Kaynak İstihbarat paketleri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full items-center">
          
          {/* TIER 1: Bireysel / Startup */}
          <div className="glass-card p-8 rounded-2xl border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Araştırmacı</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bağımsız gazeteciler ve OSINT analistleri için.</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-extrabold" style={{ color: 'var(--foreground)' }}>$49</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}> / ay</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-center gap-3"><Zap size={18} style={{ color: 'var(--success)' }}/> Ayda 100 Arama</li>
              <li className="flex items-center gap-3"><Zap size={18} style={{ color: 'var(--success)' }}/> Temel Kaynak Taraması</li>
              <li className="flex items-center gap-3"><Zap size={18} style={{ color: 'var(--success)' }}/> E-posta Desteği</li>
              <li className="flex items-center gap-3 opacity-50"><ShieldCheck size={18} /> Gelişmiş Tehdit Skoru</li>
            </ul>
            <button className="w-full py-3 rounded font-bold transition-all border" style={{ borderColor: 'var(--border-color)', color: 'var(--foreground)', backgroundColor: 'transparent' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              Hemen Başla
            </button>
          </div>

          {/* TIER 2: Kurumsal (POPÜLER) */}
          <div className="glass-card p-10 rounded-2xl border relative transform md:-translate-y-4 shadow-2xl" style={{ borderColor: 'var(--primary-red)', backgroundColor: 'rgba(255, 51, 51, 0.05)' }}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              En Popüler
            </div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-red)' }}>Kurumsal</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Şirketlerin marka koruması ve siber istihbaratı için.</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-extrabold" style={{ color: 'var(--foreground)' }}>$199</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}> / ay</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              <li className="flex items-center gap-3"><Zap size={18} style={{ color: 'var(--primary-red)' }}/> Sınırsız Arama</li>
              <li className="flex items-center gap-3"><ShieldCheck size={18} style={{ color: 'var(--primary-red)' }}/> Gelişmiş Tehdit Skoru & YZ</li>
              <li className="flex items-center gap-3"><ShieldCheck size={18} style={{ color: 'var(--primary-red)' }}/> 7/24 Gerçek Zamanlı Alarm</li>
              <li className="flex items-center gap-3"><GlobeLock size={18} style={{ color: 'var(--primary-red)' }}/> Dark Web Taraması</li>
            </ul>
            <button className="w-full py-4 rounded font-bold text-white bg-primary hover:bg-dark-red transition-all shadow-[0_0_20px_rgba(255,51,51,0.4)]">
              Satın Al
            </button>
          </div>

          {/* TIER 3: Government / Defense */}
          <div className="glass-card p-8 rounded-2xl border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Devlet & Savunma</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ulusal güvenlik ve istihbarat kurumları için özel çözüm.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>Özel Çözüm</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-center gap-3"><GlobeLock size={18} style={{ color: 'var(--foreground)' }}/> Özel Sunucu Dağıtımı (On-Prem)</li>
              <li className="flex items-center gap-3"><GlobeLock size={18} style={{ color: 'var(--foreground)' }}/> Gizli Ağ (Classified) Entegrasyonu</li>
              <li className="flex items-center gap-3"><GlobeLock size={18} style={{ color: 'var(--foreground)' }}/> Atanmış Veri Analisti</li>
              <li className="flex items-center gap-3"><GlobeLock size={18} style={{ color: 'var(--foreground)' }}/> Sınırsız API Erişimi</li>
            </ul>
            <button className="w-full py-3 rounded font-bold transition-all" style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)' }}>
              Bize Ulaşın
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
