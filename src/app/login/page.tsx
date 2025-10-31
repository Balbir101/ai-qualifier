'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🧭 If already logged in, skip login
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/onboarding');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) router.replace('/onboarding');
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // 🧩 Send magic link login
  async function handleLogin() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="max-w-md w-full space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-white/10 shadow-xl">
        <h1 className="text-3xl font-bold text-center">Welcome to AI Qualifier</h1>
        <p className="text-sm text-slate-400 text-center">
          Sign in to save your progress or continue as a guest.
        </p>

        {!sent ? (
          <>
            {/* ✉️ Email Input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            />

            {/* 🔗 Send Magic Link Button */}
            <button
              onClick={handleLogin}
              disabled={!email || loading}
              className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-3 disabled:opacity-50"
            >
              {loading ? 'Sending magic link...' : 'Send Magic Link'}
            </button>

            {/* 👤 Continue as Guest Button */}
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full rounded-xl bg-white/10 hover:bg-white/20 px-4 py-3 mt-3"
            >
              Continue as Guest →
            </button>
          </>
        ) : (
          <p className="text-green-400 text-center">
            ✅ Magic link sent! Check your inbox and return here after logging in.
          </p>
        )}
      </div>
    </main>
  );
}
