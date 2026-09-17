import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

// Add the public Firebase Web App configuration here before going live.
// These are client-side Firebase identifiers, not Admin secrets.
const firebaseConfig = window.THEOPHOS_FIREBASE_CONFIG || null;

function message(id,text,error=true){const el=document.getElementById(id);if(!el)return;el.textContent=text;el.className=error?'message error':'message success'}
function ready(id){if(firebaseConfig)return true;message(id,'Firebase is not configured yet. Add the Firebase Web App configuration in js/firebase-config.js.',true);return false}
function friendly(code){const m={'auth/invalid-credential':'Email or password is incorrect.','auth/email-already-in-use':'An account already exists with this email.','auth/weak-password':'Please use a stronger password.','auth/invalid-email':'Please enter a valid email address.','auth/unauthorized-domain':'This website domain is not authorized in Firebase Authentication.','auth/popup-closed-by-user':'Google sign-in was cancelled.','auth/network-request-failed':'Firebase could not be reached. Check your connection.'};return m[code]||`Authentication failed (${code||'unknown-error'}).`}

let auth=null,db=null;
if(firebaseConfig){const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app)}

const login=document.getElementById('loginBtn');
if(login)login.addEventListener('click',async()=>{if(!ready('authMessage'))return;const email=document.getElementById('email').value.trim(),password=document.getElementById('password').value;if(!email||!password){message('authMessage','Enter your email and password.');return}login.disabled=true;try{const c=await signInWithEmailAndPassword(auth,email,password);const p=await getDoc(doc(db,'users',c.user.uid));location.href=p.exists()?'dashboard.html':'join.html'}catch(e){message('authMessage',friendly(e.code))}finally{login.disabled=false}});

const google=document.getElementById('googleBtn');
if(google)google.addEventListener('click',async()=>{if(!ready('authMessage'))return;google.disabled=true;try{const c=await signInWithPopup(auth,new GoogleAuthProvider());const p=await getDoc(doc(db,'users',c.user.uid));location.href=p.exists()?'dashboard.html':'join.html'}catch(e){message('authMessage',friendly(e.code))}finally{google.disabled=false}});

const reset=document.getElementById('resetBtn');
if(reset)reset.addEventListener('click',async()=>{if(!ready('authMessage'))return;const email=document.getElementById('email').value.trim();if(!email){message('authMessage','Enter your email first.');return}try{await sendPasswordResetEmail(auth,email);message('authMessage','Password reset email sent. Check your inbox.',false)}catch(e){message('authMessage',friendly(e.code))}});

const join=document.getElementById('joinBtn');
if(join)join.addEventListener('click',async()=>{if(!ready('joinMessage'))return;const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim(),password=document.getElementById('password').value,niche=document.getElementById('niche').value,channel=document.getElementById('channel').value.trim();if(!name||!email||password.length<6||!niche){message('joinMessage','Enter your name, email, password and primary niche.');return}join.disabled=true;try{const c=await createUserWithEmailAndPassword(auth,email,password);await setDoc(doc(db,'users',c.user.uid),{displayName:name,email,youtubeChannelUrl:channel,primaryNiche:niche,secondaryNiches:[],goals:[],contentFormat:'both',xp:0,reputation:0,credits:0,streak:0,level:'New Creator',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});location.href='dashboard.html'}catch(e){message('joinMessage',friendly(e.code))}finally{join.disabled=false}});