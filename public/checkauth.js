  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
  import { getAuth,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut

   } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAJDyneJxHnF10GyYuJ1fzviNQsxz6JeqM",
    authDomain: "wad2-135ba.firebaseapp.com",
    projectId: "wad2-135ba",
    storageBucket: "wad2-135ba.appspot.com",
    messagingSenderId: "515831656516",
    appId: "1:515831656516:web:1fa01f5c40cf3a9ccd8c11",
    measurementId: "G-T97LKQJYXG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const checkAuth = async() => {
    onAuthStateChanged(auth, user => {
        if (!user) {
            window.location.href = 'signInPage.html';
        }
    })
  }

checkAuth();