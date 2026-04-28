'use client';
import Link from 'next/link';
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
  
  // ================= STATE ENTERPRISE: PAGINASI & INFINITE SCROLL =================
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // State untuk Peringatan Waktu Makan
  const [mealReminder, setMealReminder] = useState<string | null>(null);

  const dayIndices: Record<string, number> = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 0 };
  const [currentDayIndex, setCurrentDayIndex] = useState(1);

  // ================= LOGIKA WAKTU & PERINGATAN MAKAN =================
  useEffect(() => {
    setCurrentDayIndex(new Date().getDay());

    // Cek Peringatan Makan setiap menit
    const checkMealTime = () => {
      const hour = new Date().getHours();
      if (hour === 7) setMealReminder("☕ Waktunya Sarapan! Jangan lewatkan asupan energi pertamamu.");
      else if (hour === 12) setMealReminder("🍱 Waktunya Makan Siang! Isi kembali energimu.");
      else if (hour === 19) setMealReminder("🌙 Waktunya Makan Malam! Pilih porsi yang ringan agar tidur nyenyak.");
      else setMealReminder(null);
    };
    
    checkMealTime();
    const interval = setInterval(checkMealTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const isTimeLocked = (targetDay: string) => {
    if (currentDayIndex === 6 || currentDayIndex === 0) return false;
    const targetIdx = dayIndices[targetDay];
    if (targetIdx === 0) return false; 
    return targetIdx <= currentDayIndex;
  };

  const isDayLocked = (day: string) => lockedDays[day] || isTimeLocked(day);

  // ================= FUNGSI PENCARIAN & PAGINASI =================
  const fetchRecipes = async (pageNum: number, isNewSearch: boolean = false) => {
    if (!input.trim()) return;

    if (isNewSearch) {
      setLoading(true);
      setHasMore(true);
    } else {
      setIsFetchingMore(true);
    }

    const mode = activeTab === 'Beli Makanan' ? 'beli' : 'masak';
    const cacheKey = `${mode}:${input.trim().toLowerCase()}`;

    try {
      let newData: any[] = [];
      let moreAvailable = false;

      // 1. Coba ambil dari Database (Paginasi per 10 resep)
      const res = await fetch(`https://nachsyas-smart-kitchen-assistant-api.hf.space/api/v1/recipes?keyword=${encodeURIComponent(cacheKey)}&page=${pageNum}&limit=10`);
      
      if (res.ok) {
        const responseData = await res.json();
        newData = responseData.data || [];
        moreAvailable = responseData.has_more || false;
      }

      // 2. SMART FALLBACK: Jika pencarian baru dan DB kosong, panggil AI
      if (isNewSearch && newData.length === 0) {
        const promptKeyword = activeTab === 'Beli Makanan' 
          ? `Rekomendasi MAKANAN JADI untuk: ${input}` 
          : `Rekomendasi MASAK SENDIRI dengan BAHAN MENTAH: ${input}`;
        
        const postRes = await fetch('[https://nachsyas-smart-kitchen-assistant-api.hf.space/api/v1/recommendations](https://nachsyas-smart-kitchen-assistant-api.hf.space/api/v1/recommendations)', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aset_inventaris: [promptKeyword] }) 
        });

        if (postRes.ok) {
          const rawData = await postRes.json();
          newData = Array.isArray(rawData) ? rawData : (rawData.data || []);
          moreAvailable = false; 
        }
      }

      // Standarisasi properti objek
      const formattedData = newData.map((item: any, index: number) => ({
          id: item.id || Date.now() + Math.random(),
          nama: item.nama || item.Nama || "Menu AI",
          kategori: item.kategori || item.Kategori || "Makanan",
          statusBahan: item.status_bahan || item.Status_bahan || item.statusBahan || "-",
          kalori: parseInt(item.kalori || item.Kalori) || 0,
          protein: parseInt(item.protein || item.Protein) || 0,
          karbo: parseInt(item.karbo || item.Karbo) || 0,
          lemak: parseInt(item.lemak || item.Lemak) || 0,
          zatBesi: parseInt(item.zat_besi || item.Zat_besi || item.zatBesi) || 0,
          vitamin: item.vitamin || item.Vitamin || "-",
          resep: item.resep || item.Resep || "Resep tidak disediakan AI.",
      }));

      if (isNewSearch) {
        setRecommendations(formattedData);
      } else {
        setRecommendations(prev => [...prev, ...formattedData]);
      }

      setHasMore(moreAvailable);

    } catch (error) {
      console.error("Gagal mengambil data dari server", error);
      if (isNewSearch) setRecommendations([]);
      alert("Gagal mengambil data dari server. Pastikan backend berjalan.");
    }
    
    setLoading(false);
    setIsFetchingMore(false);
  };

  const handleSearch = () => {
    setPage(1);
    fetchRecipes(1, true);
  };

  // ================= SENSOR INFINITE SCROLL =================
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (!isFetchingMore && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchRecipes(nextPage, false);
      }
    }
  };

  // ================= LOGIKA DRAG & DROP =================
  const handleDragStart = (e: React.DragEvent, meal: any) => {
    e.dataTransfer.setData('meal', JSON.stringify(meal));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    if (isDayLocked(day)) return alert(`Hari ${day} terkunci dan tidak bisa diubah!`);
    const mealData = e.dataTransfer.getData('meal');
    if (mealData) addMealToDay(day, JSON.parse(mealData));
  };

  const addMealToDay = (day: string, meal: any) => {
    setWeeklyPlan(prev => ({ ...prev, [day]: [...prev[day], meal] }));
    setSelectedMeal(null); 
    setActiveDay(day); 
  };

  const removeMeal = (day: string, index: number) => {
    setWeeklyPlan(prev => {
      const newDayPlan = [...prev[day]];
      newDayPlan.splice(index, 1);
      return { ...prev, [day]: newDayPlan };
    });
  };

  // ================= INTEGRASI API SAVE PLAN =================
  const toggleSaveDay = async (day: string) => {
    if (isTimeLocked(day)) return alert(`Hari ${day} sudah terkunci secara sistem.`);
    
    const isCurrentlyLocked = lockedDays[day];
    
    if (!isCurrentlyLocked) {
      try {
        const res = await fetch('[https://nachsyas-smart-kitchen-assistant-api.hf.space/api/v1/plan/save](https://nachsyas-smart-kitchen-assistant-api.hf.space/api/v1/plan/save)', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hari: day, menu_data: weeklyPlan[day] }) 
        });
        
        if (res.ok) {
          setLockedDays(prev => ({ ...prev, [day]: true }));
        } else {
          alert("Gagal menyimpan jadwal ke database.");
        }
      } catch (e) {
        console.error("Gagal koneksi ke DB:", e);
        setLockedDays(prev => ({ ...prev, [day]: true }));
      }
    } else {
       setLockedDays(prev => ({ ...prev, [day]: false }));
    }
  };

  const handlePrintReport = () => {
    alert("📄 Mempersiapkan Laporan Bulanan AI Anda... (Akan diunduh dalam bentuk PDF)");
  };

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
    <main className="h-screen w-full bg-[#FDFBF7] text-slate-800 flex flex-col md:flex-row overflow-hidden font-sans relative">
      
      {mealReminder && (
        <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white font-bold text-center py-2 z-50 shadow-md flex items-center justify-center gap-4">
          <span>{mealReminder}</span>
          <button onClick={() => setMealReminder(null)} className="text-white hover:text-emerald-200">✕</button>
        </div>
      )}

      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <aside className={`w-full md:w-[380px] lg:w-[420px] shrink-0 h-[50vh] md:h-screen bg-white/90 backdrop-blur-xl border-r border-emerald-100 flex flex-col z-20 shadow-2xl ${mealReminder ? 'pt-10' : ''}`}>
        <div className="p-4 md:p-6 border-b border-emerald-50 shrink-0">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors mb-4">
            <span className="text-sm">←</span> Kembali ke Beranda
          </Link>
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
            placeholder={activeTab === 'Beli Makanan' ? "Cari lauk favoritmu (Misal: Ayam Bakar)..." : "Ketik bahan yang kamu miliki (Misal: Tempe, Santan, Cabai)..."}
            className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none mb-3 transition-all placeholder:text-slate-400"
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          />
          <button onClick={handleSearch} disabled={loading || !input.trim()} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 text-sm shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all">
            {loading ? 'AI Sedang Meracik...' : 'Cari Rekomendasi Menu'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col relative" onScroll={handleScroll}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 shrink-0 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-[10px]">✨</span>
            Daftar Pilihan Menu
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
              {recommendations.map((meal, index) => (
                <div key={`${meal.id}-${index}`} draggable onDragStart={(e) => handleDragStart(e, meal)} className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl relative group hover:border-emerald-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                  
                  {meal.statusBahan !== "-" && (
                    <div className="mb-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${meal.statusBahan.includes('Lengkap') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {meal.statusBahan}
                      </span>
                    </div>
                  )}

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

          {/* LOADING INDIKATOR INFINITE SCROLL */}
          {isFetchingMore && (
            <div className="text-center py-4 text-emerald-500 font-bold text-xs animate-pulse">
              Memuat menu lainnya...
            </div>
          )}
          {!hasMore && recommendations.length > 0 && (
            <div className="text-center py-4 text-slate-400 text-xs font-medium">
              Semua rekomendasi telah ditampilkan 🍽️
            </div>
          )}
        </div>
      </aside>

      <section className={`flex-1 flex flex-col h-[50vh] md:h-screen relative min-w-0 z-10 bg-slate-50/50 p-4 md:p-8 overflow-y-auto custom-scrollbar ${mealReminder ? 'pt-10' : ''}`}>
        
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Meal Planner 📅</h2>
          <p className="text-slate-500 font-medium text-sm">Tarik (drag) kartu rekomendasi dari kiri dan lepaskan ke hari yang kamu inginkan.</p>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 pb-4 custom-scrollbar">
          {Object.keys(weeklyPlan).map((day) => {
            const timeLocked = isTimeLocked(day);
            const manualLocked = lockedDays[day];
            const totallyLocked = timeLocked || manualLocked;

            return (
              <div key={day} onClick={() => setActiveDay(day)} onDrop={(e) => handleDrop(e, day)} onDragOver={handleDragOver} className={`min-w-[300px] shrink-0 flex flex-col bg-white/90 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl transition-all cursor-pointer ${activeDay === day ? 'ring-4 ring-emerald-400 ring-offset-2 transform -translate-y-2 bg-white' : 'border border-slate-200'} ${totallyLocked ? 'opacity-70 bg-slate-50' : ''}`}>
                <div className={`py-4 px-5 border-b flex justify-between items-center ${activeDay === day ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <h2 className={`font-extrabold text-lg tracking-wide ${activeDay === day ? 'text-emerald-600' : 'text-slate-700'}`}>{day}</h2>
                  
                  {timeLocked ? (
                    <span className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold bg-slate-200 text-slate-500 shadow-inner">⏱️ Terlewat</span>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); toggleSaveDay(day); }} className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold transition-all shadow-sm ${manualLocked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
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
                           <button onClick={(e) => { e.stopPropagation(); removeMeal(day, index); }} className="absolute right-2 top-2 w-6 h-6 flex items-center justify-center bg-red-100 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white font-bold text-xs transition-all">✕</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-slate-100 mt-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 blur-3xl rounded-full"></div>
           <div className="flex-1 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-extrabold flex items-center gap-2 text-slate-800">
                    Laporan Gizi Harian <span className="text-emerald-500">: {activeDay}</span>
                  </h3>
                  {isDayLocked(activeDay) && <span className="text-[10px] mt-1 inline-block uppercase tracking-widest bg-slate-200 px-2 py-1 rounded-full text-slate-600 font-bold">🔒 JADWAL TERKUNCI</span>}
                </div>
                
                <button onClick={handlePrintReport} className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-colors shadow-sm">
                  📄 Cetak Laporan
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-1">Total Kalori</p>
                  <p className="text-2xl font-black text-slate-800">{totalKalori} <span className="text-xs font-medium">kcal</span></p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-1">Protein</p>
                  <p className="text-2xl font-black text-blue-700">{totalProtein} <span className="text-xs font-medium">g</span></p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-2xl border border-orange-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] uppercase tracking-widest text-orange-600 font-bold mb-1">Karbo</p>
                  <p className="text-2xl font-black text-orange-700">{totalKarbo} <span className="text-xs font-medium">g</span></p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] uppercase tracking-widest text-rose-600 font-bold mb-1">Lemak</p>
                  <p className="text-2xl font-black text-rose-700">{totalLemak} <span className="text-xs font-medium">g</span></p>
                </div>
              </div>
           </div>
        </div>

        {/* MODAL RESEP */}
        {recipeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRecipeModal(null)}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 block ${recipeModal.kategori === 'Minuman' ? 'text-blue-500' : 'text-emerald-500'}`}>Detail {recipeModal.kategori}</span>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{recipeModal.nama}</h2>
                </div>
                <button onClick={() => setRecipeModal(null)} className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors font-bold">✕</button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Zat Besi</p>
                    <p className="text-sm font-black text-slate-700">{recipeModal.zatBesi || 0} mg</p>
                  </div>
                  <div className="w-px bg-blue-200"></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Vitamin</p>
                    <p className="text-sm font-black text-slate-700">{recipeModal.vitamin || '-'}</p>
                  </div>
                </div>
                <h3 className="font-extrabold text-sm text-slate-800 mb-3 uppercase tracking-wider">Instruksi & Keterangan:</h3>
                <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap font-medium text-slate-600 leading-relaxed bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                  {recipeModal.resep}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                <button onClick={() => setRecipeModal(null)} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-md">Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PEMILIHAN HARI UNTUK TOMBOL PLUS (+) */}
        {selectedMeal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedMeal(null)}></div>
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl border border-emerald-100 relative z-10">
              <h3 className="font-black text-xl mb-1 text-slate-800">Pilih Jadwal Hari</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Tambahkan "{selectedMeal.nama}" ke kalender Anda.</p>
              
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
      
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; } @media (min-width: 768px) { .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 12px; } } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; margin: 5px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16,185,129,0.5); }`}} />
    </main>
  );
}