import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js'

// Replace these values with the Web App configuration from Firebase Console before enabling live auth.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
}

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean)
export const app = firebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
