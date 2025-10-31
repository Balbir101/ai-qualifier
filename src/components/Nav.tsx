'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load current user
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user || null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  }

  return (
    <nav className="flex justify-between items-center p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="font-bold text-indigo-400 text-lg hover:text-indigo-300"
        >
          AI Qualifier
        </Link>

        {user && (
          <>
            <Link
              href="/icp"
              className={`hover:text-indigo-400 ${
                pathname === '/icp' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              ICP
            </Link>
            <Link
              href="/qualify"
              className={`hover:text-indigo-400 ${
                pathname === '/qualify' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Qualify
            </Link>
            <Link
              href="/results"
              className={`hover:text-indigo-400 ${
                pathname === '/results' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Results
            </Link>
          </>
        )}
      </div>

      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
