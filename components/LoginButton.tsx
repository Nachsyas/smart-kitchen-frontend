'use client';

// Kita jadikan komponen UI murni terlebih dahulu agar lolos dari blokade TypeScript Vercel
export default function LoginButton() {
  const handleGoogleLogin = () => {
    alert("Integrasi Google Auth sedang dalam tahap pengembangan!");
  };

  return (
    <button 
      onClick={handleGoogleLogin} 
      className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
    >
      Masuk dengan Google
    </button>
  );
}