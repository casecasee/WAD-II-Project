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

  // <div id='app'></div>
  const app = Vue.createApp({ 
      data() { 
          return { 
                email: '',
                pwd: ''
          };
      }, // data
      // computed: { 
      //     derivedProperty() {
      //         return false;
      //     }  
      // }, // computed
      // created() { 
      // },
      // mounted() { 
      // },
      methods: {
          methodName() {
              
          }
      } // methods
  });
  const vm = app.mount('#app'); 

  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);

//   const emailTag = document.getElementById('email');
//   const pwdTag = document.getElementById('pwd');
  const signInButton =document.getElementById('signInButton');
  const signUpButton =document.getElementById('signUpButton');

  
  const signUp = async() => {
    const email = vm.email;
    const pwd = vm.pwd;
    createUserWithEmailAndPassword(auth, email, pwd)
    .then((userCredentials) => {
        const user = userCredentials.user;
        alert('Welcome' + user['email']);
        window.location.href = 'content.html'


    })
    .catch((error) => {
        const errCode = error.code;
        const errMsg = error.message;
        console.log(errCode + errMsg);
    })

  }

  const signIn = async() => {
    const email = vm.email;
    const pwd = vm.pwd;
    signInWithEmailAndPassword(auth, email, pwd)
    .then((userCredentials) => {
        const user = userCredentials.user;
        console.log(user);
        alert('Welcome' + user['email']);
        window.location.href = 'content.html'

    })
    .catch((error) => {
        const errCode = error.code;
        const errMsg = error.message;
        console.log(errCode + errMsg);
    })

  }

  signUpButton.addEventListener('click', signUp)
  signInButton.addEventListener('click', signIn)