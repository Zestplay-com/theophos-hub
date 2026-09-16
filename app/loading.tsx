import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <main className="systemPage">
      <section className="systemCard systemLoading">
        <div className="systemIcon"><Loader2 className="spin" size={24} /></div>
        <span className="eyebrow">THEOPHOS HUB</span>
        <h1>Preparing your workspace…</h1>
        <p>Loading your creator experience securely.</p>
      </section>
    </main>
  )
}
