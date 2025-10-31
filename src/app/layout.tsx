import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'AI Qualifier – Supabase + Prisma',
  description: 'Production-ready prototype with Supabase Auth, Prisma, and OpenAI (optional).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen max-w-6xl mx-auto p-6">
          <Nav />
          {children}
        </main>
      </body>
    </html>
  );
}
