'use client'

import Link from 'next/link'
import { ArrowLeft, Bell, CheckCircle2, MessageSquare, UserPlus, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { auth, db, onAuthStateChanged } from '../../lib/auth'

export default function Notifications(){
 const router=useRouter(); const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true)
 useEffect(()=>{const unsub=onAuthStateChanged(auth,async u=>{if(!u){router.replace('/login');return}try{const snap=await getDocs(query(collection(db,'notifications'),where('userId','==',u.uid),orderBy('createdAt','desc'),limit(30)));setItems(snap.docs.map(d=>({id:d.id,...d.data()})))}catch{setItems([])}finally{setLoading(false)}});return()=>unsub()},[router])
 const icon=(type:string)=>type==='follow'?<UserPlus size={18}/>:type==='feedback'?<MessageSquare size={18}/>:type==='video'?<Video size={18}/>:<CheckCircle2 size={18}/>
 return <main className="appShell"><aside><Link className="brand sideBrand" href="/">theophos<span>hub</span></Link><div className="sideNav"><Link className="sideLink" href="/dashboard">Dashboard</Link><Link className="sideLink" href="/discover">Discover</Link><Link className="sideLink active" href="/notifications"><Bell size={17}/> Notifications</Link></div><div className="sideBottom"><Link href="/dashboard">Back to dashboard</Link></div></aside><section className="dash"><header className="dashHead"><div><Link href="/dashboard" className="back"><ArrowLeft size={16}/> Dashboard</Link><span className="eyebrow">ACTIVITY</span><h1>Your notifications.</h1><p>Updates about your creator community activity.</p></div></header>{loading?<div className="panel"><p>Loading notifications...</p></div>:items.length===0?<div className="panel emptyState"><Bell size={30}/><b>You’re all caught up.</b><p>When creators follow you, give feedback, or interact with your content, updates will appear here.</p><Link href="/discover" className="btn primary">Discover creators</Link></div>:<div className="panel">{items.map(n=><div key={n.id} className="progressMeta" style={{padding:'18px 0',borderBottom:'1px solid var(--line)',alignItems:'flex-start'}}><span>{icon(n.type)}</span><div style={{flex:1}}><b>{n.title||'Creator activity'}</b><p style={{margin:'4px 0 0'}}>{n.message||'You have new creator activity.'}</p></div></div>)}</div>}</section></main>
}