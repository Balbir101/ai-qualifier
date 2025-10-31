'use client';

import { useEffect, useState } from 'react';

export default function ICPPage() {
  const [icp, setIcp] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/icp/latest', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load ICP');
        setIcp(data.icp);
      } catch (e: any) {
        setError(e.message);
      }
    }
    load();
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Your Ideal Customer Profile</h1>
      {!icp ? (
        <p className="text-white/60">
          No ICP found. Generate one from the Onboarding page.
        </p>
      ) : (
        <>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold">{icp.title}</h2>
            <p className="text-white/70 mt-2">{icp.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-semibold">Company size</h3>
                <p className="text-white/70">{icp.company_size || '—'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Revenue range</h3>
                <p className="text-white/70">{icp.revenue_range || '—'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Industries</h3>
                <p className="text-white/70">
                  {(icp.industries || []).join(', ') || '—'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Regions</h3>
                <p className="text-white/70">
                  {(icp.regions || []).join(', ') || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Buyer Personas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(icp.personas || []).map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-white/70 text-sm">
                    {p.role} · {p.department}
                  </div>
                  <ul className="list-disc list-inside mt-2 text-white/80 text-sm">
                    {p.pain_points?.map((pp: string, i: number) => (
                      <li key={i}>{pp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <a
              href="/qualify"
              className="px-4 py-3 bg-indigo-500 rounded-xl hover:bg-indigo-600"
            >
              Qualify Prospects →
            </a>
            <a
              href="/onboarding"
              className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20"
            >
              ← Back to Onboarding
            </a>
          </div>
        </>
      )}
    </section>
  );
}
