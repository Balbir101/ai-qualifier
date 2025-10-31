'use client';
import { useState, useEffect } from 'react';
import Spinner from '@/components/Spinner';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [domain, setDomain] = useState('windmillgrowth.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('public-user');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setUserId(data.user.id);
    });
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate ICP');
      router.push('/icp');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Company Onboarding</h1>
      <p className="text-white/70">Enter your company domain. We'll scrape and generate a first-pass ICP, then save it.</p>
      <div className="flex gap-2">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="acme.com"
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !domain.trim()}
          className="rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-3 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Spinner /> : null}
          <span>Generate ICP</span>
        </button>
      </div>
      {error ? <p className="text-red-400">{error}</p> : null}
    </section>
  );
}
