import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getAppConfig } from '@/utils/admin';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: 'CETify - MHT CET Score Calculator',
  description:
    'Calculate your MHT CET score instantly. Upload your response sheet and get detailed subject-wise analysis, percentile prediction, and downloadable results.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getAppConfig();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f8fafc] text-[#0f172a] antialiased`}>
        <div className="flex flex-col min-h-screen">
          {!config.maintenance_mode && <Navbar />}
          <main className="flex-grow">{children}</main>
          {!config.maintenance_mode && <Footer />}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
