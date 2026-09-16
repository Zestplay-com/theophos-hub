'use client'

import Link from 'next/link'
import { ArrowRight, Check, ChevronLeft, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'

const niches=['Finance','Gospel / Christian','Gaming','Technology','Education','Business','Motivation','Lifestyle','Fitness','Beauty','Comedy','African Creators','Other']
const goals=['Get discovered','Improve my content','Get meaningful feedback','Build creator relationships','Grow an audience','Find collaborators','Improve thumbnails','Improve titles & hooks']

function firebaseMessage(code:string, action:'auth'|'profile'='auth'){
  if(action==='profile'){
    if(code==='permission-denied') return 'Your account was created, but your creator profile could not be saved. Check the Firestore rules in Firebase.'
    if(code==='unavailable') return 'Firebase is temporarily unavailable. Check your connection and try again.'
    return `Your account was created, but the profile could not be saved (${code || 'unknown-error'}).`
  }
  const messages:Record<string,string>={
    'auth/email-already-in-use':'An account already exists with this email. Try signing in instead.',
    'auth/invalid-email':'Please enter a valid email address.',
    'auth/weak-password':'Use a stronger password. Firebase requires at least 6 characters.',
    'auth/operation-not-allowed':'Email/password sign-up is not enabled in this Firebase project.',
    'auth/admin-restricted-operation':'Firebase is currently restricting new account creation.',
    'auth/unauthorized-domain':'This website domain is not authorized in Firebase Authentication.',
    'auth/invalid-api-key':'The Firebase API key used by the deployed website is invalid.',
    'auth/network-request-failed':'Firebase could not be reached. Check your internet connection and try again.',
  }
  return messages[code] || `Firebase sign-up failed (${code || 'unknown-error'}).`
}

export default function Join(){
  const router=useRouter(); const [step,setStep]=useState(1); const [niche,setNiche]=useState(''); const [goals,setGoals]=useState<string[]>([]); const [name,setName]=useState(''); const [channel,setChannel]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [showPassword,setShowPassword]=useState(false); const [loading,setLoading]=useState(false); const [googleLoading,setGoogleLoading]=useState(false); const [error,setError]=useState('')
  const toggle=(x:string)=>setGoals(g=>g.includes(x)?g.filter(i=>i!==x):[...g,x])

  useEffect(()=>{
    const finishGoogleSignIn=async()=>{
      try{
        const user=auth.currentUser
        if(user){
          setName(prev=>prev||user.displayName||'')
          setEmail(prev=>prev||user.email||'')
        }
      }catch{}
    }
    finishGoogleSignIn()
  },[])

  function nextProfile(){
    if(!name.trim()||!email.trim()||password.length<6){setError('Enter your name, email and a password of at least 6 characters.');return}
    setError('');setStep(2)
  }

  async function continueWithGoogle(){
    setError('');setGoogleLoading(true)
    try{
      const provider=new GoogleAuthProvider()
      provider.setCustomParameters({prompt:'select_account'})
      const result=await signInWithPopup(auth,provider)
      const user=result.user
      setName(user.displayName||'')
      setEmail(user.email||'')
      const existing=await getDoc(doc(db,'users',user.uid))
      if(existing.exists()) router.push('/dashboard')
      else setStep(2)
    }catch(err:any){
      setError(firebaseMessage(err?.code||''))
    }finally{setGoogleLoading(false)}
  }

  async function createProfile(){
    setError(''); setLoading(true)
    let uid=auth.currentUser?.uid
    try{
      if(!uid){
        const credential=await createUserWithEmailAndPassword(auth,email.trim(),password)
        uid=credential.user.uid
      }
      if(!uid) throw new Error('auth/no-current-user')
      try{
        await setDoc(doc(db,'users',uid),{displayName:name.trim(),email:email.trim()||auth.currentUser?.email||'',youtubeChannelUrl:channel.trim()||'',primaryNiche:niche,secondaryNiches:[],goals,contentFormat:'both',xp:0,reputation:0,credits:0,streak:0,level:'New Creator',createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true})
      }catch(err:any){
        setError(firebaseMessage(err?.code||'', 'profile')); return
      }
      router.push('/dashboard')
    }catch(err:any){
      setError(firebaseMessage(err?.code||''))
    }finally{setLoading(false)}
  }

  return <main className="onboard"><header className="onboardNav container"><Link className="brand" href="/">theophos<span>hub</span></Link><div className="onboardProgress"><span>Step {step} of 3</span><div className="progressTrack"><i style={{width:`${step*33.33}%`}}/></div></div></header><div className="onboardWrap">
    <div className="steps"><span className={step>=1?'active':''}>1</span><i/><span className={step>=2?'active':''}>2</span><i/><span className={step>=3?'active':''}>3</span></div>
    {step===1&&<section className="onboardCard"><div className="eyebrow">WELCOME, CREATOR</div><h1>Create your <em>Theophos</em> account.</h1><p className="onboardLead">Join a community built to help creators discover, improve and grow together.</p>
      <button className="googleBtn" onClick={continueWithGoogle} disabled={googleLoading||loading}><span className="googleMark">G</span>{googleLoading?<><Loader2 size={17} className="spin"/> Connecting...</>:<>Continue with Google <ArrowRight size={17}/></>}</button>
      <div className="orDivider"><span>or continue with email</span></div>
      <div className="field"><label>Full name</label><div className="inputShell"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name or creator name" autoComplete="name"/></div></div>
      <div className="field"><label>Email address</label><div className="inputShell"><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email"/></div></div>
      <div className="field"><label>Password</label><div className="inputShell"><input value={password} onChange={e=>setPassword(e.target.value)} type={showPassword?'text':'password'} placeholder="At least 6 characters" autoComplete="new-password"/><button type="button" className="passwordToggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
      <div className="securityNote"><ShieldCheck size={17}/> Your account is protected by Firebase Authentication.</div>
      {error&&<div className="formError">{error}</div>}
      <button className="btn primary large fullBtn" onClick={nextProfile}>Continue with email <ArrowRight size={17}/></button>
      <p className="switch">Already a creator? <Link href="/login">Sign in</Link></p>
    </section>}
    {step===2&&<section className="onboardCard"><button className="back" onClick={()=>setStep(1)}><ChevronLeft size={16}/> Back</button><div className="eyebrow">YOUR NICHE</div><h1>What do you create?</h1><p className="onboardLead">Choose the niche that best describes your main content.</p><div className="choiceGrid">{niches.map(x=><button type="button" className={niche===x?'choice selected':'choice'} onClick={()=>setNiche(x)} key={x}>{niche===x&&<Check size={14}/>} {x}</button>)}</div><button className="btn primary large fullBtn" disabled={!niche} onClick={()=>setStep(3)}>Continue <ArrowRight size={17}/></button></section>}
    {step===3&&<section className="onboardCard"><button className="back" onClick={()=>setStep(2)}><ChevronLeft size={16}/> Back</button><div className="eyebrow">YOUR GOALS</div><h1>What do you want help with?</h1><p className="onboardLead">Select everything that matters to you. You can change this later.</p><div className="choiceGrid">{goals.map(x=><button type="button" className={goals.includes(x)?'choice selected':'choice'} onClick={()=>toggle(x)} key={x}>{goals.includes(x)&&<Check size={14}/>} {x}</button>)}</div>{error&&<div className="formError">{error}</div>}<button className="btn primary large fullBtn" disabled={loading} onClick={createProfile}>{loading?<><Loader2 size={17} className="spin"/> Creating your account...</>:<>Enter Theophos Hub <ArrowRight size={17}/></>}</button></section>}
  </div></main>
}
