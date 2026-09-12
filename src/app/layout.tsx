import type { Metadata } from 'next';
import './globals.css';
import DualSidebar from '@/components/DualSidebar';
import { LivePulseProvider } from '@/components/LivePulseProvider';

export const metadata: Metadata = {
  title: 'Niche Hunter | AI-Powered Micro-Niche SEO & Viability Analyzer',
  description: 'Discover, analyze, score, and validate profitable micro and nano niches with the SEBT-NEXT scoring engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#faf9f6] text-slate-800 antialiased flex min-h-screen selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
        <LivePulseProvider>
          {/* SEMrush-Style Enterprise Dual Sidebar (Primary Rail + Contextual Sub-Sidebar) */}
          <DualSidebar />

          {/* Main Content Viewport */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#faf9f6]">
            {children}
          </div>
        </LivePulseProvider>
      </body>
    </html>
  );
}
