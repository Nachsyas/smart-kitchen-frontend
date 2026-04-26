'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfileSetup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ usia: '', tinggi: '', berat: '' });
  const [penyakitList, setPenyakitList] = useState<string[]>([]);
  const [penyakitInput, setPenyakitInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Fitur menambah penyakit/alergi layaknya menambahkan tag
  const addPenyakit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && penyakitInput.trim() !== '') {
      e.preventDefault();
      if (!penyakitList.includes(penyakitInput.trim())) {
        setPenyakitList([...penyakitList, penyakitInput.trim()]);
      }
      setPenyakitInput('');
    }
  };

  const removePenyakit = (penyakit: string) => {
    setPenyakitList(penyakitList.filter(p => p !== penyakit));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Di sinilah nanti Anda memasukkan fungsi Supabase (Insert ke profil & user_health_conditions)
    console.log("Data Profil Tersimpan:", { ...formData, kondisi: penyakitList });
    
    // Simulasi loading 1 detik sebelum masuk ke Smart Food Prep
    setTimeout(() => {
      setLoading(false);
      router.push('/smart-food-prep');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#000000] selection:bg-emerald-500/30 selection:text-emerald-200 relative px-6 py-20 flex justify-center items-center">
      {/* Ambient Glow */}
      <div className="absolute top-[10%] left-[50%] translate-x-[-50%] w-[80%] md:w-[40%] h-[300px] bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none opacity-40"></div>

      <div className="max-w-xl w-full relative z-10 p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl animate-[fadeInUp_0.8s_ease-out_both]">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Kondisi Anda Saat Ini</h1>
          <p className="text-gray-400 text-sm md:text-base">Data ini akan membantu AI meracik gizi yang 100% aman dan relevan untuk tubuh Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Usia */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Usia</label>
              <input type="number" required placeholder="Tahun" 
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                value={formData.usia} onChange={(e) => setFormData({...formData, usia: e.target.value})} />
            </div>
            {/* Input Tinggi */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tinggi</label>
              <input type="number" required placeholder="cm" 
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                value={formData.tinggi} onChange={(e) => setFormData({...formData, tinggi: e.target.value})} />
            </div>
            {/* Input Berat */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Berat</label>
              <input type="number" required placeholder="kg" 
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                value={formData.berat} onChange={(e) => setFormData({...formData, berat: e.target.value})} />
            </div>
          </div>

          {/* Input Riwayat Penyakit / Alergi */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Riwayat Penyakit / Alergi</label>
            <div className="p-3 min-h-[60px] rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap gap-2 focus-within:border-emerald-500/50 transition-colors">
              {penyakitList.map((p, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                  {p}
                  <button type="button" onClick={() => removePenyakit(p)} className="ml-2 hover:text-white transition-colors">&times;</button>
                </span>
              ))}
              <input 
                type="text" 
                placeholder={penyakitList.length === 0 ? "Ketik & tekan Enter (Misal: Diabetes, Alergi Udang)" : "Tambah lagi..."}
                className="flex-1 min-w-[150px] bg-transparent text-white focus:outline-none text-sm px-2"
                value={penyakitInput}
                onChange={(e) => setPenyakitInput(e.target.value)}
                onKeyDown={addPenyakit}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 mt-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold tracking-wide hover:opacity-90 transition-opacity flex justify-center items-center">
            {loading ? 'Menyimpan & Menganalisis...' : 'Simpan Profil & Lanjut'}
          </button>
        </form>
      </div>
    </main>
  );
}