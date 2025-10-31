'use client';

import { useEffect, useState } from 'react';

type Result = {
  domain: string;
  rationale: string;
  score: number;
  signals: any;
};

export default function ResultsPage() {
  const [run, setRun] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/qualify/latest', { cache: 'no-store' });
      const data = await res.json();
      setRun(data.run || null);
    }
    load();
  }, []);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Qualification Results</h1>

      {!run ? (
        <p className="text-white/70">No results yet. Run a qualification first.</p>
      ) : (
        <>
          <div className="text-white/70 text-sm">
            Run: {new Date(run.createdAt).toLocaleString()} · Domains:{' '}
            {run.domains.join(', ')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {run.results.map((r: Result, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{r.domain}</h3>
                  <span
                    className={`px-2 py-1 rounded-lg text-sm ${
                      r.score >= 70
                        ? 'bg-green-500/20 text-green-300'
                        : r.score >= 50
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {r.score}
                  </span>
                </div>
                <p className="text-white/70 mt-2">{r.rationale}</p>
                <pre className="bg-black/30 rounded p-2 mt-2 text-xs overflow-auto">
                  {JSON.stringify(r.signals, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <a
              href="/qualify"
              className="px-4 py-3 bg-indigo-500 rounded-xl hover:bg-indigo-600"
            >
              Run Another Qualification
            </a>
            <a
              href="/icp"
              className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20"
            >
              ← View ICP
            </a>
          </div>
        </>
      )}
    </section>
  );
}
