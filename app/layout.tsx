import type { Metadata, Viewport } from 'next'
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import SmoothScroll from '@/components/SmoothScroll'
import { PERSONAL_INFO } from '@/lib/content'

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF9F5' },
    { media: '(prefers-color-scheme: dark)', color: '#141413' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${PERSONAL_INFO.name} — Full Stack Developer & UI/UX Designer`,
  description:
    'Personal portfolio of Chandra Shekhar, a final-year engineering student building full-stack web applications with React, Node.js, WebRTC, and machine learning.',
  alternates: {
    canonical: siteUrl,
  },
  keywords: [
    'Chandra Shekhar',
    'Full Stack Developer',
    'React',
    'Node.js',
    'MERN',
    'WebRTC',
    'Learn Bridge',
    'FoundrAI',
  ],
  authors: [{ name: PERSONAL_INFO.name, url: siteUrl }],
  creator: PERSONAL_INFO.name,
  openGraph: {
    title: `${PERSONAL_INFO.name} — Full Stack Developer & UI/UX Designer`,
    description:
      'Personal portfolio and projects: Learn Bridge and FoundrAI.',
    type: 'website',
    url: siteUrl,
    siteName: PERSONAL_INFO.name,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: PERSONAL_INFO.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PERSONAL_INFO.name} — Full Stack Developer & UI/UX Designer`,
    description:
      'Personal portfolio and projects: Learn Bridge and FoundrAI.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.webmanifest',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PERSONAL_INFO.name,
  jobTitle: 'Full Stack Developer & UI/UX Designer',
  url: siteUrl,
  sameAs: [PERSONAL_INFO.github, PERSONAL_INFO.linkedin],
  knowsAbout: [
    'Full Stack Engineering',
    'React',
    'Node.js',
    'WebRTC',
    'Machine Learning',
    'UI/UX Design',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/profile.jpg"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',d);}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-paper text-ink selection:bg-accent selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  )
}
