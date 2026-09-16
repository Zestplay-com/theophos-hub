import type { Metadata } from 'next'
import './globals.css'
import './professional.css'

export const metadata: Metadata = { title: 'Theophos Hub — Create. Discover. Support. Grow.', description: 'A creator-first growth community for small and emerging content creators.' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
