'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Nav() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl transition ${pathname === href ? 'bg-white/10' : 'hover:bg-white/5'}`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="w-full flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-bold text-lg">AI Qualifier</Link>
        <div className="hidden md:flex gap-2">
          {link('/', 'Onboarding')}
          {link('/icp', 'ICP')}
          {link('/qualify', 'Qualify')}
          {link('/results', 'Results')}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {email ? (
          <>
            <span className="text-sm text-white/70">{email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login" className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
