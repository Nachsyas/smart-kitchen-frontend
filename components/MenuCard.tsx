
export default function MenuCard({ menu, delay }: { menu: any; delay: number }) {
  // Animasi masuk (fade-in up) sederhana menggunakan style bawaan React
  const animationStyle = {
    animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
  };

  // Logika warna status
  const isComplete = menu.status_aset.toLowerCase().includes('lengkap');
  const statusColor = isComplete ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20';

  return (
    <div 
      style={animationStyle}
      className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
    >
      {/* Inner Card Background */}
      <div className="absolute inset-[1px] rounded-[23px] bg-[#0a0a0a] z-0"></div>
      
      {/* Konten Utama */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
        
        {/* Header: Waktu & Status */}
        <div className="flex justify-between items-start mb-6">
          <span className="px-3 py-1 text-xs font-bold tracking-widest text-gray-400 uppercase bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
            {menu.waktu_makan}
          </span>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${statusColor}`}>
            {menu.status_aset}
          </span>
        </div>

        {/* Judul Menu */}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-8">
          {menu.nama_menu}
        </h2>

        {/* Grid 3 Kriteria Pendukung */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bahan Dasar</span>
            <span className="text-sm text-gray-200 font-medium">{menu.bahan_dasar}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Metode</span>
            <span className="text-sm text-gray-200 font-medium">{menu.metode}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Porsi</span>
            <span className="text-sm text-gray-200 font-medium">{menu.porsi}</span>
          </div>
        </div>

        {/* Kotak Narasi AI (Kekurangan) */}
        <div className="mt-auto mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.05] transition-colors">
          <p className="text-sm text-gray-400 leading-relaxed">
            {menu.kekurangan}
          </p>
        </div>

        {/* Footer: Harga */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimasi Belanja</span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            Rp {menu.estimasi_harga.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
}