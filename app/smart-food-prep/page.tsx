'use client';
import { useState } from 'react';

export default function SmartFoodPrepDashboard() {
  const [activeTab, setActiveTab] = useState('Beli Makanan');
  const [input, setInput] = useState('');
  
  const recommendations = [
    { id: 1, nama: 'Soto Ayam Kuah Bening', kalori: 320, protein: 25 },
    { id: 2, nama: 'Tumis Tahu Brokoli', kalori: 180, protein: 12 },
    { id: 3, nama: 'Salad Buah Naga', kalori: 150, protein: 2 },
    { id: 4, nama: 'Ikan Bakar Rica', kalori: 250, protein: 30 },
    { id: 5, nama: 'Oatmeal Pisang', kalori: 210, protein: 8 },
  ];

  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, any[]>>({
    Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [], Sabtu: [], Minggu: []
  });

  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState('Senin');

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
  };

  const removeMeal = (day: string, index: number) => {
    const newDayPlan = [...weeklyPlan[day]];
    newDayPlan.splice(index, 1);
    setWeeklyPlan(prev => ({ ...prev, [day]: newDayPlan }));
  };

  return (
    <main className="h-screen w-full bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* ================= 1. SIDEBAR (RESPONSIF) ================= */}
      {/* HP: Tinggi 40%, Desktop: Tinggi Full & Lebar 380px/420px */}
      <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 h-[45vh] md:h-screen border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02] flex flex-col z-20">
        <div className="p-4 md:p-6 border-b border-white/10 shrink-0">
          <div className="flex bg-black/40 rounded-xl p-1 mb-4 md:mb-6 border border-white/5">
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

          <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4">
            {activeTab === 'Beli Makanan' ? 'Keyword pencarian:' : 'Bahan baku yang Anda miliki:'}
          </p>
          <textarea 
            placeholder={activeTab === 'Beli Makanan' ? "Misal: Nasi Goreng..." : "Misal: Telur, Bayam..."}
            className="w-full h-16 md:h-28 bg-black/40 border border-white/10 rounded-xl p-3 md:p-4 text-sm md:text-base focus:outline-none focus:border-emerald-500/50 transition-colors resize-none shadow-inner"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 custom-scrollbar">
          <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2 md:mb-4">Rekomendasi Menu</h3>
          {recommendations.map((meal) => (
            <div 
              key={meal.id}
              draggable
              onDragStart={(e) => handleDragStart(e, meal)}
              className="bg-white/5 border border-white/10 p-3 md:p-5 rounded-xl md:rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-emerald-500/30 transition-all group relative"
            >
              <h4 className="font-bold text-sm md:text-base mb-1">{meal.nama}</h4>
              <p className="text-xs md:text-sm text-gray-400">{meal.kalori} kcal • {meal.protein}g</p>
              
              <button 
                onClick={() => setSelectedMeal(meal)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-black font-bold text-lg md:text-xl"
                title="Tambahkan ke Jadwal"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ================= 2. AREA UTAMA (RESPONSIF) ================= */}
      {/* HP: Tinggi 55%, Desktop: Tinggi Full */}
      <section className="flex-1 flex flex-col h-[55vh] md:h-screen relative min-w-0">
        
        {/* Top: Weekly Planner */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 pb-6 md:pb-8 flex gap-4 md:gap-6 custom-scrollbar bg-gradient-to-br from-transparent to-emerald-900/10">
          {Object.keys(weeklyPlan).map((day) => (
            <div 
              key={day} 
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
              // HP: Kartu sedikit lebih kecil (260px) agar muat di layar HP, Desktop: 320px
              className="w-[260px] md:min-w-[320px] shrink-0 flex flex-col bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-white/5 py-3 md:py-4 text-center border-b border-white/5">
                <h2 className="font-bold tracking-wide text-base md:text-lg">{day}</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 custom-scrollbar">
                {weeklyPlan[day].length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4 border-2 border-dashed border-white/10 rounded-xl md:rounded-2xl text-gray-500 text-xs md:text-sm">
                    Tarik menu ke sini<br/>atau klik tombol +
                  </div>
                ) : (
                  weeklyPlan[day].map((meal, index) => (
                    <div key={index} className="bg-emerald-500/10 border border-emerald-500/20 p-3 md:p-4 rounded-lg md:rounded-xl relative group animate-[fadeInUp_0.3s_ease-out]">
                      <h4 className="font-semibold text-sm md:text-base text-emerald-300 pr-6 truncate">{meal.nama}</h4>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1">{meal.kalori} kcal</p>
                      <button 
                        onClick={() => removeMeal(day, index)}
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

        {/* Bottom: Insight & Nutrition Panel (Responsif Stack) */}
        {/* HP: Tinggi Fleksibel & Scrollable, Desktop: Tinggi 250px Fix */}
        <div className="shrink-0 border-t border-white/10 bg-black/80 p-4 md:p-8 flex flex-row gap-4 md:gap-8 items-center backdrop-blur-xl z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[150px] md:max-h-none md:h-[250px] overflow-y-auto md:overflow-visible custom-scrollbar">
           <div className="flex-1">
              <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-3">Rekomendasi Ahli Harian</h3>
              <p className="text-[10px] md:text-base text-gray-400 leading-snug md:leading-relaxed max-w-3xl">
                (Sesuai Hari yang Dipilih) Asupan protein di hari Senin kurang 15g. Tambahkan <span className="text-emerald-400 font-bold">Telur Rebus</span> pada waktu camilan.
              </p>
           </div>
           
           {/* Pie Chart: Lebih kecil di HP (80px) vs Desktop (160px) */}
           <div className="w-[80px] h-[80px] md:w-[160px] md:h-[160px] shrink-0 rounded-full border-[4px] md:border-8 border-emerald-500 flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 rounded-full border-[4px] md:border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)'}}></div>
              <div className="absolute inset-0 rounded-full border-[4px] md:border-8 border-red-500" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0 100%)'}}></div>
              <div className="z-10 text-center bg-black/60 w-full h-full rounded-full flex flex-col items-center justify-center">
                 <span className="block text-sm md:text-3xl font-extrabold text-white">85%</span>
                 <span className="hidden md:block text-xs uppercase tracking-widest text-emerald-400 mt-1 font-bold">Gizi Baik</span>
              </div>
           </div>
        </div>

        {/* MODAL / POPUP */}
        {selectedMeal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl w-full max-w-md shadow-2xl animate-[fadeInUp_0.2s_ease-out]">
              <h3 className="font-bold text-xl md:text-2xl mb-1 md:mb-2">Tambahkan Jadwal</h3>
              <p className="text-emerald-400 text-sm md:text-base mb-6 md:mb-8 font-medium">{selectedMeal.nama}</p>
              
              <label className="block text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Pilih Hari</label>
              <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white text-base md:text-lg mb-6 md:mb-8 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {Object.keys(weeklyPlan).map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
              </select>

              <div className="flex gap-3 md:gap-4">
                <button onClick={() => setSelectedMeal(null)} className="flex-1 py-3 md:py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm md:text-base font-bold text-gray-300">Batal</button>
                <button onClick={() => addMealToDay(selectedDay, selectedMeal)} className="flex-1 py-3 md:py-4 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors text-sm md:text-base font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.4)]">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Scrollbar CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 12px; }
        }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 10px; margin: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16,185,129,0.8); }
      `}} />
    </main>
  );
}