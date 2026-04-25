'use client';
import MenuCard from '@/components/MenuCard';
import { useState } from 'react';

export default function Dashboard() {
  const [inventaris, setInventaris] = useState('');
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventaris.trim()) return;
    
    setLoading(true);
    const bahanArray = inventaris.split(',').map(b => b.trim()).filter(b => b !== '');

    try {
      const res = await fetch('http://127.0.0.1:8080/api/v1/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aset_inventaris: bahanArray }) 
      });
      
      const data = await res.json();
      setMenus(data || []);
    } catch (error) {
      console.error("Gagal menghubungi server AI:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#000000] selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-hidden px-6 py-20 md:py-32 flex flex-col">
      
      {/* Keyframe Injector (Hanya untuk animasi lokal) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* Ambient Glow Effects */}
      <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[80%] md:w-[50%] h-[400px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      
      <div className="max-w-4xl w-full mx-auto relative z-10 flex-1 flex flex-col">
        <header className="mb-16 text-center animate-[fadeInUp_0.8s_ease-out_both]">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-[11px] font-bold tracking-[0.2em] text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
            Smart Kitchen AI
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 tracking-tighter mb-6 leading-tight">
            Menu Harian Anda.
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-base md:text-lg leading-relaxed font-medium">
            Ketikkan Aset / Inventaris yang tersedia. Biarkan kecerdasan buatan meracik rekomendasinya.
          </p>
        </header>

        {/* Form Input Sekelas Command Palette */}
        <form onSubmit={analyzeKitchen} className="mb-20 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto w-full animate-[fadeInUp_1s_ease-out_both]">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <input 
              type="text" 
              value={inventaris}
              onChange={(e) => setInventaris(e.target.value)}
              placeholder="Misal: Tahu, Kecap, Bawang Putih..." 
              className="relative w-full px-6 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300 backdrop-blur-xl text-lg shadow-2xl"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="relative sm:w-auto px-8 py-5 rounded-2xl bg-white text-black font-bold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses
              </span>
            ) : 'Analisis'}
          </button>
        </form>

        {/* Hasil Rekomendasi (UI Terkunci, Style Diperbarui) */}
        <div className="flex-1">
          {menus?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {menus.map((menu: any, index: number) => (
                <MenuCard key={index} menu={menu} delay={index * 0.15} />
              ))}
            </div>
          ) : (
             <div className="text-center p-12 mt-10 opacity-50 flex flex-col items-center animate-[fadeInUp_1.2s_ease-out_both]">
               <div className="w-16 h-16 mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                 <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
               </div>
               <p className="text-gray-500 font-medium tracking-wide">Menunggu data masukan...</p>
             </div>
          )}
        </div>
      </div>
    </main>
  );
}