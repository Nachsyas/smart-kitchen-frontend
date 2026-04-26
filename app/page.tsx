import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans relative overflow-x-hidden">
      
      {/* VEKTOR BACKGROUND (Pattern SVG Transparan) */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      {/* NAVBAR */}
      <nav className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-2xl shadow-sm border border-emerald-50">🥑</div>
          <div>
            <h1 className="font-extrabold text-2xl text-slate-800 tracking-tight">SmartFood Prep</h1>
            <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">AI Nutrition Assistant</p>
          </div>
        </div>
        <Link href="/smart-food-prep" className="hidden md:inline-flex px-6 py-3 bg-white text-slate-700 font-extrabold rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-200">
          Masuk ke Dashboard
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-32 flex flex-col items-center text-center">
        <span className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-extrabold uppercase tracking-widest mb-6 inline-block">
          💡 Kesadaran Nutrisi Dimulai Dari Sini
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-slate-800 leading-tight max-w-4xl mb-6">
          Makan Sehat Bukan Tentang Diet Ketat, Tapi <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">Nutrisi yang Tepat.</span>
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mb-10 font-medium leading-relaxed">
          Sering bingung hari ini mau makan apa yang bergizi tapi tetap enak? Kenali kebutuhan tubuhmu, pahami nutrisinya, dan biarkan AI kami meracik menu harianmu.
        </p>
        
        <Link href="/smart-food-prep" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-extrabold text-lg rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1">
          Mulai Racik Menu AI Sekarang 🚀
        </Link>
      </section>

      {/* KUTIPAN KESEHATAN (QUOTE) */}
      <section className="relative z-10 bg-white/60 backdrop-blur-md border-y border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl font-bold text-slate-700 italic leading-snug">
            "Satu-satunya cara untuk menjaga kesehatan adalah makan apa yang tidak Anda inginkan, minum apa yang tidak Anda sukai, dan lakukan apa yang lebih baik Anda hindari... 
            <span className="text-emerald-500 block mt-4 font-black not-italic text-4xl">Itu Dulu!</span>"
          </p>
          <p className="mt-6 text-slate-500 font-medium">
            Kini, dengan algoritma AI yang cerdas, Anda bisa makan hidangan yang lezat sekaligus memenuhi target nutrisi klinis. Tidak ada lagi makanan sehat yang membosankan.
          </p>
        </div>
      </section>

      {/* EDUKASI NUTRISI (ARTIKEL PENDEK) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-black text-slate-800 mb-4">Pahami Piring Anda 🍽️</h3>
          <p className="text-slate-500 font-medium">Kenali 3 makronutrien utama yang membangun tubuh dan energimu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card Protein */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:border-blue-200 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🥩</div>
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Protein (Pembangun)</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Protein bukan cuma buat atlet! Ini adalah batu bata pembangun sel, otot, dan imun tubuh. AI kami memastikan kamu mendapat asupan asam amino yang cukup dari ayam, ikan, tahu, maupun tempe.
            </p>
          </div>

          {/* Card Karbohidrat */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:border-orange-200 group">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🍚</div>
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Karbohidrat (Energi)</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Jangan musuhi karbohidrat. Otak dan tubuhmu butuh bensin untuk berpikir dan bergerak. Kuncinya ada pada porsi dan jenisnya. SmartFood Prep akan menghitung takaran energi yang pas untukmu.
            </p>
          </div>

          {/* Card Lemak */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:border-rose-200 group">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🥑</div>
            <h4 className="text-xl font-extrabold text-slate-800 mb-3">Lemak Baik (Pelindung)</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Tubuh butuh lemak baik untuk menyerap vitamin dan melindungi organ. Alpukat, kacang-kacangan, dan minyak zaitun adalah teman baikmu. Kami menakar lemak agar tetap aman dan sehat.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <footer className="relative z-10 bg-slate-900 text-white py-16 text-center rounded-t-[3rem] mt-10">
        <h3 className="text-3xl font-black mb-6">Sudah Siap Mengubah Pola Makanmu?</h3>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Tinggalkan cara lama menebak-nebak kalori. Biarkan Gemini AI mengurus perhitungannya untukmu secara gratis dan real-time.
        </p>
        <Link href="/smart-food-prep" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold rounded-xl transition-colors inline-block">
          Buka Dashboard Sekarang
        </Link>
      </footer>

    </main>
  );
}