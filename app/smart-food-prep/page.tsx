'use client';
import { useState } from 'react';

export default function SmartFoodPrepDashboard() {
  const [activeTab, setActiveTab] = useState('Beli Makanan');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // State untuk mengunci hari yang sudah di-save
  const [lockedDays, setLockedDays] = useState<Record<string, boolean>>({});

  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, any[]>>({
    Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [], Sabtu: [], Minggu: []
  });

  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [recipeModal, setRecipeModal] = useState<any>(null);
  const [selectedDayModal, setSelectedDayModal] = useState('Senin');
  const [activeDay, setActiveDay] = useState('Senin');

  // ================= FUNGSI PENCARIAN (PURE AI DATA) =================
  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);

    let contextKeyword = activeTab === 'Beli Makanan' 
      ? `Rekomendasi beli makanan & minuman untuk: ${input}` 
      : `Rekomendasi masak dengan bahan mentah: ${input}`;

    const bahanArray = contextKeyword.split(',').map(b => b.trim()).filter(b => b !== '');
    
    try {
      const res = await fetch('https://nachsyas-smart-kitchen-assistant-api.hf.space/api/v1/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aset_inventaris: bahanArray }) 
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const rawData = await res.json();
      const dataList = Array.isArray(rawData) ? rawData : (rawData.data || rawData.recommendations || []);
      
      if (dataList && dataList.length > 0) {
        const formattedData = dataList.map((item: any, index: number) => {
          // Parsing KETAT dari response Golang V3, JANGAN ADA Math.random()
          return {
            id: Date.now() + index,
            nama: item.nama || item.Nama || "Menu AI",
            kategori: item.kategori || item.Kategori || "Makanan",
            kalori: parseInt(item.kalori || item.Kalori) || 0,
            protein: parseInt(item.protein || item.Protein) || 0,
            karbo: parseInt(item.karbo || item.Karbo) || 0,
            lemak: parseInt(item.lemak || item.Lemak) || 0,
            zatBesi: parseInt(item.zat_besi || item.Zat_besi) || 0,
            vitamin: item.vitamin || item.Vitamin || "-",
            resep: item.resep || item.Resep || "Resep tidak disediakan AI.",
          };
        });
        setRecommendations(formattedData);
      } else {
         setRecommendations([]);
      }
    } catch (error) {
      console.error("Error Backend:", error);
      alert("Gagal mengambil data dari server AI. Pastikan backend berjalan.");
      setRecommendations([]);
    }
    
    setLoading(false);
  };

  // ================= DRAG & DROP & SAVE LOGIC =================
  const handleDrop = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    if (lockedDays[day]) return alert(`Hari ${day} sudah di-save dan tidak bisa diubah kecuali di-unsave!`);
    const mealData = e.dataTransfer.getData('meal');
    if (mealData) {
      addMealToDay(day, JSON.parse(mealData));
    }
  };

  const addMealToDay = (day: string, meal: any) => {
    setWeeklyPlan(prev => ({ ...prev, [day]: [...prev[day], meal] }));
    setSelectedMeal(null); 
    setActiveDay(day); 
  };

  const toggleSaveDay = (day: string) => {
    setLockedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  // ================= KALKULASI GIZI MULTI-DIMENSI =================
  const currentMeals = weeklyPlan[activeDay];
  const totalKalori = currentMeals.reduce((s, m) => s + m.kalori, 0);
  const totalProtein = currentMeals.reduce((s, m) => s + m.protein, 0);
  const totalKarbo = currentMeals.reduce((s, m) => s + m.karbo, 0);
  const totalLemak = currentMeals.reduce((s, m) => s + m.lemak, 0);
  const totalZatBesi = currentMeals.reduce((s, m) => s + m.zatBesi, 0);
  
  // Kalkulasi pie chart CSS Conic Gradient
  // Asumsi target harian: Protein 50g, Karbo 250g, Lemak 60g
  const pPct = Math.min(100, Math.round((totalProtein / 50) * 100)); 
  const kPct = Math.min(100, Math.round((totalKarbo / 250) * 100)); 
  const lPct = Math.min(100, Math.round((totalLemak / 60) * 100)); 

  // Normalisasi persentase agar tidak melebihi 100% lingkaran visual
  const totalVisual = pPct + kPct + lPct;
  const pVisual = totalVisual > 0 ? (pPct / totalVisual) * 100 : 0;
  const kVisual = totalVisual > 0 ? (kPct / totalVisual) * 100 : 0;
  const lVisual = totalVisual > 0 ? (lPct / totalVisual) * 100 : 0;

  return (
    <main className="h-screen w-full bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* ================= SIDEBAR KONTROL ================= */}
      <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 h-[50vh] md:h-screen border-r border-white/10 bg-white/[0.02] flex flex-col z-20">
        <div className="p-4 md:p-6 border-b border-white/10 shrink-0">
          <div className="flex bg-black/40 rounded-xl p-1 mb-4 border border-white/5">
            <button onClick={() => { setActiveTab('Beli Makanan'); setRecommendations([]); }} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab === 'Beli Makanan' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Beli Makanan</button>
            <button onClick={() => { setActiveTab('Masak Sendiri'); setRecommendations([]); }} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeTab === 'Masak Sendiri' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Masak Sendiri</button>
          </div>
          <textarea 
            placeholder="Ketik makanan atau bahan yang Anda inginkan..."
            className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500/50 resize-none mb-3"
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          />
          <button onClick={handleSearch} disabled={loading || !input.trim()} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 text-sm">
            {loading ? 'Mengambil Data dari AI...' : 'Racik Menu & Minuman'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col relative">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 shrink-0">Daftar Pilihan (Akurat AI)</h3>
          
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center pb-10">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             </div>
          ) : recommendations.length === 0 ? (
             <div className="flex-1 flex items-center justify-center pb-10 text-center text-gray-500 text-sm">
               Ketikkan makanan/bahan di atas.
             </div>
          ) : (
            <div className="space-y-3 pb-4">
              {recommendations.map((meal) => (
                <div key={meal.id} draggable onDragStart={(e) => e.dataTransfer.setData('meal', JSON.stringify(meal))} className="bg-white/5 border border-white/10 p-4 rounded-xl relative group hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start pr-12">
                     <h4 className="font-bold text-sm leading-snug">{meal.nama}</h4>
                     <span className={`text-[9px] uppercase px-2 py-1 rounded-full font-bold ${meal.kategori === 'Minuman' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{meal.kategori}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {meal.kalori} kcal • P: {meal.protein}g • K: {meal.karbo}g • L: {meal.lemak}g
                  </p>
                  
                  {/* Tombol Lihat Resep (Menampilkan resep asli dari AI) */}
                  <button onClick={() => setRecipeModal(meal)} className="mt-3 text-[10px] uppercase font-bold text-emerald-400 hover:text-emerald-300">
                    📖 Lihat Resep & Detail
                  </button>
                  
                  <button onClick={() => setSelectedMeal(meal)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-black font-bold shadow-lg">+</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ================= AREA UTAMA ================= */}
      <section className="flex-1 flex flex-col h-[50vh] md:h-screen relative min-w-0">
        
        {/* Top: Weekly Planner */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 pb-8 flex gap-6 custom-scrollbar bg-gradient-to-br from-transparent to-emerald-900/10">
          {Object.keys(weeklyPlan).map((day) => (
            <div key={day} onClick={() => setActiveDay(day)} onDrop={(e) => handleDrop(e, day)} onDragOver={(e) => e.preventDefault()} className={`min-w-[320px] shrink-0 flex flex-col bg-black/40 border-2 rounded-3xl overflow-hidden shadow-2xl transition-all ${activeDay === day ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] transform -translate-y-1' : 'border-white/5'} ${lockedDays[day] ? 'opacity-80 border-gray-600' : ''}`}>
              <div className="py-4 px-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className={`font-bold text-lg tracking-wide ${activeDay === day ? 'text-emerald-400' : 'text-white'}`}>{day}</h2>
                <button onClick={() => toggleSaveDay(day)} className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${lockedDays[day] ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40'}`}>
                  {lockedDays[day] ? '🔒 UNSAVE' : '💾 SAVE'}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {weeklyPlan[day].length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 text-sm">
                    <span className="text-2xl mb-2 opacity-50">{lockedDays[day] ? '🔒' : '🍽️'}</span>
                    {lockedDays[day] ? 'Hari Dikunci' : 'Tarik menu ke sini'}
                  </div>
                ) : (
                  weeklyPlan[day].map((meal, index) => (
                    <div key={index} className={`border p-4 rounded-xl relative group ${meal.kategori === 'Minuman' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                      <h4 className={`font-semibold text-sm pr-6 truncate ${meal.kategori === 'Minuman' ? 'text-blue-300' : 'text-emerald-300'}`}>{meal.nama}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{meal.kalori} kcal</p>
                      {!lockedDays[day] && (
                         <button onClick={(e) => { e.stopPropagation(); const nw = [...weeklyPlan[day]]; nw.splice(index, 1); setWeeklyPlan({...weeklyPlan, [day]: nw}); }} className="absolute right-2 top-2 w-6 h-6 flex items-center justify-center bg-red-500/20 rounded-full text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white font-bold text-xs transition-opacity">✕</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Insight & Multi-Nutrition Panel */}
        <div className="h-[250px] shrink-0 border-t border-white/10 bg-black/80 p-8 flex gap-8 items-center z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
           <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                Evaluasi Makro: <span className="text-emerald-400">{activeDay}</span> {lockedDays[activeDay] && <span className="text-sm bg-gray-700 px-2 py-1 rounded text-white">LOCKED</span>}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Total Kalori</p>
                  <p className="text-xl font-bold text-white">{totalKalori} <span className="text-xs">kcal</span></p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-blue-500/20">
                  <p className="text-[10px] uppercase tracking-widest text-blue-400">Protein (Otot)</p>
                  <p className="text-xl font-bold text-white">{totalProtein} <span className="text-xs">g</span></p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-yellow-500/20">
                  <p className="text-[10px] uppercase tracking-widest text-yellow-400">Karbohidrat (Energi)</p>
                  <p className="text-xl font-bold text-white">{totalKarbo} <span className="text-xs">g</span></p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-red-500/20">
                  <p className="text-[10px] uppercase tracking-widest text-red-400">Lemak</p>
                  <p className="text-xl font-bold text-white">{totalLemak} <span className="text-xs">g</span></p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 flex gap-4">
                 <span>🔗 Zat Besi: <strong className="text-white">{totalZatBesi} mg</strong></span>
              </p>
           </div>
           
           {/* Multi-color Pie Chart Akurat */}
           <div className="flex flex-col items-center justify-center gap-2">
             <div className="w-[140px] h-[140px] shrink-0 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.05)]"
               style={{ 
                 background: `conic-gradient(#3b82f6 ${pVisual}%, #eab308 ${pVisual}% ${pVisual + kVisual}%, #ef4444 ${pVisual + kVisual}% 100%)`, 
                 padding: '8px' 
               }}>
                <div className="bg-black/90 w-full h-full rounded-full flex flex-col items-center justify-center">
                   <span className="text-sm font-bold text-gray-400">Rasio Makro</span>
                </div>
             </div>
             <div className="flex gap-2 text-[8px] uppercase tracking-widest font-bold">
                <span className="text-blue-400">■ Pro</span>
                <span className="text-yellow-400">■ Karbo</span>
                <span className="text-red-400">■ Lemak</span>
             </div>
           </div>
        </div>

        {/* ================= MODAL LIHAT RESEP & GIZI ================= */}
        {recipeModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-bold text-2xl text-emerald-400">{recipeModal.nama}</h3>
                  <span className={`mt-2 inline-block text-xs uppercase px-3 py-1 rounded-full font-bold ${recipeModal.kategori === 'Minuman' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{recipeModal.kategori}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold">{recipeModal.kalori} <span className="text-sm text-gray-400 font-normal">kcal</span></p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                <div>
                   <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Kandungan Makro & Mikro</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div className="bg-white/5 p-3 rounded-lg"><p className="text-xs text-gray-500">Protein</p><p className="font-bold">{recipeModal.protein}g</p></div>
                     <div className="bg-white/5 p-3 rounded-lg"><p className="text-xs text-gray-500">Karbohidrat</p><p className="font-bold">{recipeModal.karbo}g</p></div>
                     <div className="bg-white/5 p-3 rounded-lg"><p className="text-xs text-gray-500">Lemak</p><p className="font-bold">{recipeModal.lemak}g</p></div>
                     <div className="bg-white/5 p-3 rounded-lg"><p className="text-xs text-gray-500">Zat Besi</p><p className="font-bold">{recipeModal.zatBesi}mg</p></div>
                   </div>
                   <p className="text-xs mt-3 text-gray-400"><strong>Vitamin Dominan:</strong> <span className="text-white">{recipeModal.vitamin}</span></p>
                </div>

                <div>
                   <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Instruksi Resep</h4>
                   <div className="bg-black/50 p-5 rounded-xl border border-white/5 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {recipeModal.resep}
                   </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 shrink-0">
                <button onClick={() => setRecipeModal(null)} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">Tutup Jendela</button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL TAMBAH KE JADWAL ================= */}
        {selectedMeal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-[#111] border border-emerald-500/30 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-xl mb-2">Pilih Hari</h3>
              <p className="text-emerald-400 text-sm mb-6 font-medium">{selectedMeal.nama}</p>
              
              <select value={selectedDayModal} onChange={(e) => setSelectedDayModal(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-lg mb-8 focus:border-emerald-500 outline-none">
                {Object.keys(weeklyPlan).map(d => <option key={d} value={d} className="bg-gray-900">{d} {lockedDays[d] ? '(Terkunci)' : ''}</option>)}
              </select>

              <div className="flex gap-3">
                <button onClick={() => setSelectedMeal(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold text-gray-300">Batal</button>
                <button onClick={() => {
                  if (lockedDays[selectedDayModal]) {
                    alert(`Hari ${selectedDayModal} sedang dikunci. Unsave dulu untuk menambah menu.`);
                  } else {
                    addMealToDay(selectedDayModal, selectedMeal);
                  }
                }} className="flex-1 py-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 text-sm font-extrabold">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* CSS Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        @media (min-width: 768px) { .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 12px; } }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 10px; margin: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16,185,129,0.8); }
      `}} />
    </main>
  );
}