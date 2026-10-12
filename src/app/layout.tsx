import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { APP_META } from '@/constants/app';
import { THEME_COLOR } from '@/constants/theme';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: { default: APP_META.title, template: `%s · ${APP_META.name}` },
  description: APP_META.description,
  applicationName: APP_META.name,
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="font-sans text-fg">
        {children}
      </body>
    </html>
  );
}
