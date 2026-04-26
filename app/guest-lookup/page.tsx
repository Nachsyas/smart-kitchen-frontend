// frontend/app/guest-lookup/page.tsx
const handleSearchProfile = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, user_health_conditions(*)')
    .eq('username', username.toLowerCase())
    .single();

  if (data) {
    // Simpan ke LocalStorage agar saat refresh, data tetap muncul (Persistensi Lokal)
    localStorage.setItem('guest_session', JSON.stringify(data));
    router.push('/smart-food-prep');
  } else {
    alert("Profil tidak ditemukan. Silakan buat profil baru!");
  }
};