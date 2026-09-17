import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

function env(name: string) {
  const value = process.env[name]
  if (!value) return undefined
  return value.trim().replace(/^['"]|['"]$/g, '').trim() || undefined
}

const rawConfig = {
  apiKey: env('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: env('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: env('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: env('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('NEXT_PUBLIC_FIREBASE_APP_ID'),
}

export const firebaseConfigReady = Object.values(rawConfig).every(Boolean)

// Never let a missing Vercel variable crash the entire Next.js client bundle.
// The fallback is deliberately non-functional; Firebase operations will fail
// with a normal request/config error that the UI can catch and display.
const config = firebaseConfigReady
  ? rawConfig
  : {
      ...rawConfig,
      apiKey: rawConfig.apiKey || 'theophos-missing-firebase-api-key',
      authDomain: rawConfig.authDomain || 'theophos-missing-firebase.firebaseapp.com',
      projectId: rawConfig.projectId || 'theophos-missing-firebase-project',
      storageBucket: rawConfig.storageBucket || 'theophos-missing-firebase.appspot.com',
      messagingSenderId: rawConfig.messagingSenderId || '000000000000',
      appId: rawConfig.appId || '1:000000000000:web:theophosmissing',
    }

if (!firebaseConfigReady && typeof window !== 'undefined') {
  const missing = Object.entries(rawConfig).filter(([, value]) => !value).map(([key]) => key)
  console.error(`[Theophos Hub] Missing Firebase environment variables: ${missing.join(', ')}`)
}

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(config)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
