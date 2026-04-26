'use client';
import { useState } from 'react';

export default function SmartFoodPrepDashboard() {
  const [activeTab, setActiveTab] = useState('Beli Makanan');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [recommendations, setRecommendations] = useState<any[]>([
    { id: 1, nama: 'Soto Ayam Kuah Bening', kalori: 320, protein: 25 },
    { id: 2, nama: 'Tumis Tahu Brokoli', kalori: 180, protein: 12 },
  ]);

  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, any[]>>({
    Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [], Sabtu: [], Minggu: []
  });

  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedDayModal, setSelectedDayModal] = useState('Senin');
  const [activeDay, setActiveDay] = useState('Senin');

  // ================= FUNGSI PENCARIAN & VARIASI MENU =================
  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);

    if (activeTab === 'Masak Sendiri') {
      const bahanArray = input.split(',').map(b => b.trim()).filter(b => b !== '');
      try {
        const res = await fetch('https://nachsyas-smart-kitchen-assistant-api.hf.space/api/v1/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aset_inventaris: bahanArray }) 
        });
        
        const data = await res.json();
        
        if (data && Array.isArray(data)) {
          const formattedData = data.map((item: any, index: number) => ({
            id: Date.now() + index,
            nama: item.Menu || item.nama_menu || item.Nama || "Menu AI Spesial",
            kalori: parseInt(item.Kalori) || Math.floor(Math.random() * 200) + 150,
            protein: parseInt(item.Protein) || Math.floor(Math.random() * 20) + 5,
          }));
          setRecommendations(formattedData);
        }
      } catch (error) {
        console.error("Gagal menghubungi server AI:", error);
      }
    } else {
      // LOGIKA BARU: Beli Makanan (Variasi Menu Lebih Kaya & Menggugah Selera)
      // Huruf kapital di awal kata agar terlihat seperti nama menu di GoFood/GrabFood
      const kataKunci = input.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      const variasiKuliner = [
        `${kataKunci} Bakar Madu (Resto Bintang 4)`,
        `${kataKunci} Goreng Krispi + Nasi Hangat`,
        `Dimsum ${kataKunci} Saus Mentai`,
        `Sate ${kataKunci} Bumbu Kacang Kental`,
        `Sup Tulang ${kataKunci} Kuah Gurih`
      ];

      setTimeout(() => {
        const hasilBeli = variasiKuliner.map((namaMenu, index) => ({
          id: Date.now() + index,
          nama: namaMenu,
          kalori: Math.floor(Math.random() * 250) + 200, // Kalori random 200-450
          protein: Math.floor(Math.random() * 25) + 10,  // Protein random 10-35g
        }));
        setRecommendations(hasilBeli);
      }, 1500);
    }
    
    setLoading(false);
  };

  // ================= DRAG & DROP LOGIC =================
  const handleDragStart = (e: React.DragEvent, meal: any) => {
    e.dataTransfer.setData('meal', JSON.stringify(meal));
  };

  const handleDrop = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    const mealData = e.dataTransfer.getData('meal');
    if (mealData) {
      const meal = JSON.parse(mealData);
      addMealToDay(day, meal);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const addMealToDay = (day: string, meal: any) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: [...prev[day], meal]
    }));
    setSelectedMeal(null); 
    setActiveDay(day); 
  };

  const removeMeal = (day: string, index: number) => {
    const newDayPlan = [...weeklyPlan[day]];
    newDayPlan.splice(index, 1);
    setWeeklyPlan(prev => ({ ...prev, [day]: newDayPlan }));
  };

  // ================= KALKULASI GIZI DENGAN BAHASA AWAM =================
  const currentDayMeals = weeklyPlan[activeDay];
  const totalKalori = currentDayMeals.reduce((sum, meal) => sum + meal.kalori, 0);
  const totalProtein = currentDayMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const giziScore = Math.min(100, Math.round((totalKalori / 2000) * 100));

  let rekomendasiTeks = "";
  if (currentDayMeals.length === 0) {
    rekomendasiTeks = `Jadwal makan hari ${activeDay} masih kosong nih. Yuk, cari makanan favoritmu di samping lalu geser ke sini!`;
  } else if (totalKalori < 1000) {
    rekomendasiTeks = `Makanmu di hari ${activeDay} masih kurang banyak (baru ${totalKalori} kalori). Jangan lupa ngemil sehat atau tambah porsi lauk ya, biar nggak lemes pas aktivitas!`;
  } else if (totalKalori > 2500) {
    rekomendasiTeks = `Waduh, asupan hari ${activeDay} lumayan tinggi nih (tembus ${totalKalori} kalori). Kurangi makanan manis atau gorengan ya kalau lagi nggak banyak gerak.`;
  } else {
    rekomendasiTeks = `Mantap! Porsi hari ${activeDay} udah pas banget. Kamu dapat asupan ${totalProtein} gram protein dan ${totalKalori} kalori. Pas buat jaga badan tetap sehat dan fit!`;
  }

  return (
    <main className="h-screen w-full bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* ================= 1. SIDEBAR ================= */}
      <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 h-[50vh] md:h-screen border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02] flex flex-col z-20">
        <div className="p-4 md:p-6 border-b border-white/10 shrink-0">
          <div className="flex bg-black/40 rounded-xl p-1 mb-4 border border-white/5">
            <button 
              onClick={() => setActiveTab('Beli Makanan')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-bold rounded-lg transition-all ${activeTab === 'Beli Makanan' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Beli Makanan
            </button>
            <button 
              onClick={() => setActiveTab('Masak Sendiri')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-bold rounded-lg transition-all ${activeTab === 'Masak Sendiri' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Masak Sendiri
            </button>
          </div>
          
          <textarea 
            placeholder={activeTab === 'Beli Makanan' ? "Mau beli lauk apa? (Misal: Ayam, Udang, Telur)..." : "Ketik bahan yang kamu punya (Misal: Telur, Bayam)..."}
            className="w-full h-16 md:h-20 bg-black/40 border border-white/10 rounded-xl p-3 md:p-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none shadow-inner mb-3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          />

          <button 
            onClick={handleSearch}
            disabled={loading || !input.trim()}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Meracik Menu...
              </>
            ) : (
              activeTab === 'Beli Makanan' ? 'Cari Ide Makanan Beli' : 'Racik Menu dengan AI'
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 custom-scrollbar relative">
          <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2 md:mb-4">Pilihan Menu Buat Kamu</h3>
          
          {loading && (
             <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-400 font-medium text-xs tracking-widest uppercase animate-pulse">Menyiapkan Rekomendasi...</p>
             </div>
          )}

          {recommendations.length === 0 && !loading ? (
             <div className="text-center text-gray-500 text-sm mt-10">Ketikkan makanan favoritmu di atas ya!</div>
          ) : (
            recommendations.map((meal) => (
              <div 
                key={meal.id}
                draggable
                onDragStart={(e) => handleDragStart(e, meal)}
                className="bg-white/5 border border-white/10 p-3 md:p-5 rounded-xl md:rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-emerald-500/30 transition-all group relative"
              >
                <h4 className="font-bold text-sm md:text-base mb-1 pr-6 leading-snug">{meal.nama}</h4>
                <p className="text-xs md:text-sm text-gray-400 mt-2">{meal.kalori} kalori • {meal.protein}g protein</p>
                <button 
                  onClick={() => setSelectedMeal(meal)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-black font-bold text-lg md:text-xl"
                >
                  +
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ================= 2. AREA UTAMA ================= */}
      <section className="flex-1 flex flex-col h-[50vh] md:h-screen relative min-w-0">
        
        {/* Top: Weekly Planner */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 pb-6 md:pb-8 flex gap-4 md:gap-6 custom-scrollbar bg-gradient-to-br from-transparent to-emerald-900/10">
          {Object.keys(weeklyPlan).map((day) => (
            <div 
              key={day} 
              onClick={() => setActiveDay(day)}
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
              className={`w-[260px] md:min-w-[320px] shrink-0 flex flex-col bg-black/40 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 ${
                activeDay === day 
                ? 'border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] transform -translate-y-1' 
                : 'border-2 border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`py-3 md:py-4 text-center border-b ${activeDay === day ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/5'}`}>
                <h2 className={`font-bold tracking-wide text-base md:text-lg ${activeDay === day ? 'text-emerald-400' : 'text-white'}`}>{day}</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 custom-scrollbar pointer-events-none">
                {weeklyPlan[day].length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-white/10 rounded-xl md:rounded-2xl text-gray-500 text-xs md:text-sm">
                    <span className="text-2xl mb-2 opacity-50">🍽️</span>
                    Tarik menu ke sini
                  </div>
                ) : (
                  weeklyPlan[day].map((meal, index) => (
                    <div key={index} className="bg-emerald-500/10 border border-emerald-500/20 p-3 md:p-4 rounded-lg md:rounded-xl relative group animate-[fadeInUp_0.3s_ease-out] pointer-events-auto">
                      <h4 className="font-semibold text-sm md:text-base text-emerald-300 pr-6 truncate">{meal.nama}</h4>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1">{meal.kalori} kalori</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeMeal(day, index); }}
                        className="absolute right-2 top-2 text-red-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300 font-bold text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Insight & Nutrition Panel */}
        <div className="shrink-0 border-t border-white/10 bg-black/80 p-4 md:p-8 flex flex-row gap-4 md:gap-8 items-center backdrop-blur-xl z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[150px] md:max-h-none md:h-[250px] overflow-y-auto md:overflow-visible custom-scrollbar">
           <div className="flex-1">
              <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-3">
                Evaluasi Gizi: <span className="text-emerald-400">{activeDay}</span>
              </h3>
              <p className="text-[10px] md:text-base text-gray-400 leading-snug md:leading-relaxed max-w-3xl animate-[fadeIn_0.5s_ease-in-out]">
                {rekomendasiTeks}
              </p>
           </div>
           
           <div 
             className="w-[80px] h-[80px] md:w-[160px] md:h-[160px] shrink-0 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-1000"
             style={{ 
               background: `conic-gradient(#10b981 ${giziScore}%, #1f2937 ${giziScore}%)`,
               padding: '8px'
             }}
           >
              <div className="bg-black/90 w-full h-full rounded-full flex flex-col items-center justify-center">
                 <span className="block text-sm md:text-3xl font-extrabold text-white">{giziScore}%</span>
                 <span className="hidden md:block text-[10px] uppercase tracking-widest text-emerald-400 mt-1 font-bold">Terpenuhi</span>
              </div>
           </div>
        </div>

        {/* MODAL / POPUP */}
        {selectedMeal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pointer-events-auto">
            <div className="bg-[#111] border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl w-full max-w-md shadow-2xl animate-[fadeInUp_0.2s_ease-out]">
              <h3 className="font-bold text-xl md:text-2xl mb-1 md:mb-2">Tambahkan ke Jadwal</h3>
              <p className="text-emerald-400 text-sm md:text-base mb-6 md:mb-8 font-medium">{selectedMeal.nama}</p>
              
              <label className="block text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Pilih Hari:</label>
              <select 
                value={selectedDayModal}
                onChange={(e) => setSelectedDayModal(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white text-base md:text-lg mb-6 md:mb-8 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {Object.keys(weeklyPlan).map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
              </select>

              <div className="flex gap-3 md:gap-4">
                <button onClick={() => setSelectedMeal(null)} className="flex-1 py-3 md:py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm md:text-base font-bold text-gray-300">Batal</button>
                <button onClick={() => addMealToDay(selectedDayModal, selectedMeal)} className="flex-1 py-3 md:py-4 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors text-sm md:text-base font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.4)]">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </section>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 12px; }
        }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 10px; margin: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16,185,129,0.8); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </main>
  );
}