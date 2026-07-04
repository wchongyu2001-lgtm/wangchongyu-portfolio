import './globals.css';
import { Newsreader, Inter, IBM_Plex_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import site from '@/content/site.json';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--newsreader',
});

const inter = Inter({ subsets: ['latin'], variable: '--inter' });

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--plex-mono',
});

export const metadata = {
  metadataBase: new URL('https://wangchongyu.com'),
  title: site.seo.title,
  description: site.seo.description,
  keywords: site.seo.keywords,
  openGraph: {
    title: site.seo.title,
    description: site.seo.description,
    url: 'https://wangchongyu.com',
    siteName: 'Wang Chongyu',
    images: ['/og.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
