'use client'

import Link from 'next/link'
import { ArrowRight, Check, ChevronLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'

const niches=['Finance','Gospel / Christian','Gaming','Technology','Education','Business','Motivation','Lifestyle','Fitness','Beauty','Comedy','African Creators','Other']
const goals=['Get discovered','Improve my content','Get meaningful feedback','Build creator relationships','Grow an audience','Find collaborators','Improve thumbnails','Improve titles & hooks']

export default function Join(){
  const router=useRouter(); const [step,setStep]=useState(1); const [niche,setNiche]=useState(''); const [goals,setGoals]=useState<string[]>([]); const [name,setName]=useState(''); const [channel,setChannel]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false); const [error,setError]=useState('')
  const toggle=(x:string)=>setGoals(g=>g.includes(x)?g.filter(i=>i!==x):[...g,x])
  function nextProfile(){ if(!name.trim()||!email.trim()||password.length<6){setError('Enter your name, a valid email and a password of at least 6 characters.');return} setError('');setStep(2) }
  async function createProfile(){
    setError(''); setLoading(true)
    try{
      const credential=await createUserWithEmailAndPassword(auth,email.trim(),password)
      await setDoc(doc(db,'users',credential.user.uid),{displayName:name.trim(),email:email.trim(),youtubeChannelUrl:channel.trim()||'',primaryNiche:niche,secondaryNiches:[],goals,contentFormat:'both',xp:0,reputation:0,credits:0,streak:0,level:'New Creator',createdAt:serverTimestamp(),updatedAt:serverTimestamp()})
      router.push('/dashboard')
    }catch(err:any){
      const code=err?.code||''
      setError(code==='auth/email-already-in-use'?'An account already exists with this email. Try signing in.':code==='auth/invalid-email'?'Please enter a valid email address.':code==='auth/weak-password'?'Use a stronger password.':'We could not create your profile. Check your Firebase setup and try again.')
    }finally{setLoading(false)}
  }
  return <main className="onboard"><header className="onboardNav container"><Link className="brand" href="/">theophos<span>hub</span></Link><span>Step {step} of 3</span></header><div className="onboardWrap"><div className="steps"><span className={step>=1?'active':''}>1</span><i/><span className={step>=2?'active':''}>2</span><i/><span className={step>=3?'active':''}>3</span></div>
  {step===1&&<section className="onboardCard"><div className="eyebrow">WELCOME, CREATOR</div><h1>Let's build your creator profile.</h1><p>Tell us a little about yourself so Theophos can connect you with relevant creators.</p><label>Display name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Elijah Creates"/></label><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email"/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="At least 6 characters" autoComplete="new-password"/></label><label>YouTube channel URL <small>optional for now</small><input value={channel} onChange={e=>setChannel(e.target.value)} placeholder="https://youtube.com/@yourchannel"/></label>{error&&<div className="formError">{error}</div>}<button className="btn primary large" onClick={nextProfile}>Continue <ArrowRight size={17}/></button><p className="switch">Already a creator? <Link href="/login">Sign in</Link></p></section>}
  {step===2&&<section className="onboardCard"><button className="back" onClick={()=>setStep(1)}><ChevronLeft size={16}/> Back</button><div className="eyebrow">YOUR NICHE</div><h1>What do you create?</h1><p>Choose the niche that best describes your main content.</p><div className="choiceGrid">{niches.map(x=><button type="button" className={niche===x?'choice selected':'choice'} onClick={()=>setNiche(x)} key={x}>{niche===x&&<Check size={14}/>} {x}</button>)}</div><button className="btn primary large" disabled={!niche} onClick={()=>setStep(3)}>Continue <ArrowRight size={17}/></button></section>}
  {step===3&&<section className="onboardCard"><button className="back" onClick={()=>setStep(2)}><ChevronLeft size={16}/> Back</button><div className="eyebrow">YOUR GOALS</div><h1>What do you want help with?</h1><p>Select everything that matters to you. You can change this later.</p><div className="choiceGrid">{goals.map(x=><button type="button" className={goals.includes(x)?'choice selected':'choice'} onClick={()=>toggle(x)} key={x}>{goals.includes(x)&&<Check size={14}/>} {x}</button>)}</div>{error&&<div className="formError">{error}</div>}<button className="btn primary large" disabled={loading} onClick={createProfile}>{loading?<><Loader2 size={17} className="spin"/> Creating profile...</>:<>Enter Theophos Hub <ArrowRight size={17}/></>}</button></section>}
  </div></main>
}