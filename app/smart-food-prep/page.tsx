'use client';
import { useState } from 'react';

export default function SmartFoodPrepDashboard() {
  const [activeTab, setActiveTab] = useState('Beli Makanan');
  const [input, setInput] = useState('');
  
  // Dummy Data Rekomendasi dari AI
  const recommendations = [
    { id: 1, nama: 'Soto Ayam Kuah Bening', kalori: 320, protein: 25 },
    { id: 2, nama: 'Tumis Tahu Brokoli', kalori: 180, protein: 12 },
    { id: 3, nama: 'Salad Buah Naga', kalori: 150, protein: 2 },
    { id: 4, nama: 'Ikan Bakar Rica', kalori: 250, protein: 30 },
    { id: 5, nama: 'Oatmeal Pisang', kalori: 210, protein: 8 },
  ];

  // State untuk menyimpan jadwal mingguan
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, any[]>>({
    Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [], Sabtu: [], Minggu: []
  });

  // State untuk Popup Klik-untuk-Tambah
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState('Senin');

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Wajib agar elemen bisa di-drop
  };

  // ================= CORE ACTION =================
  const addMealToDay = (day: string, meal: any) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: [...prev[day], meal]
    }));
    setSelectedMeal(null); // Tutup popup jika pakai metode klik
  };

  const removeMeal = (day: string, index: number) => {
    const newDayPlan = [...weeklyPlan[day]];
    newDayPlan.splice(index, 1);
    setWeeklyPlan(prev => ({ ...prev, [day]: newDayPlan }));
  };

  return (
    <main className="h-screen w-full bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* ================= 1. SIDEBAR KIRI (COMMAND CENTER) ================= */}
      <aside className="w-full md:w-[30%] h-[50vh] md:h-screen border-r border-white/10 bg-white/[0.02] flex flex-col">
        {/* Header Tab */}
        <div className="p-6 border-b border-white/10 shrink-0">
          <div className="flex bg-black/40 rounded-xl p-1 mb-6 border border-white/5">
            <button 
              onClick={() => setActiveTab('Beli Makanan')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'Beli Makanan' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Beli Makanan
            </button>
            <button 
              onClick={() => setActiveTab('Masak Sendiri')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'Masak Sendiri' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Masak Sendiri
            </button>
          </div>

          <p className="text-sm text-gray-400 mb-4 text-center">
            {activeTab === 'Beli Makanan' ? 'Masukkan keyword makanan yang ingin dibeli' : 'Masukkan bahan baku yang Anda miliki'}
          </p>
          <textarea 
            placeholder={activeTab === 'Beli Makanan' ? "Misal: Nasi Goreng Seafood..." : "Misal: Telur, Bayam, Bawang..."}
            className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* List Rekomendasi (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4">Rekomendasi Menu</h3>
          {recommendations.map((meal) => (
            <div 
              key={meal.id}
              draggable
              onDragStart={(e) => handleDragStart(e, meal)}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-emerald-500/30 transition-all group relative"
            >
              <h4 className="font-bold text-sm mb-1">{meal.nama}</h4>
              <p className="text-xs text-gray-400">{meal.kalori} kcal • {meal.protein}g Protein</p>
              
              {/* Tombol Klik-untuk-Tambah (Metode 2) */}
              <button 
                onClick={() => setSelectedMeal(meal)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-black font-bold"
                title="Tambahkan ke Jadwal"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ================= 2. AREA UTAMA (KANAN) ================= */}
      <section className="flex-1 flex flex-col h-[50vh] md:h-screen relative">
        
        {/* Top: Weekly Planner (7 Columns) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-4 custom-scrollbar bg-gradient-to-br from-transparent to-emerald-900/10">
          {Object.keys(weeklyPlan).map((day) => (
            <div 
              key={day} 
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
              className="min-w-[260px] flex-1 flex flex-col bg-black/40 border border-white/5 rounded-3xl overflow-hidden"
            >
              {/* Header Hari */}
              <div className="bg-white/5 py-4 text-center border-b border-white/5">
                <h2 className="font-bold tracking-wide">{day}</h2>
              </div>
              
              {/* Drop Zone / Daftar Makanan di hari tersebut */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {weeklyPlan[day].length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 text-xs">
                    Tarik menu ke sini<br/>atau klik tombol +
                  </div>
                ) : (
                  weeklyPlan[day].map((meal, index) => (
                    <div key={index} className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl relative group">
                      <h4 className="font-semibold text-sm text-emerald-300">{meal.nama}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{meal.kalori} kcal</p>
                      <button 
                        onClick={() => removeMeal(day, index)}
                        className="absolute right-2 top-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300"
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
        <div className="h-[250px] shrink-0 border-t border-white/10 bg-black/60 p-6 flex gap-8 items-center backdrop-blur-xl">
           <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Rekomendasi Ahli Harian</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                (Sesuai Hari yang Dipilih) Sistem mendeteksi bahwa asupan protein Anda di hari Senin kurang 15g dari target harian. Kami sangat merekomendasikan penambahan <span className="text-emerald-400 font-bold">Telur Rebus</span> pada waktu camilan sore.
              </p>
           </div>
           
           {/* Visualisasi Pie Chart Placeholder */}
           <div className="w-[150px] h-[150px] rounded-full border-8 border-emerald-500 flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)'}}></div>
              <div className="absolute inset-0 rounded-full border-8 border-red-500" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0 100%)'}}></div>
              <div className="z-10 text-center">
                 <span className="block text-2xl font-bold">85%</span>
                 <span className="text-[10px] uppercase tracking-widest text-gray-400">Gizi Baik</span>
              </div>
           </div>
        </div>

        {/* ================= MODAL / POPUP TAMBAH MANUAL ================= */}
        {selectedMeal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 p-6 rounded-3xl w-full max-w-sm">
              <h3 className="font-bold text-lg mb-4">Tambahkan ke Jadwal</h3>
              <p className="text-emerald-400 text-sm mb-6">{selectedMeal.nama}</p>
              
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pilih Hari</label>
              <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white mb-6 focus:outline-none focus:border-emerald-500"
              >
                {Object.keys(weeklyPlan).map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
              </select>

              <div className="flex gap-3">
                <button onClick={() => setSelectedMeal(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-bold">Batal</button>
                <button onClick={() => addMealToDay(selectedDay, selectedMeal)} className="flex-1 py-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors text-sm font-bold">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Styling Khusus Scrollbar agar rapi (Bisa dipindah ke globals.css nantinya) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.5); }
      `}} />
    </main>
  );
}