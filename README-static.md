# Theophos Hub static frontend

The production frontend is HTML5, CSS3 and browser JavaScript. GitHub Pages is the hosting layer. Firebase provides authentication and Firestore data. No Vercel deployment is required.

Before authentication can work, replace the empty `apiKey` in `js/config.js` with the Firebase Web App API key from Firebase Console. Do not put Firebase Admin credentials in this file.
