import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Nav';

export const metadata: Metadata = {
  title: 'AI Qualifier',
  description: 'AI-based ICP and prospect qualification system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen flex flex-col">
        {/* Global Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full p-6">{children}</main>

        {/* Footer */}
        <footer className="text-center text-sm text-white/60 py-4 border-t border-white/10">
          © 2025 AI Qualifier by Balbir Singh
        </footer>
      </body>
    </html>
  );
}
