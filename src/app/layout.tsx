import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import AuthLayoutWrapper from '@/components/AuthLayoutWrapper';

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
        <AuthProvider>
          <AuthLayoutWrapper>
            {children}
          </AuthLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
