import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

function env(name: string) {
  const value = process.env[name]
  if (!value) return undefined
  // Vercel values should normally be entered without quotes, but safely
  // normalize accidental wrapping quotes so the client still works.
  return value.trim().replace(/^['"]|['"]$/g, '').trim() || undefined
}

const config = {
  apiKey: env('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: env('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: env('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: env('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('NEXT_PUBLIC_FIREBASE_APP_ID'),
}

const missing = Object.entries(config).filter(([, value]) => !value).map(([key]) => key)
if (missing.length && typeof window !== 'undefined') {
  console.error(`[Theophos Hub] Missing Firebase environment variables: ${missing.join(', ')}`)
}

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(config)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
