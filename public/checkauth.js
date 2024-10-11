import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import { firebaseApp } from './stuff.js';

const auth = getAuth(firebaseApp);

const checkAuth = async() => {
  onAuthStateChanged(auth, user => {
    console.log(user);
      if (!user) {
          window.location.href = 'index.html';
      }
  })
}

checkAuth();