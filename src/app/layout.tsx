import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import AppThemeProvider from '@/lib/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meeya掲示板 -S17部活ver-',
  description: 'S17部活の匿名掲示板',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AppRouterCacheProvider>
          <AppThemeProvider>{children}</AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
