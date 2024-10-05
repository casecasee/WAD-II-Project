  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

  import {config} from './stuff.js';

  // Initialize Firebase
  const app = initializeApp(config);
  const auth = getAuth(app);

  const checkAuth = async() => {
    onAuthStateChanged(auth, user => {
      console.log(user);
        if (!user) {
            window.location.href = 'index.html';
        }
    })
  }

checkAuth();