// frontend/components/LoginButton.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginButton() {
  const supabase = createClientComponentClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button onClick={handleGoogleLogin} className="bg-white text-black px-6 py-3 rounded-xl font-bold">
      Masuk dengan Google
    </button>
  );
}