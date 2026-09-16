'use client'

import Link from 'next/link'
import { ArrowRight, LockKeyhole, Mail, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '../../lib/auth'

export default function Login(){
  const router=useRouter()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault(); setError(''); setLoading(true)
    try { await signIn(email,password); router.push('/dashboard') }
    catch(err:any){
      const code=err?.code||''
      setError(code==='auth/invalid-credential'?'Email or password is incorrect.':code==='auth/too-many-requests'?'Too many attempts. Please try again later.':code==='auth/invalid-email'?'Please enter a valid email address.':'Sign in failed. Please check your details and try again.')
    } finally { setLoading(false) }
  }

  return <main className="authPage"><Link className="brand" href="/">theophos<span>hub</span></Link><div className="authCard"><div className="eyebrow">WELCOME BACK</div><h1>Back to your creator journey.</h1><p>Sign in to continue your missions, feedback and creator growth.</p><form onSubmit={submit}><label>Email<input required value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email"/></label><label>Password<input required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" autoComplete="current-password"/></label>{error&&<div className="formError">{error}</div>}<button className="btn primary large" disabled={loading}>{loading?<><Loader2 size={17} className="spin"/> Signing in...</>:<>Sign in <ArrowRight size={17}/></>}</button></form><div className="divider"><span>secure creator account</span></div><small className="secure"><LockKeyhole size={13}/> Your account data is protected.</small><p className="switch">New to Theophos? <Link href="/join">Create your creator profile</Link></p><p className="switch"><Mail size={14}/> Email/password accounts are ready first; social sign-in can be added next.</p></div></main>
}