'use client'

import Link from 'next/link'
import { Search, Video, Sparkles, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { auth, db, onAuthStateChanged, getCurrentCreator } from '../../lib/auth'

type DiscoverVideo = {
 id: string
 creatorId?: string
 creatorName?: string
 title?: string
 description?: string
 niche?: string
 contentType?: string
 youtubeUrl?: string
}

const niches=['All','Finance','Gospel / Christian','Gaming','Technology','Education','Business','Motivation','Lifestyle','Fitness','Beauty','Comedy','African Creators','Other']
export default function Discover(){
 const router=useRouter();const [videos,setVideos]=useState<DiscoverVideo[]>([]);const [profile,setProfile]=useState<any>(null);const [search,setSearch]=useState('');const [niche,setNiche]=useState('All');const [loading,setLoading]=useState(true);const [error,setError]=useState('')
 useEffect(()=>{const unsub=onAuthStateChanged(auth,async u=>{if(!u){router.replace('/login');return}try{const p=await getCurrentCreator(u.uid);setProfile(p);const snap=await getDocs(query(collection(db,'videos'),orderBy('createdAt','desc'),limit(50)));const loaded=snap.docs.map(d=>({id:d.id,...d.data()} as DiscoverVideo));setVideos(loaded.filter(v=>v.creatorId!==u.uid))}catch{setError('Could not load creator discovery. If this is the first run, your Firestore index may still be initializing.')}finally{setLoading(false)}});return()=>unsub()},[router])
 const filtered=useMemo(()=>videos.filter(v=>(niche==='All'||v.niche===niche)&&(!search||`${v.title||''} ${v.creatorName||''} ${v.niche||''}`.toLowerCase().includes(search.toLowerCase()))),[videos,niche,search])
 return <main className="appShell"><aside><Link className="brand sideBrand" href="/">theophos<span>hub</span></Link><div className="sideNav"><Link className="sideLink" href="/dashboard">Overview</Link><Link className="sideLink active" href="/discover"><Search size={17}/> Discover</Link><Link className="sideLink" href="/submit"><Video size={17}/> Submit video</Link></div><div className="sideBottom"><Link href="/dashboard">Back to dashboard</Link></div></aside><section className="dash"><header className="dashHead"><div><span className="eyebrow">CREATOR DISCOVERY</span><h1>Find creators worth discovering.</h1><p>Relevant content from the Theophos creator community. Choose how you want to engage.</p></div></header><div className="panel" style={{marginBottom:20}}><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><input aria-label="Search creators" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search videos, creators or niches..." style={{flex:1,minWidth:220}}/>{niches.map(n=><button key={n} className={niche===n?'choice selected':'choice'} onClick={()=>setNiche(n)}>{n}</button>)}</div></div>{loading?<div className="panel"><p>Loading creators...</p></div>:error?<div className="panel"><p>{error}</p></div>:filtered.length===0?<div className="panel emptyState"><Sparkles size={26}/><b>No matching videos yet.</b><p>{profile?.primaryNiche?`You are set up for ${profile.primaryNiche}. As creators submit content, relevant videos will appear here.`:'Be one of the first creators to submit a video.'}</p><Link href="/submit" className="btn primary">Submit your video</Link></div>:<div className="dashGrid">{filtered.map(v=><article className="panel" key={v.id}><div className="eyebrow">{v.niche} · {v.contentType}</div><h3>{v.title}</h3><p>{v.description||'Creator video submitted to Theophos Hub.'}</p><div className="progressMeta"><Link href={`/creators/${v.creatorId||''}`}><Users size={14}/> {v.creatorName||'Creator'}</Link><Link className="btn soft" href={`/support/${v.id}`}>Discover & support</Link></div></article>)}</div>}</section></main>
}
