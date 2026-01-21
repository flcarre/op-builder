import type { Metadata } from 'next';
import { TRPCProvider } from '@/trpc/provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crafted SaaS',
  description: 'Adaptive SaaS boilerplate',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
