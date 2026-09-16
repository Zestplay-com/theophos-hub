import Link from 'next/link'
import { Compass, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="systemPage">
      <section className="systemCard">
        <div className="systemIcon"><Compass size={24} /></div>
        <span className="eyebrow">404 · THEOPHOS HUB</span>
        <h1>We couldn't find that page.</h1>
        <p>The page may have moved, the link may be incomplete, or the creator content may no longer exist.</p>
        <div className="systemActions">
          <Link className="btn primary" href="/dashboard"><Home size={16} /> Dashboard</Link>
          <Link className="btn soft" href="/discover">Discover creators</Link>
        </div>
      </section>
    </main>
  )
}
