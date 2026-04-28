import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import KonamiCode from '@/components/KonamiCode';
import CommandPalette from '@/components/CommandPalette';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_DESCRIPTION =
  'Marcus Forsberg is a fullstack developer based in Copenhagen, building web apps with Next.js, Java, and Python. Selected projects, motorcycle trips across Europe, and an LLM-powered course showcase.';

export const metadata: Metadata = {
  metadataBase: new URL('https://marcuspff.com'),
  title: {
    default: 'Marcus Forsberg — Fullstack Developer & Adventurer',
    template: '%s | Marcus Forsberg',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Marcus Forsberg',
  authors: [{ name: 'Marcus Forsberg', url: 'https://marcuspff.com' }],
  creator: 'Marcus Forsberg',
  openGraph: {
    title: 'Marcus Forsberg — Fullstack Developer & Adventurer',
    description: SITE_DESCRIPTION,
    url: 'https://marcuspff.com',
    siteName: 'Marcus Forsberg',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcus Forsberg — Fullstack Developer & Adventurer',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Marcus Forsberg',
  url: 'https://marcuspff.com',
  jobTitle: 'Fullstack Developer',
  description: SITE_DESCRIPTION,
  sameAs: [
    'https://github.com/MarcusPFF',
    'https://www.linkedin.com/in/marcus-forsberg-a09a68334/',
    'https://www.instagram.com/marcus.pff/',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen font-sans selection:bg-slate-300/50 selection:text-slate-900 overflow-x-hidden"
      >
        <a
          href="#projects"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-slate-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to content
        </a>
        {children}
        <CommandPalette />
        <KonamiCode />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
