import {auth,onAuthStateChanged,signOut} from './firebase.js';

export function protectPage(){
 const userName=document.querySelector('[data-user-name]');
 if(auth){onAuthStateChanged(auth,user=>{if(!user){location.href='login.html';return;}if(userName)userName.textContent=user.displayName||user.email?.split('@')[0]||'Creator';});}
}
export function bindLogout(){document.querySelectorAll('[data-logout]').forEach(button=>button.addEventListener('click',async()=>{try{if(auth)await signOut(auth);}finally{location.href='index.html';}}));}
export function renderDemo(){document.querySelectorAll('[data-demo]').forEach(el=>{el.textContent=el.dataset.demo;});}
