"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function AboutPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 cyber-grid-bg flex flex-col`}>
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6">
        <div className="glass-card max-w-4xl w-full p-12 rounded-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight" style={{ color: 'var(--foreground)' }}>
            Hakkımızda
          </h1>
          <div className="space-y-6 text-lg leading-relaxed text-left" style={{ color: 'var(--text-muted)' }}>
            <p>
              UMAY Platformu, internetin karanlık ve açık köşelerindeki verileri toplayıp anlamlandırarak kurumların siber güvenlik ve itibar risklerini en aza indirmeyi hedefleyen bir <strong style={{ color: 'var(--foreground)' }}>Açık Kaynak İstihbarat (OSINT)</strong> girişimidir.
            </p>
            <p>
              Amacımız, eski nesil, yavaş ve manuel istihbarat toplama yöntemlerini yıkıp, yapay zeka güdümlü, anlık, otonom ve kesin sonuç veren bir sistem inşa etmektir.
            </p>
            <p>
              Kurumsal şirketlerden, ulusal güvenlik teşkilatlarına kadar geniş bir yelpazeye, sıfır kurulum maliyeti (SaaS) ile en derin veri madenciliği yeteneklerini sunuyoruz. Biz, verinin her şeyden daha değerli olduğu bu çağda, veriyi <strong style={{ color: 'var(--primary-red)' }}>korumanızı</strong> sağlıyoruz.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              MERKEZ: ANKARA, TÜRKİYE | VERSION: 2.0.1 ALPHA
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
