'use client';
import { useState } from 'react';
import NutritionChart from '@/components/NutritionChart';

export default function SmartFoodPrep() {
  const [activeTab, setActiveTab] = useState('Siang'); // Pagi, Siang, Malam, Camilan
  const [mode, setMode] = useState('ingredients'); // 'keyword' atau 'ingredients'
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data untuk simulasi gizi harian (nanti ditarik dari Supabase)
  const dailyNutrition = { kalori: 1200, target: 2000, gula: 15, batas_gula: 50 };

  const handleAnalyze = async () => {
    setLoading(true);
    // Panggil endpoint backend /api/v2/food-prep
    // ... logic fetch ...
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      {/* Header & Nutrition Overview */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <h1 className="text-4xl font-bold mb-2">Smart Food Prep</h1>
          <p className="text-gray-400">Rencanakan nutrisi Anda berdasarkan kondisi biologis.</p>
          
          {/* Visualisasi Gizi Sederhana */}
          <div className="flex gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-mono text-emerald-400">{(dailyNutrition.kalori / dailyNutrition.target * 100).toFixed(0)}%</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">Energi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-red-400">{(dailyNutrition.gula / dailyNutrition.batas_gula * 100).toFixed(0)}%</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">Gula</div>
            </div>
          </div>
        </div>
        
        {/* Profile Summary Card */}
        <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
          <h3 className="font-bold text-emerald-400 mb-4">Profil Medis</h3>
          <ul className="text-sm space-y-2 text-gray-300">
            <li>Usia: 22 Tahun</li>
            <li>Riwayat: <span className="text-red-400 font-medium">Gastritis, Alergi Telur</span></li>
          </ul>
          <button className="mt-6 text-xs text-white/50 underline">Update Data Medis</button>
        </div>
      </section>

      {/* Control Center */}
      <section className="max-w-6xl mx-auto mt-12">
   <NutritionChart />
</section>
        
        {/* Meal Time Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {['Pagi', 'Siang', 'Malam', 'Camilan'].map((time) => (
            <button 
              key={time}
              onClick={() => setActiveTab(time)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === time ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-gray-400'}`}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white/[0.02] border border-white/10 p-4 rounded-2xl flex flex-col gap-4">
           <div className="flex border-b border-white/5 pb-2">
              <button onClick={() => setMode('ingredients')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest ${mode === 'ingredients' ? 'text-emerald-400' : 'text-gray-600'}`}>Bahan Baku</button>
              <button onClick={() => setMode('keyword')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest ${mode === 'keyword' ? 'text-emerald-400' : 'text-gray-600'}`}>Cari Nama Menu</button>
           </div>
           <textarea 
             className="bg-transparent w-full h-24 p-2 focus:outline-none text-lg placeholder:text-gray-700"
             placeholder={mode === 'ingredients' ? "Misal: Dada ayam, brokoli, bawang putih..." : "Misal: Soto Ayam tanpa jeroan..."}
             value={input}
             onChange={(e) => setInput(e.target.value)}
           />
           <button onClick={handleAnalyze} className="bg-emerald-500 py-4 rounded-xl text-black font-bold hover:bg-emerald-400 transition-colors">
              {loading ? 'Analisis Gizi Berjalan...' : 'Analisis ' + activeTab}
           </button>
        </div>
      </section>
    </main>
  );
}