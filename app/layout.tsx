import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Memories Bed - Preserve and Share Your Precious Moments',
    template: '%s | Memories Bed'
  },
  description: 'Secure digital memorial service preserving your most precious memories. Access your personal memory collection remotely through QR codes and dedicated digital frames.',
  keywords: [
    'digital memories',
    'memorial service',
    'memory preservation',
    'digital photo storage',
    'QR memory access',
    'digital memorial',
    'memory sharing',
    'secure photo storage',
    'remembrance service',
    'digital legacy'
  ],
  authors: [{ name: 'Memories Bed' }],
  creator: 'Memories Bed',
  publisher: 'Memories Bed',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://memoriesbed.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://memoriesbed.com', // Replace with your actual domain
    siteName: 'Memories Bed',
    title: 'Memories Bed - Preserve and Share Your Precious Moments',
    description: 'Secure digital memorial service where your precious memories are safely stored and accessible remotely through QR codes and digital frames.',
    images: [
      {
        url: '/og-image.jpg', // Create this image (1200x630px recommended)
        width: 1200,
        height: 630,
        alt: 'Memories Bed - Digital Memorial Service',
      },
      {
        url: '/og-image-square.jpg', // Create this image (1200x1200px)
        width: 1200,
        height: 1200,
        alt: 'Memories Bed - Preserve Your Memories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@livingmemories', // Replace with your Twitter handle
    creator: '@livingmemories', // Replace with your Twitter handle
    title: 'Memories Bed - Preserve and Share Your Precious Moments',
    description: 'Secure digital memorial service where your precious memories are safely stored and accessible remotely through QR codes and digital frames.',
    images: ['/twitter-image.jpg'], // Create this image (1200x600px recommended)
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  category: 'technology',
  classification: 'Digital Memorial Service',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Memories Bed',
    'application-name': 'Memories Bed',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/playfair-display-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Additional SEO tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Memories Bed" />
        <meta name="application-name" content="Memories Bed" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Memories Bed",
              "url": "https://memoriesbed.com",
              "logo": "https://memoriesbed.com/logo.png",
              "description": "Secure digital memorial service preserving your most precious memories",
              "serviceType": "Digital Memorial Service",
              "areaServed": "Worldwide",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": "English"
              }
            })
          }}
        />
        
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Memories Bed",
              "url": "https://memoriesbed.com",
              "description": "Secure digital memorial service where your precious memories are safely stored and accessible remotely",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://memoriesbed.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body 
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}