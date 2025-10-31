'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function QualifyPage() {
  const [domains, setDomains] = useState('acme.com, example.io, windy.ai');
  const [error, setError] = useState('');
  const [icpOk, setIcpOk] = useState(false);
  const [userId, setUserId] = useState('public-user');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setUserId(data.user.id);
    });
    async function check() {
      try {
        const res = await fetch('/api/icp/latest', { cache: 'no-store' });
        const data = await res.json();
        setIcpOk(!!data.icp);
      } catch {}
    }
    check();
  }, []);

  async function runQualify() {
    setError('');
    try {
      const res = await fetch('/api/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to qualify');
      router.push('/results');
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Prospect Qualification</h1>
      {!icpOk ? (
        <p className="text-white/70">You need an ICP first. Go to Onboarding and generate one.</p>
      ) : (
        <>
          <p className="text-white/70">Enter domains (comma-separated). We'll score them against your ICP.</p>
          <textarea
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            rows={6}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
          />
          <button onClick={runQualify} className="rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-3">
            Qualify
          </button>
        </>
      )}
      {error ? <p className="text-red-400">{error}</p> : null}
    </section>
  );
}
