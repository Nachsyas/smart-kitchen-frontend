'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GuestLookup() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  const handleSearchProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nanti logika Supabase akan kita masukkan di sini.
    // Sementara ini, kita simulasikan pencarian berhasil dan simpan ke memori lokal.
    if (username.trim()) {
       localStorage.setItem('guest_session', JSON.stringify({ username }));
       router.push('/smart-food-prep');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      
      {/* Glow Effect */}
      <div className="absolute top-[20%] w-[50%] h-[300px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full relative z-10 p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-center shadow-2xl animate-[fadeInUp_0.5s_ease-out]">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Cari Profil Tamu</h1>
        <p className="text-gray-400 mb-8 text-sm">Lanjutkan tanpa mendaftar. Data pencarian Anda akan langsung muncul.</p>

        <form onSubmit={handleSearchProfile} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Masukkan username Anda..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            required
          />
          <button type="submit" className="w-full py-4 rounded-xl bg-emerald-500 text-black font-extrabold tracking-wide hover:bg-emerald-400 transition-colors">
            Cari & Lanjutkan
          </button>
        </form>

        <div className="mt-8">
           <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
             ← Kembali ke Beranda
           </Link>
        </div>
      </div>
    </main>
  );
}