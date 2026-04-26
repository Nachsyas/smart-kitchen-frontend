'use client';
import { useEffect, useState } from 'react';

export default function SmartFoodPrepDashboard() {
  const [activeTab, setActiveTab] = useState('Beli Makanan');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [lockedDays, setLockedDays] = useState<Record<string, boolean>>({});

  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, any[]>>({
    Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [], Sabtu: [], Minggu: []
  });

  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [recipeModal, setRecipeModal] = useState<any>(null);
  const [selectedDayModal, setSelectedDayModal] = useState('Senin');
  const [activeDay, setActiveDay] = useState('Senin');

  // ================= LOGIKA WAKTU REAL-TIME =================
  const dayIndices: Record<string, number> = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 0 };
  const [currentDayIndex, setCurrentDayIndex] = useState(1);

  useEffect(() => {
    setCurrentDayIndex(new Date().getDay());
  }, []);

  const isTimeLocked = (targetDay: string) => {
    if (currentDayIndex === 6 || currentDayIndex === 0) return false;
    const targetIdx = dayIndices[targetDay];
    if (targetIdx === 0) return false; 
    return targetIdx <= currentDayIndex;
  };

  const isDayLocked = (day: string) => lockedDays[day] || isTimeLocked(day);

  // ================= FUNGSI PENCARIAN AI =================
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
        const formattedData = dataList.map((item: any, index: number) => ({
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
        }));
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

  // ================= DRAG & DROP LOGIC =================
  const handleDrop = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    if (isDayLocked(day)) return alert(`Hari ${day} terkunci dan tidak bisa diubah!`);
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
    if (isTimeLocked(day)) return alert(`Hari ${day} sudah terkunci secara sistem karena waktu telah lewat.`);
    setLockedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  // ================= KALKULASI GIZI =================
  const currentMeals = weeklyPlan[activeDay];
  const totalKalori = currentMeals.reduce((s, m) => s + m.kalori, 0);
  const totalProtein = currentMeals.reduce((s, m) => s + m.protein, 0);
  const totalKarbo = currentMeals.reduce((s, m) => s + m.karbo, 0);
  const totalLemak = currentMeals.reduce((s, m) => s + m.lemak, 0);
  const totalZatBesi = currentMeals.reduce((s, m) => s + m.zatBesi, 0);
  
  const pPct = Math.min(100, Math.round((totalProtein / 50) * 100)); 
  const kPct = Math.min(100, Math.round((totalKarbo / 250) * 100)); 
  const lPct = Math.min(100, Math.round((totalLemak / 60) * 100)); 

  const totalVisual = pPct + kPct + lPct;
  const pVisual = totalVisual > 0 ? (pPct / totalVisual) * 100 : 0;
  const kVisual = totalVisual > 0 ? (kPct / totalVisual) * 100 : 0;
  const lVisual = totalVisual > 0 ? (lPct / totalVisual) * 100 : 0;

  return (
    // TEMA CERIA: Background krem lembut cerah dengan CSS Pattern Vektor Makanan/Dapur
    <main className="h-screen w-full bg-[#FDFBF7] text-slate-800 flex flex-col md:flex-row overflow-hidden font-sans relative">
      
      {/* VEKTOR BACKGROUND (Pattern SVG Transparan) */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      {/* ================= SIDEBAR KONTROL (TERANG & ELEGAN) ================= */}
      <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 h-[50vh] md:h-screen bg-white/90 backdrop-blur-xl border-r border-emerald-100 flex flex-col z-20 shadow-2xl">
        <div className="p-4 md:p-6 border-b border-emerald-50 shrink-0">
          
          {/* Header Brand */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-xl shadow-sm">🥑</div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">SmartFood Prep</h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">AI Nutrition Assistant</p>
            </div>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 mb-4 shadow-inner border border-slate-200/50">
            <button onClick={() => { setActiveTab('Beli Makanan'); setRecommendations([]); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'Beli Makanan' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Beli Makanan</button>
            <button onClick={() => { setActiveTab('Masak Sendiri'); setRecommendations([]); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'Masak Sendiri' ? 'bg-orange-400 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Masak Sendiri</button>
          </div>
          <textarea 
            placeholder={activeTab === 'Beli Makanan' ? "Cari lauk favoritmu (Misal: Ayam Bakar, Jus Alpukat)..." : "Ketik bahan yang kamu miliki (Misal: Telur, Bayam)..."}
            className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none mb-3 transition-all placeholder:text-slate-400"
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          />
          <button onClick={handleSearch} disabled={loading || !input.trim()} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 text-sm shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all">
            {loading ? 'AI Sedang Meracik...' : 'Cari Rekomendasi Menu'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col relative">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 shrink-0 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-[10px]">✨</span>
            Daftar Pilihan AI
          </h3>
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center pb-10">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 shadow-md"></div>
             </div>
          ) : recommendations.length === 0 ? (
             <div className="flex-1 flex items-center justify-center pb-10 text-center text-slate-400 text-sm font-medium">
               Ayo ketikkan makanan di atas!
             </div>
          ) : (
            <div className="space-y-3 pb-4">
              {recommendations.map((meal) => (
                <div key={meal.id} draggable onDragStart={(e) => e.dataTransfer.setData('meal', JSON.stringify(meal))} className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl relative group hover:border-emerald-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                  <div className="flex justify-between items-start pr-12">
                     <h4 className="font-bold text-sm leading-snug text-slate-800">{meal.nama}</h4>
                     <span className={`text-[9px] uppercase px-2 py-1 rounded-full font-extrabold tracking-wider ${meal.kategori === 'Minuman' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>{meal.kategori}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">
                    <span className="text-emerald-600 font-bold">{meal.kalori} kcal</span> • P: {meal.protein}g • K: {meal.karbo}g
                  </p>
                  <button onClick={() => setRecipeModal(meal)} className="mt-3 text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
                    📖 Lihat Resep & Nutrisi
                  </button>
                  <button onClick={() => setSelectedMeal(meal)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-white font-bold shadow-sm transition-all transform hover:scale-110">+</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ================= AREA UTAMA (KANAN) ================= */}
      <section className="flex-1 flex flex-col h-[50vh] md:h-screen relative min-w-0 z-10">
        
        {/* Weekly Planner Cards */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 pb-8 flex gap-6 custom-scrollbar">
          {Object.keys(weeklyPlan).map((day) => {
            const timeLocked = isTimeLocked(day);
            const manualLocked = lockedDays[day];
            const totallyLocked = timeLocked || manualLocked;

            return (
              <div key={day} onClick={() => setActiveDay(day)} onDrop={(e) => handleDrop(e, day)} onDragOver={(e) => e.preventDefault()} className={`min-w-[300px] shrink-0 flex flex-col bg-white/90 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl transition-all cursor-pointer ${activeDay === day ? 'ring-4 ring-emerald-400 ring-offset-2 transform -translate-y-2 bg-white' : 'border border-slate-200'} ${totallyLocked ? 'opacity-70 bg-slate-50' : ''}`}>
                <div className={`py-4 px-5 border-b flex justify-between items-center ${activeDay === day ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <h2 className={`font-extrabold text-lg tracking-wide ${activeDay === day ? 'text-emerald-600' : 'text-slate-700'}`}>{day}</h2>
                  
                  {timeLocked ? (
                    <span className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold bg-slate-200 text-slate-500 shadow-inner">⏱️ Terlewat</span>
                  ) : (
                    <button onClick={() => toggleSaveDay(day)} className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold transition-all shadow-sm ${manualLocked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                      {manualLocked ? '🔒 UNSAVE' : '💾 SAVE'}
                    </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {weeklyPlan[day].length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-medium">
                      <span className="text-3xl mb-2 opacity-50">{totallyLocked ? '🔒' : '🍽️'}</span>
                      {totallyLocked ? 'Jadwal Dikunci' : 'Tarik menu ke sini'}
                    </div>
                  ) : (
                    weeklyPlan[day].map((meal, index) => (
                      <div key={index} className={`border p-4 rounded-2xl relative group shadow-sm transition-all hover:shadow-md ${meal.kategori === 'Minuman' ? 'bg-blue-50/50 border-blue-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                        <h4 className={`font-bold text-sm pr-6 truncate ${meal.kategori === 'Minuman' ? 'text-blue-700' : 'text-emerald-700'}`}>{meal.nama}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-semibold">{meal.kalori} kcal</p>
                        {!totallyLocked && (
                           <button onClick={(e) => { e.stopPropagation(); const nw = [...weeklyPlan[day]]; nw.splice(index, 1); setWeeklyPlan({...weeklyPlan, [day]: nw}); }} className="absolute right-2 top-2 w-6 h-6 flex items-center justify-center bg-red-100 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white font-bold text-xs transition-all">✕</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Insight & Nutrition Panel (TERANG) */}
        <div className="h-[250px] shrink-0 bg-white/95 backdrop-blur-xl p-8 flex gap-8 items-center z-10 shadow-[0_-15px_40px_rgba(0,0,0,0.04)] border-t border-slate-100">
           <div className="flex-1">
              <h3 className="text-2xl font-extrabold mb-4 flex items-center gap-2 text-slate-800">
                Laporan Gizi Harian: <span className="text-emerald-500">{activeDay}</span> {isDayLocked(activeDay) && <span className="text-[10px] uppercase tracking-widest bg-slate-200 px-2 py-1 rounded-full text-slate-600">LOCKED</span>}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Total Kalori</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{totalKalori} <span className="text-xs font-medium">kcal</span></p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Protein (Otot)</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">{totalProtein} <span className="text-xs font-medium">g</span></p>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Karbo (Energi)</p>
                  <p className="text-2xl font-black text-orange-700 mt-1">{totalKarbo} <span className="text-xs font-medium">g</span></p>
                </div>
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-rose-600 font-bold">Lemak</p>
                  <p className="text-2xl font-black text-rose-700 mt-1">{totalLemak} <span className="text-xs font-medium">g</span></p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 font-medium flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Zat Besi Terkumpul: <strong className="text-slate-700">{totalZatBesi} mg</strong>
              </p>
           </div>
           
           {/* Multi-color Pie Chart (Light Theme Adjustments) */}
           <div className="flex flex-col items-center justify-center gap-3">
             <div className="w-[140px] h-[140px] shrink-0 rounded-full flex items-center justify-center relative shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white"
               style={{ 
                 background: `conic-gradient(#3b82f6 ${pVisual}%, #f97316 ${pVisual}% ${pVisual + kVisual}%, #e11d48 ${pVisual + kVisual}% 100%)`, 
                 padding: '10px' 
               }}>
                <div className="bg-white w-full h-full rounded-full flex flex-col items-center justify-center shadow-inner">
                   <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Rasio Makro</span>
                </div>
             </div>
             <div className="flex gap-3 text-[9px] uppercase tracking-widest font-extrabold">
                <span className="text-blue-500 flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Pro</span>
                <span className="text-orange-500 flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-full"></span> Karbo</span>
                <span className="text-rose-500 flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> Lemak</span>
             </div>
           </div>
        </div>

        {/* Modal Lihat Resep (TERANG) */}
        {recipeModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh]">
              
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="font-extrabold text-2xl text-slate-800">{recipeModal.nama}</h3>
                  <span className={`mt-2 inline-block text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-extrabold ${recipeModal.kategori === 'Minuman' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{recipeModal.kategori}</span>
                </div>
                <div className="text-right bg-emerald-50 px-4 py-2 rounded-2xl">
                  <p className="text-2xl font-black text-emerald-600">{recipeModal.kalori} <span className="text-sm font-semibold text-emerald-400">kcal</span></p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                <div>
                   <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Kandungan Makro & Mikro</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] uppercase font-bold text-slate-400">Protein</p><p className="font-black text-lg text-slate-700">{recipeModal.protein}g</p></div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] uppercase font-bold text-slate-400">Karbohidrat</p><p className="font-black text-lg text-slate-700">{recipeModal.karbo}g</p></div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] uppercase font-bold text-slate-400">Lemak</p><p className="font-black text-lg text-slate-700">{recipeModal.lemak}g</p></div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] uppercase font-bold text-slate-400">Zat Besi</p><p className="font-black text-lg text-slate-700">{recipeModal.zatBesi}mg</p></div>
                   </div>
                   <p className="text-xs mt-3 text-slate-500 font-medium bg-emerald-50 inline-block px-3 py-1 rounded-lg">Vitamin Dominan: <strong className="text-emerald-700">{recipeModal.vitamin}</strong></p>
                </div>

                <div>
                   <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Instruksi Resep Lengkap</h4>
                   <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {recipeModal.resep}
                   </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 shrink-0">
                <button onClick={() => setRecipeModal(null)} className="w-full py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all">Kembali ke Dashboard</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tambah Ke Jadwal (TERANG) */}
        {selectedMeal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl mb-4">📅</div>
              <h3 className="font-black text-xl mb-1 text-slate-800">Pilih Jadwal Hari</h3>
              <p className="text-emerald-600 text-sm mb-6 font-bold leading-snug">{selectedMeal.nama}</p>
              
              <select value={selectedDayModal} onChange={(e) => setSelectedDayModal(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 font-bold text-lg mb-8 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 cursor-pointer">
                {Object.keys(weeklyPlan).map(d => <option key={d} value={d} className="font-bold">{d} {isDayLocked(d) ? '(Terkunci)' : ''}</option>)}
              </select>

              <div className="flex gap-3">
                <button onClick={() => setSelectedMeal(null)} className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-600 transition-all">Batal</button>
                <button onClick={() => {
                  if (isDayLocked(selectedDayModal)) {
                    alert(`Hari ${selectedDayModal} sedang dikunci secara sistem atau manual.`);
                  } else {
                    addMealToDay(selectedDayModal, selectedMeal);
                  }
                }} className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200 text-sm font-extrabold transition-all">Simpan Menu</button>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* CSS Scrollbar (Light Theme Adjustments) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        @media (min-width: 768px) { .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 12px; } }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; margin: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16,185,129,0.5); }
      `}} />
    </main>
  );
}