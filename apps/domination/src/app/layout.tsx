import type { Metadata, Viewport } from 'next';
import { TRPCProvider } from '@/trpc/provider';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Domination - Mode de jeu',
  description: 'Mode Domination pour opérations Airsoft',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Domination',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#fafafa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="light">
      <body className="overscroll-none">
        <ThemeProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
