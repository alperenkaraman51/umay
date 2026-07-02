"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { Database, ShieldAlert, Target } from 'lucide-react';

export default function FeaturesPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 cyber-grid-bg flex flex-col`}>
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 flex flex-col items-center pt-24 pb-20 px-6">
        <div className="text-center mb-16 max-w-3xl">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--foreground)' }}>
            UMAY <span style={{ color: 'var(--primary-red)' }}>Motoru</span> Özellikleri
          </h1>
          <p className="text-xl" style={{ color: 'var(--text-muted)' }}>
            Geleneksel arama motorlarının ötesinde, tehdit odaklı çalışan yeni nesil veri madenciliği ve istihbarat altyapısı.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full">
          <div className="glass-card p-8 rounded-2xl flex gap-6 items-start">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,51,51,0.1)' }}>
              <Database size={32} style={{ color: 'var(--primary-red)' }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Derin Veri Taraması</h3>
              <p style={{ color: 'var(--text-muted)' }}>Milyonlarca web sayfasını, Ekşi Sözlük gibi yerel forumları, uluslararası haber kaynaklarını ve Telegram kanallarını anlık olarak tarar.</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl flex gap-6 items-start">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,51,51,0.1)' }}>
              <ShieldAlert size={32} style={{ color: 'var(--primary-red)' }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Yapay Zeka Destekli Duygu Analizi</h3>
              <p style={{ color: 'var(--text-muted)' }}>Hedefinize yönelik atılan içeriklerin olumlu/olumsuz duygu durumunu ve tehdit skorunu (0 ile 1 arası) anında tespit eder.</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl flex gap-6 items-start">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,51,51,0.1)' }}>
              <Target size={32} style={{ color: 'var(--primary-red)' }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Dinamik Filtreleme</h3>
              <p style={{ color: 'var(--text-muted)' }}>Son 24 saat, son 1 hafta veya belirlediğiniz özel zaman dilimlerindeki saf, kirlilikten arındırılmış içeriklere ulaşırsınız.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
