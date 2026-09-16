'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error])

  return (
    <main className="systemPage">
      <section className="systemCard">
        <div className="systemIcon"><AlertTriangle size={24} /></div>
        <span className="eyebrow">THEOPHOS HUB</span>
        <h1>Something interrupted this page.</h1>
        <p>The app hit an unexpected problem. Your account and creator data are not being intentionally changed by this screen.</p>
        <div className="systemActions">
          <button className="btn primary" onClick={reset}><RefreshCw size={16} /> Try again</button>
          <Link className="btn soft" href="/dashboard">Back to dashboard</Link>
        </div>
      </section>
    </main>
  )
}
