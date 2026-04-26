'use client';

// Interface sesuai dengan response dari Golang
interface AlertProps {
  status: 'Aman' | 'Waspada' | 'Bahaya';
  peringatan: string;
  edukasi: string;
  rekomendasi: string;
}

export default function NutritionAlert({ data }: { data: AlertProps | null }) {
  if (!data || data.status === 'Aman') return null;

  // Menentukan warna berdasarkan tingkat keparahan
  const isDanger = data.status === 'Bahaya';
  const colorClass = isDanger ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30';
  const textTitleClass = isDanger ? 'text-red-400' : 'text-yellow-400';
  const iconPulse = isDanger ? 'animate-pulse text-red-500' : 'text-yellow-500';

  return (
    <div className={`w-full p-6 rounded-2xl border backdrop-blur-md mb-8 flex gap-4 items-start animate-[fadeInUp_0.5s_ease-out] ${colorClass}`}>
      
      {/* Icon Warning */}
      <div className={`p-3 rounded-full bg-white/5 ${iconPulse}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      {/* Konten Peringatan */}
      <div className="flex-1">
        <h3 className={`font-bold text-lg mb-1 tracking-wide ${textTitleClass}`}>
          Peringatan AI: {data.status}
        </h3>
        <p className="text-white font-medium mb-2">{data.peringatan}</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{data.edukasi}</p>
        
        {/* Saran Tindakan */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
           <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Rekomendasi:</span>
           <span className="text-sm text-gray-200">{data.rekomendasi}</span>
        </div>
      </div>
    </div>
  );
}