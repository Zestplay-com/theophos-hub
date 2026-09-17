import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import { getFirestore,doc,getDoc,setDoc,serverTimestamp,collection,addDoc,getDocs,query,orderBy,limit } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
const config=window.THEOPHOS_CONFIG?.firebase||{};
export const firebaseReady=Boolean(config.apiKey&&config.projectId&&config.appId);
export const app=firebaseReady?initializeApp(config):null;
export const auth=app?getAuth(app):null;
export const db=app?getFirestore(app):null;
export {onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,doc,getDoc,setDoc,serverTimestamp,collection,addDoc,getDocs,query,orderBy,limit};
export function requireFirebase(){if(!firebaseReady)throw new Error('Firebase is not configured yet. Add the Firebase Web App API key to js/config.js.');}
