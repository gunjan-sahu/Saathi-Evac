import { Analytics } from '@vercel/analytics/next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import './animations.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const devanagari = Noto_Sans_Devanagari({ subsets: ['devanagari'], variable: '--font-devanagari', display: 'swap' })

export const metadata: Metadata = {
  title: 'Sahaara - Disaster Response Coordination',
  description: 'A calm, role-aware workspace for disaster response and relief coordination.',
  applicationName: 'Sahaara',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  userScalable: true,
  maximumScale: 5,
  themeColor: '#183D35',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${devanagari.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}