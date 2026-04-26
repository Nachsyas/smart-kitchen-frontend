'use client';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

// Data simulasi (Nanti ini akan diganti dengan data tarikan dari Supabase)
const weeklyData = [
  { name: 'Sen', kalori: 1800, gula: 30, targetKalori: 2000 },
  { name: 'Sel', kalori: 2100, gula: 45, targetKalori: 2000 },
  { name: 'Rab', kalori: 1950, gula: 25, targetKalori: 2000 },
  { name: 'Kam', kalori: 2200, gula: 55, targetKalori: 2000 },
  { name: 'Jum', kalori: 1700, gula: 20, targetKalori: 2000 },
  { name: 'Sab', kalori: 2400, gula: 65, targetKalori: 2000 },
  { name: 'Min', kalori: 1900, gula: 35, targetKalori: 2000 },
];

// Kustomisasi Tooltip (Kotak detail saat grafik di-hover)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl">
        <p className="text-white font-bold mb-2">{label}</p>
        <p className="text-emerald-400 text-sm">Kalori: {payload[0].value} kcal</p>
        <p className="text-red-400 text-sm">Gula: {payload[1].value} g</p>
      </div>
    );
  }
  return null;
};

export default function NutritionChart() {
  return (
    <div className="w-full h-[400px] p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide">Tren Gizi Mingguan</h2>
        <p className="text-sm text-gray-400">Pantauan Kalori dan Asupan Gula</p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {/* Gradasi Hijau untuk Kalori */}
            <linearGradient id="colorKalori" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
            {/* Gradasi Merah untuk Gula */}
            <linearGradient id="colorGula" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Garis Batas Target Kalori Harian */}
          <ReferenceLine y={2000} label={{ position: 'top', value: 'Target 2000 kcal', fill: '#888888', fontSize: 10 }} stroke="#888888" strokeDasharray="3 3" />
          
          <Area type="monotone" dataKey="kalori" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorKalori)" />
          <Area type="monotone" dataKey="gula" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorGula)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}