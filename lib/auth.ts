import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function getCurrentCreator(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export { auth, db, onAuthStateChanged, signOut }
