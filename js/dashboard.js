import './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
const config=window.THEOPHOS_FIREBASE_CONFIG;const app=initializeApp(config);const auth=getAuth(app);const db=getFirestore(app);
onAuthStateChanged(auth,async user=>{if(!user){location.href='login.html';return}const snap=await getDoc(doc(db,'users',user.uid));if(snap.exists()){const d=snap.data();document.getElementById('xp').textContent=d.xp??0;document.getElementById('reputation').textContent=d.reputation??0;document.getElementById('streak').textContent=d.streak??0}});document.getElementById('logoutBtn').onclick=()=>signOut(auth).then(()=>location.href='index.html');