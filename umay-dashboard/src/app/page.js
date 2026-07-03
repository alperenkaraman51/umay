"use client";
import { useEffect, useState, Suspense } from 'react';

const API_BASE_URL = 'https://umay-api.onrender.com'; // Change to localhost:8000 for local dev

import { Sun, Moon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import DashboardCharts from './components/DashboardCharts';
import Navbar from './components/Navbar';

function HomeContent() {
  const searchParams = useSearchParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [timeframe, setTimeframe] = useState("1d");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showDashboard, setShowDashboard] = useState(searchParams.get('dashboard') === 'true');

  // Typewriter States
  const typeWords = ["Şirketinizi", "Markanızı", "Siber Tehditleri", "Rakiplerinizi", "Kritik Hedefleri"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typeText, setTypeText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Mevcut haberleri çek
  const fetchNews = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/news/`)
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Hatası:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();
    
    // Sistem temasını kontrol et (Varsayılan Dark olduğu için sadece document'i güncelliyoruz)
    if (!isDarkMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Typewriter Animasyonu
  useEffect(() => {
    let typeSpeed = isDeleting ? 50 : 100;
    if (!isDeleting && typeText === typeWords[currentWordIndex]) {
      typeSpeed = 2000;
      const timeout = setTimeout(() => setIsDeleting(true), typeSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && typeText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % typeWords.length);
      return;
    }
    const timeout = setTimeout(() => {
      setTypeText(prev => {
        const fullWord = typeWords[currentWordIndex];
        return isDeleting 
          ? fullWord.substring(0, prev.length - 1)
          : fullWord.substring(0, prev.length + 1);
      });
    }, typeSpeed);
    return () => clearTimeout(timeout);
  }, [typeText, isDeleting, currentWordIndex]);

  // Progress Bar Animasyonu
  useEffect(() => {
    let interval;
    if (analyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          return prev + Math.floor(Math.random() * 10) + 5;
        });
      }, 500);
    } else if (progress > 0) {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 1000);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  // Yeni kelime analizi yap
  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!keyword) return;

    setShowDashboard(true);
    setAnalyzing(true);
    fetch(`${API_BASE_URL}/analyze/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, timeframe })
    })
      .then(res => res.json())
      .then(data => {
        setAnalyzing(false);
        setNews(data);
      })
      .catch(err => {
        console.error("Analiz Hatası:", err);
        setAnalyzing(false);
      });
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${!showDashboard ? 'cyber-grid-bg' : 'p-4 md:p-8 lg:p-20'}`}>
      
      {!showDashboard ? (
        // --- LANDING PAGE MODE ---
        <div className="flex flex-col min-h-screen">
          
          <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} setShowDashboard={setShowDashboard} />

          {/* MAIN HERO CONTENT */}
          <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-6 text-center py-10 md:py-20">
            <div className="mb-12 mt-8 md:mt-0">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight" style={{ color: 'var(--foreground)' }}>
                Açık Kaynaklarda <br/>
                <span style={{ color: 'var(--primary-red)' }}>{typeText}</span>
                <span className="typing-cursor"></span><br/>
                Analiz Edin.
              </h1>
              <p className="text-base md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto px-2" style={{ color: 'var(--text-muted)' }}>
                UMAY Platformu, internetin derinliklerinden gerçek zamanlı istihbarat toplar ve 
                yapay zeka algoritmalarıyla olası riskleri saniyeler içinde raporlar.
              </p>
            </div>

            <div className="w-full max-w-4xl glass-card p-4 md:p-6 search-glow relative z-10">
              <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Anahtar kelime girin (Örn: Aselsan, Kaza, Siber Saldırı...)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1 rounded p-4 text-lg focus:outline-none transition-colors"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}
                />
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="rounded p-4 text-lg focus:outline-none"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}
                >
                  <option value="1d">Son 24 Saat</option>
                  <option value="7d">Son 7 Gün</option>
                  <option value="1y">Tüm Zamanlar</option>
                </select>
                <button 
                  type="submit" 
                  disabled={analyzing || !keyword}
                  className={`px-10 py-4 rounded font-bold text-lg transition-all ${
                    analyzing || !keyword 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-dark-red'
                  }`}
                  style={{ backgroundColor: (analyzing || !keyword) ? 'var(--border-color)' : 'var(--primary-red)', color: (analyzing || !keyword) ? 'var(--text-muted)' : '#fff' }}
                >
                  {analyzing ? 'Taranıyor...' : 'Analiz Et'}
                </button>
              </form>
            </div>

            {/* Özellik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto relative z-0">
              <div className="glass-card p-8 text-left">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255, 51, 51, 0.1)' }}>
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--foreground)' }}>Gerçek Zamanlı Veri</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Açık kaynaklardan, sosyal medyadan ve haber sitelerinden anlık sinyaller toplanır ve indekslenir.</p>
              </div>
              <div className="glass-card p-8 text-left">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255, 51, 51, 0.1)' }}>
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--foreground)' }}>Yapay Zeka Modeli</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Özel eğitilmiş NLP modelleri ile toplanan verilerin tehdit skoru ve bağlamı analiz edilir.</p>
              </div>
              <div className="glass-card p-8 text-left">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255, 51, 51, 0.1)' }}>
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--foreground)' }}>Hızlı ve Kesin</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Geleneksel yöntemlerin aksine hedefe yönelik, gürültüden arındırılmış raporlama sunulur.</p>
              </div>
            </div>
          </div>

          {/* Dashboard Önizleme (Temsili) */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 text-center">
             <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--foreground)' }}>Komuta Merkezi: UMAY Dashboard</h2>
             <p className="text-base md:text-lg mb-10 md:mb-16 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>Karmaşık açık kaynak verilerini saniyeler içinde karar destek mekanizmasına dönüştüren modern, karanlık ve eyleme geçirilebilir arayüz.</p>

             <div className="relative w-full rounded-2xl overflow-hidden glass-card border shadow-[0_0_50px_rgba(255,51,51,0.05)] text-left" style={{ borderColor: 'var(--border-color)' }}>
               {/* Browser Mac Header */}
               <div className="px-4 py-3 flex gap-2" style={{ backgroundColor: 'rgba(0,0,0,0.8)', borderBottom: '1px solid var(--border-color)' }}>
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
               </div>
               
               {/* Realistic Blurred Dashboard Content */}
               <div className="p-8 bg-background relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
                {/* LESS BLUR: blur-[6px] instead of blur-md, higher opacity */}
                <div className="filter blur-[6px] opacity-70 select-none pointer-events-none">
                   {/* Search Bar */}
                   <section className="mb-8 card p-6 border flex items-center justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="flex items-center gap-4 w-2/3">
                         <div className="flex items-center gap-3">
                           <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-800 shadow-[0_0_10px_rgba(255,51,51,0.5)]">
                             <img src="/umay_emblem.jpg" alt="UMAY" className="w-full h-full object-cover" />
                           </div>
                           <span className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">UMAY</span>
                         </div>
                         <div className="h-8 w-px bg-gray-800 mx-2"></div>
                         <div className="flex-1 rounded p-3 text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}>Siber Güvenlik Zafiyeti</div>
                         <div className="rounded p-3 w-32 text-sm text-center" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Son 24 Saat</div>
                      </div>
                      <div className="px-10 py-3 rounded font-bold text-sm" style={{ backgroundColor: 'var(--primary-red)', color: 'white' }}>Analiz Et</div>
                   </section>

                   {/* Map and Risk Analysis Section */}
                   <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Map */}
                      <div className="md:col-span-2 card border overflow-hidden relative min-h-[300px] flex items-center justify-center" style={{ borderColor: 'var(--border-color)', backgroundColor: '#050505' }}>
                         <div className="absolute inset-0 opacity-20">
                           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                             <defs>
                               <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                               </pattern>
                             </defs>
                             <rect width="100%" height="100%" fill="url(#grid2)" />
                           </svg>
                         </div>
                         <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain opacity-20 filter invert"></div>
                         
                         {/* Signals */}
                         <div className="absolute top-[30%] left-[25%] w-3 h-3 rounded-full bg-primary animate-ping"></div>
                         <div className="absolute top-[30%] left-[25%] w-1.5 h-1.5 rounded-full bg-red-400"></div>
                         <div className="absolute top-[50%] left-[60%] w-4 h-4 rounded-full bg-yellow-500 animate-ping" style={{ animationDelay: '1s' }}></div>
                         <div className="absolute top-[50%] left-[60%] w-2 h-2 rounded-full bg-yellow-300"></div>
                         <div className="absolute bottom-[40%] left-[45%] w-3 h-3 rounded-full bg-green-500 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                         <div className="absolute top-[40%] right-[20%] w-4 h-4 rounded-full bg-primary animate-ping" style={{ animationDelay: '1.5s' }}></div>
                         
                         <div className="absolute bottom-4 right-4 glass-card p-3 rounded text-xs text-left" style={{ borderLeft: '2px solid var(--primary-red)' }}>
                           <p className="text-white font-bold">Son: Dark Web Sızıntısı</p>
                           <p className="text-primary mt-1 font-mono">SKOR: 0.89</p>
                         </div>
                      </div>
                      
                      {/* Risk Analysis */}
                      <div className="col-span-1 card p-6 border flex flex-col justify-center" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--primary-red)' }}>
                           <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Canlı Risk Analizi
                         </h3>
                         <div className="space-y-6">
                           <div>
                             <div className="flex justify-between mb-2 text-sm font-bold"><span style={{ color: 'var(--foreground)' }}>Siber Tehdit</span><span className="text-red-500">Kritik (85%)</span></div>
                             <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden"><div className="w-[85%] h-full bg-red-500 rounded-full"></div></div>
                           </div>
                           <div>
                             <div className="flex justify-between mb-2 text-sm font-bold"><span style={{ color: 'var(--foreground)' }}>Veri Sızıntısı</span><span className="text-yellow-500">Yüksek (65%)</span></div>
                             <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden"><div className="w-[65%] h-full bg-yellow-500 rounded-full"></div></div>
                           </div>
                           <div>
                             <div className="flex justify-between mb-2 text-sm font-bold"><span style={{ color: 'var(--foreground)' }}>İtibar Kaybı</span><span className="text-green-500">Düşük (20%)</span></div>
                             <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden"><div className="w-[20%] h-full bg-green-500 rounded-full"></div></div>
                           </div>
                         </div>
                      </div>
                   </section>

                   {/* Example Cards */}
                   <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="card p-6 border" style={{ borderLeft: '4px solid var(--primary-red)', borderColor: 'var(--border-color)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="flex justify-between items-start mb-4">
                           <span className="px-3 py-1 rounded text-xs font-bold" style={{ backgroundColor: 'rgba(255,51,51,0.1)', color: 'var(--primary-red)' }}>Telegram</span>
                           <span className="text-red-500 font-bold">Tehdit Skoru: 0.95</span>
                         </div>
                         <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Kritik Siber Güvenlik Zafiyeti Tespit Edildi</h3>
                         <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Hacker grupları tarafından şirkete ait veritabanı sızıntısı satışa çıkarıldı. 10.000'den fazla kullanıcının parolası ifşa oldu.</p>
                      </div>
                      <div className="card p-6 border" style={{ borderLeft: '4px solid #eab308', borderColor: 'var(--border-color)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="flex justify-between items-start mb-4">
                           <span className="px-3 py-1 rounded text-xs font-bold" style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#eab308' }}>Ekşi Sözlük</span>
                           <span className="text-yellow-500 font-bold">Tehdit Skoru: 0.65</span>
                         </div>
                         <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Şirket hakkında şok iddialar</h3>
                         <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Çalışanların maaşlarının ödenmediği ve büyük bir krizin kapıda olduğu konuşuluyor. Hisse senedi değerinde ani düşüş bekleniyor.</p>
                      </div>
                   </section>
                </div>

                {/* Static overlay to enter dashboard */}
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center cursor-pointer z-10" onClick={() => setShowDashboard(true)}>
                  <button className="px-12 py-6 bg-primary text-white font-extrabold rounded shadow-[0_0_80px_rgba(255,51,51,0.6)] transform hover:scale-105 transition-transform text-xl uppercase tracking-widest border border-red-500/50">
                    Sisteme Giriş Yap ve Aramaya Başla
                  </button>
                </div>
              </div>
             </div>
          </div>

          {/* FOOTER */}
          <footer className="w-full bg-[#050505] py-16 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="max-w-6xl mx-auto px-6 text-center">
               <div className="flex flex-col items-center justify-center gap-6 mb-10 group cursor-default">
                 <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,51,51,0.5)] group-hover:shadow-[0_0_50px_rgba(255,51,51,0.8)] transition-all duration-300 border border-gray-800">
                   <img src="/umay_emblem.jpg" alt="UMAY Logo" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                 </div>
                 <div className="flex flex-col items-center justify-center text-center">
                   <h3 className="text-4xl font-black tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-none">
                    UMAY
                   </h3>
                   <span className="text-sm font-bold tracking-widest text-red-500 uppercase mt-3 leading-none">Açık Kaynak İstihbarat Platformu</span>
                 </div>
               </div>
               <p className="text-sm text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
                 Açık Kaynak İstihbaratı (OSINT) yeteneklerini yapay zeka ile birleştirerek, markanızı ve kurumunuzu dijital dünyadaki potansiyel risklere karşı koruyan otonom bir kalkandır.
               </p>
               <div className="flex flex-wrap justify-center gap-8 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                 <a href="/features" className="hover:text-white transition-colors">Özellikler</a>
                 <a href="/pricing" className="hover:text-white transition-colors">Ücretlendirme</a>
                 <a href="/about" className="hover:text-white transition-colors">Hakkımızda</a>
                 <a href="#" className="hover:text-white transition-colors">Gizlilik Sözleşmesi</a>
               </div>
               <div className="mt-16 pt-8 border-t flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                 <p className="text-xs text-gray-600">© 2026 UMAY Açık Kaynak İstihbarat Sistemleri. Tüm hakları saklıdır.</p>
                 <p className="text-xs font-mono text-gray-600">SYS_VER: 2.0.1</p>
               </div>
            </div>
          </footer>

        </div>
      ) : (
        // --- DASHBOARD MODE ---
        <>
          <header className="mb-8 pb-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <div className="flex items-center gap-4 mb-2 group cursor-default">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,51,51,0.5)] border border-gray-800">
              <img src="/umay_emblem.jpg" alt="UMAY Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-black tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-none">
                UMAY
              </h1>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase mt-2 leading-none">
                Açık Kaynak İstihbarat Platformu
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Açık Kaynak İstihbarat ve Tehdit Analizi
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors hover:bg-gray-800/10"
            style={{ color: 'var(--foreground)' }}
            title={isDarkMode ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)' }}></div>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Sistem Aktif</span>
          </div>
        </div>
      </header>

      {/* ARAMA VE ANALİZ MODÜLÜ */}
      <section className="mb-12 card p-6">
        <h2 className="text-xl font-bold mb-4 pl-3" style={{ borderLeft: '2px solid var(--primary-red)' }}>Dinamik Hedef Analizi</h2>
        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Anahtar kelime girin (Örn: Siber Güvenlik, Kaza...)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 rounded p-3 focus:outline-none transition-colors"
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}
          />
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded p-3 focus:outline-none"
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}
          >
            <option value="1d">Son 24 Saat</option>
            <option value="7d">Son 7 Gün</option>
            <option value="1y">Tüm Zamanlar</option>
          </select>
          <button 
            type="submit" 
            disabled={analyzing || !keyword}
            className={`px-8 py-3 rounded font-bold transition-all ${
              analyzing || !keyword 
                ? 'opacity-50 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-dark-red'
            }`}
            style={{ backgroundColor: (analyzing || !keyword) ? 'var(--border-color)' : 'var(--primary-red)', color: (analyzing || !keyword) ? 'var(--text-muted)' : '#fff' }}
          >
            {analyzing ? 'Taranıyor...' : 'Analiz Et'}
          </button>
        </form>
        
        {/* PROGRESS BAR */}
        {(analyzing || progress > 0) && (
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2 font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
              <span>Durum: Veriler Toplanıyor ve Analiz Ediliyor</span>
              <span style={{ color: progress === 100 ? 'var(--success)' : 'var(--primary-red)' }}>%{progress}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
              <div 
                className="h-full transition-all duration-300 ease-out" 
                style={{ 
                  width: `${progress}%`, 
                  backgroundColor: progress === 100 ? 'var(--success)' : 'var(--primary-red)',
                  boxShadow: progress === 100 ? '0 0 10px var(--success)' : '0 0 10px var(--primary-red)'
                }}
              ></div>
            </div>
            {analyzing && (
              <div className="mt-3 text-xs italic animate-pulse" style={{ color: 'var(--text-muted)' }}>
                [*] "{keyword}" anahtar kelimesi yapay zeka tehdit modellerinden geçiriliyor, lütfen bekleyin...
              </div>
            )}
          </div>
        )}
      </section>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card p-6" style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--foreground)' }}>
          <h3 className="text-sm mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Gösterilen Haber</h3>
          <p className="text-3xl font-bold">{news.length}</p>
        </div>
        <div className="card p-6" style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--primary-red)' }}>
          <h3 className="text-sm mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Yüksek Tehdit</h3>
          <p className="text-3xl font-bold">
            {news.filter(n => n.threat_score > 0.5).length}
          </p>
        </div>
        <div className="card p-6" style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--success)' }}>
          <h3 className="text-sm mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Güvenli İçerik</h3>
          <p className="text-3xl font-bold">
            {news.filter(n => n.threat_score <= 0.5).length}
          </p>
        </div>
        {/* YENİ EKLENEN GENEL RİSK ENDEKSİ */}
        {(() => {
          const avgThreat = news.length > 0 ? (news.reduce((acc, curr) => acc + curr.threat_score, 0) / news.length) : 0;
          const avgThreatPercent = (avgThreat * 100).toFixed(1);
          const color = avgThreat > 0.5 ? 'var(--primary-red)' : (avgThreat > 0.2 ? '#f59e0b' : 'var(--success)');
          return (
            <div className="card p-6" style={{ borderLeftWidth: '4px', borderLeftColor: color }}>
              <h3 className="text-sm mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Genel Risk Endeksi</h3>
              <p className="text-3xl font-bold" style={{ color: color }}>
                %{avgThreatPercent}
              </p>
            </div>
          );
        })()}
      </div>

      {/* GRAFİK VE HARİTA (YENİ FAZ 3) */}
      {!loading && news.length > 0 && <DashboardCharts newsData={news} />}

      {/* Haber Akışı Bölümü */}
      <main>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold pl-3" style={{ borderLeft: '2px solid var(--foreground)' }}>Açık Kaynak Haberleri</h2>
          <button 
            onClick={fetchNews}
            className="text-sm transition-colors px-4 py-2 rounded text-white"
            style={{ backgroundColor: 'var(--border-color)', color: 'var(--foreground)' }}
          >
            Yenile
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: 'var(--primary-red)', borderTopColor: 'transparent' }}></div>
            <p>Sinyaller Getiriliyor...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="card p-10 text-center" style={{ color: 'var(--text-muted)' }}>
            <p>Henüz veritabanında haber yok. Analiz başlatın.</p>
          </div>
        ) : (
          <>
            {/* HABERLER GRİD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {news.filter(n => n.source !== "Ekşi Sözlük").map((item) => (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  key={item.id} 
                  className="card p-5 flex flex-col justify-between group border"
                  style={{ 
                    borderColor: item.threat_score > 0.5 ? 'var(--primary-red)' : 'var(--border-color)',
                    boxShadow: item.threat_score > 0.5 ? '0 0 15px rgba(255,51,51,0.2)' : 'none'
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{item.source}</span>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)' }}>
                        {new Date(item.timestamp).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium leading-tight transition-colors" style={{ color: item.threat_score > 0.5 ? 'var(--primary-red)' : 'var(--foreground)' }}>
                      {item.title}
                    </h3>
                  </div>
                  
                  <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tehdit Skoru</span>
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded text-white" style={{ backgroundColor: item.threat_score > 0.5 ? 'var(--primary-red)' : 'var(--success)' }}>
                      {(item.threat_score * 100).toFixed(0)}% 
                      {item.threat_score > 0.5 ? ' RİSK' : ' TEMİZ'}
                    </span>
                  </div>
                  {item.explanation && (
                    <div className="mt-3 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                      📝 {item.explanation}
                    </div>
                  )}
                </a>
              ))}
            </div>

            {/* EKŞİ SÖZLÜK GRİD */}
            {news.some(n => n.source === "Ekşi Sözlük") && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold pl-3" style={{ borderLeft: '2px solid #81c14b' }}>Ekşi Sözlük Gündemi</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.filter(n => n.source === "Ekşi Sözlük").map((item) => (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      key={item.id} 
                      className="card p-5 flex flex-col justify-between group border"
                      style={{ 
                        borderColor: item.threat_score > 0.5 ? 'var(--primary-red)' : '#81c14b',
                        boxShadow: item.threat_score > 0.5 ? '0 0 15px rgba(255,51,51,0.2)' : '0 0 5px rgba(129,193,75,0.2)'
                      }}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#81c14b' }}>{item.source}</span>
                          <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)' }}>
                            {new Date(item.timestamp).toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium leading-tight transition-colors" style={{ color: item.threat_score > 0.5 ? 'var(--primary-red)' : 'var(--foreground)' }}>
                          {item.title}
                        </h3>
                      </div>
                      
                      <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tehdit Skoru</span>
                        <span className="text-xs font-mono font-bold px-2 py-1 rounded text-white" style={{ backgroundColor: item.threat_score > 0.5 ? 'var(--primary-red)' : 'var(--success)' }}>
                          {(item.threat_score * 100).toFixed(0)}% 
                          {item.threat_score > 0.5 ? ' RİSK' : ' TEMİZ'}
                        </span>
                      </div>
                      {item.explanation && (
                        <div className="mt-3 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                          📝 {item.explanation}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
      </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-bold">UMAY Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}
