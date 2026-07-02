"use client";
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ isDarkMode, toggleTheme, setShowDashboard }) {
  const pathname = usePathname();

  const handleDashboardClick = () => {
    if (pathname === '/' && setShowDashboard) {
      setShowDashboard(true);
    } else {
      window.location.href = '/?dashboard=true'; // Fallback for other pages
    }
  };

  return (
    <nav className="w-full px-8 py-6 flex justify-between items-center z-50">
      <Link href="/" className="flex items-center gap-4 group cursor-pointer">
        <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,51,51,0.5)] group-hover:shadow-[0_0_25px_rgba(255,51,51,0.8)] transition-all duration-300 border border-gray-800">
          <img src="/umay_emblem.jpg" alt="UMAY Logo" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-2xl font-black tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 drop-shadow-md leading-none">
            UMAY
          </span>
          <span className="text-[0.65rem] font-bold tracking-widest text-red-500 uppercase mt-1.5 leading-none">
            Açık Kaynak İstihbarat Platformu
          </span>
        </div>
      </Link>
      <div className="hidden md:flex gap-8 font-medium text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className="hover:text-white transition-colors" style={{ color: pathname === '/' ? 'var(--foreground)' : '' }}>Ana Sayfa</Link>
        <Link href="/features" className="hover:text-white transition-colors" style={{ color: pathname === '/features' ? 'var(--foreground)' : '' }}>Özellikler</Link>
        <Link href="/pricing" className="hover:text-white transition-colors" style={{ color: pathname === '/pricing' ? 'var(--foreground)' : '' }}>Ücretlendirme</Link>
        <Link href="/about" className="hover:text-white transition-colors" style={{ color: pathname === '/about' ? 'var(--foreground)' : '' }}>Hakkımızda</Link>
      </div>
      <div className="flex gap-4 items-center">
        {toggleTheme && (
          <button onClick={toggleTheme} className="p-2 rounded-full transition-colors hover:bg-gray-800/10" style={{ color: 'var(--foreground)' }}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
        <button onClick={handleDashboardClick} className="text-sm px-6 py-2.5 rounded font-bold transition-all" style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)' }}>
          Sisteme Giriş
        </button>
      </div>
    </nav>
  );
}
