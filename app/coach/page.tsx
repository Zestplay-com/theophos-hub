'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Loader2, Sparkles, Lightbulb, Target, MessageSquare, CheckCircle2, History, WandSparkles, PlayCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { auth } from '../../lib/auth'

async function readJson(res: Response) {
  const text = await res.text()
  if (!text.trim()) throw new Error(`The Coach service returned no response (${res.status}). Please try again.`)
  try { return JSON.parse(text) } catch { throw new Error(`The Coach service returned an invalid response (${res.status}). Please try again.`) }
}

function CoachContent() {
  const params = useSearchParams()
  const [title,setTitle]=useState(''); const [description,setDescription]=useState(''); const [niche,setNiche]=useState(''); const [contentType,setContentType]=useState('Long-form'); const [goal,setGoal]=useState('')
  const [loading,setLoading]=useState(false); const [historyLoading,setHistoryLoading]=useState(false); const [error,setError]=useState(''); const [coach,setCoach]=useState<any>(null); const [history,setHistory]=useState<any[]>([])

  useEffect(()=>{setTitle(params.get('title')||'');setDescription(params.get('description')||'');setNiche(params.get('niche')||'');const type=params.get('contentType');setContentType(type==='short'?'Short':type==='live'?'Live':type==='other'?'Other':'Long-form')},[params])

  async function loadHistory(){
    const user=auth.currentUser; if(!user)return; setHistoryLoading(true)
    try{const token=await user.getIdToken();const res=await fetch('/api/coach/history',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const data=await readJson(res);if(!res.ok)throw new Error(data.error||'Could not load coach history.');setHistory(Array.isArray(data.analyses)?data.analyses:[])}catch(e:any){setError(e?.message||'Could not load coach history.')}finally{setHistoryLoading(false)}
  }
  useEffect(()=>{loadHistory()},[])

  async function analyze(){
    setError('');setCoach(null)
    if(!title.trim()){setError('Enter your video title first.');return}
    const user=auth.currentUser;if(!user){setError('Please sign in again.');return}
    setLoading(true)
    try{
      const token=await user.getIdToken();const res=await fetch('/api/coach',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({title,description,niche,contentType,goal})})
      const data=await readJson(res);if(!res.ok)throw new Error(data.error||`Coach request failed (${res.status}).`);if(!data.coach)throw new Error('The Coach returned no analysis. Please try again.')
      setCoach(data.coach);loadHistory()
    }catch(e:any){setError(e?.message||'The AI Coach could not complete the analysis.')}finally{setLoading(false)}
  }

  function showPrevious(item:any){setTitle(item.title||'');setNiche(item.niche||'');setContentType(item.contentType||'Long-form');setCoach(item.coach||null);window.scrollTo({top:0,behavior:'smooth'})}
  const list=(value:any)=>Array.isArray(value)?value:[]

  return <main className="appShell">
    <aside><Link className="brand sideBrand" href="/">theophos<span>hub</span></Link><div className="sideNav"><Link className="sideLink" href="/dashboard">Overview</Link><Link className="sideLink" href="/discover">Discover</Link><Link className="sideLink active" href="/coach"><Sparkles size={17}/> AI Coach</Link><Link className="sideLink" href="/content">My content</Link><Link className="sideLink" href="/submit">Submit video</Link></div><div className="sideBottom"><Link href="/dashboard">Back to dashboard</Link></div></aside>
    <section className="dash coachPage">
      <header className="coachHero"><div><Link href="/dashboard" className="back"><ArrowLeft size={16}/> Dashboard</Link><div className="coachEyebrow"><span><Sparkles size={14}/> AI CREATOR COACH</span><i>PRIVATE WORKSPACE</i></div><h1>Turn an idea into a <em>stronger video.</em></h1><p>Build better titles, hooks, structure and calls-to-action with practical feedback from your AI creative partner.</p></div><div className="coachHeroBadge"><WandSparkles size={21}/><b>Creator intelligence</b><small>Ideas • Hooks • Titles • CTAs</small></div></header>

      <div className="coachWorkspace">
        <section className="coachFormCard">
          <div className="sectionKicker"><span className="number">01</span><div><b>Tell the Coach about your video</b><small>Give enough context for useful advice.</small></div></div>
          <div className="coachFields">
            <label>VIDEO TITLE<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. 5 Money Habits Keeping You Poor" maxLength={180}/><small>{title.length}/180</small></label>
            <label>DESCRIPTION OR OUTLINE<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Paste your description, outline, script idea or explain what the viewer will learn..." maxLength={5000}/><small>{description.length}/5000</small></label>
            <div className="coachFieldGrid"><label>NICHE<input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="Finance" maxLength={100}/></label><label>CONTENT TYPE<select value={contentType} onChange={e=>setContentType(e.target.value)}><option>Short</option><option>Long-form</option><option>Live</option><option>Other</option></select></label></div>
            <label>WHAT SHOULD WE IMPROVE?<textarea value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Tell the Coach what you are struggling with — hook, title, retention, clarity, CTA, ideas..." maxLength={1000}/></label>
          </div>
          {error&&<div className="coachError"><strong>Coach needs attention</strong><span>{error}</span></div>}
          <button className="btn primary coachAnalyze" onClick={analyze} disabled={loading}>{loading?<><Loader2 size={18} className="spin"/> Building your coaching report...</>:<><Sparkles size={18}/> Analyze my video</>}</button>
          <div className="coachTrust"><CheckCircle2 size={15}/> No invented analytics. Advice is based on the information you provide.</div>
        </section>

        {!coach ? <section className="coachGuideCard"><div className="coachGuideIcon"><Sparkles size={22}/></div><span className="eyebrow">HOW YOUR COACH WORKS</span><h2>From rough idea to a clearer plan.</h2><div className="coachSteps"><div><b>01</b><span><strong>Position</strong> Clarify the promise and audience.</span></div><div><b>02</b><span><strong>Package</strong> Improve title and opening hook.</span></div><div><b>03</b><span><strong>Improve</strong> Find practical changes before publishing.</span></div></div><Link href="/submit" className="btn soft">Start from a submitted video <ArrowUpRight size={15}/></Link></section> : <section className="coachReportCard">
          <div className="reportTop"><div><span className="eyebrow"><Sparkles size={13}/> COACH REPORT</span><h2>{coach.summary}</h2></div><span className="reportReady"><CheckCircle2 size={14}/> Analysis ready</span></div>
          <div className="reportGrid">
            <article className="reportFeature"><div className="reportIcon"><Target size={18}/></div><div><span>PACKAGING</span><h3>Title ideas</h3>{list(coach.titleIdeas).map((x:string,i:number)=><p key={i}>{x}</p>)}</div></article>
            <article className="reportFeature"><div className="reportIcon"><MessageSquare size={18}/></div><div><span>OPENING</span><h3>Stronger hook</h3><p>{coach.hook||'No hook suggestion returned.'}</p></div></article>
            <article className="reportFeature"><div className="reportIcon"><CheckCircle2 size={18}/></div><div><span>KEEP</span><h3>Strengths</h3>{list(coach.strengths).map((x:string,i:number)=><p key={i}>{x}</p>)}</div></article>
            <article className="reportFeature"><div className="reportIcon"><Lightbulb size={18}/></div><div><span>IMPROVE</span><h3>Improve next</h3>{list(coach.improvements).map((x:string,i:number)=><p key={i}>{x}</p>)}</div></article>
            <article className="reportFeature wide"><div className="reportIcon"><PlayCircle size={18}/></div><div><span>CONTENT ENGINE</span><h3>Next content ideas</h3>{list(coach.contentIdeas).map((x:string,i:number)=><p key={i}>{x}</p>)}</div></article>
            <article className="reportFeature"><div className="reportIcon"><ArrowUpRight size={18}/></div><div><span>CONVERSION</span><h3>CTA</h3><p>{coach.cta||'No CTA suggestion returned.'}</p></div></article>
            <article className="reportFeature wide next"><div className="reportIcon"><Target size={18}/></div><div><span>NEXT MOVE</span><h3>Do this before you publish</h3><p>{coach.nextStep||'No next step returned.'}</p></div></article>
          </div>
        </section>}
      </div>

      <section className="coachHistory panel"><div className="panelHead"><div><div className="sectionKicker compact"><History size={17}/><div><h3>Previous coaching sessions</h3><p>Private history from your creator workspace.</p></div></div></div><button className="btn soft" onClick={loadHistory} disabled={historyLoading}>{historyLoading?<><Loader2 size={14} className="spin"/> Loading</>:'Refresh history'}</button></div>{history.length?<div className="historyList">{history.map(item=><button key={item.id} className="historyItem" onClick={()=>showPrevious(item)}><div><b>{item.title}</b><small>{item.niche||'Other'} · {item.contentType||'Video'}</small></div><ArrowUpRight size={15}/></button>)}</div>:<div className="emptyState"><History size={24}/><b>No coaching sessions yet.</b><p>Analyze your first video and it will appear here.</p></div>}</section>
    </section>
  </main>
}

function CoachFallback(){return <main className="appShell"><section className="dash"><div className="panel coachFallback"><Sparkles size={24}/><h2>Preparing your Creator Coach…</h2><p>Loading your private coaching workspace.</p></div></section></main>}
export default function CoachPage(){return <Suspense fallback={<CoachFallback/>}><CoachContent/></Suspense>}
