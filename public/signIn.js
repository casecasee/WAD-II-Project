  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
  import { getAuth,
           createUserWithEmailAndPassword, 
           signInWithEmailAndPassword,
           onAuthStateChanged,
           signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
  
  import { config } from './stuff.js';

  // Initialize Firebase
  const firebaseApp = initializeApp(config);
  const auth = getAuth(firebaseApp);

  const app = Vue.createApp({ 
      data() { 
          return { 
                email: '',
                pwd: ''
          };
      },
      
      methods: {
          async signUp() {
              const email = this.email;
              const pwd = this.pwd;
              createUserWithEmailAndPassword(auth, email, pwd)
              .then((userCredentials) => {
                  const user = userCredentials.user;
                  alert('Welcome ' + user['email']);
                  window.location.href = 'content.html'
          
              })
              .catch((error) => {
                  const errCode = error.code;
                  const errMsg = error.message;
                  console.log(errCode + errMsg);
              })    
          },

          async signIn() {

            const email = this.email;
            const pwd = this.pwd;
            signInWithEmailAndPassword(auth, email, pwd)
            .then((userCredentials) => {
                const user = userCredentials.user;
                console.log(user);
                alert('Welcome ' + user['email']);
                window.location.href = 'content.html'
        
            })
            .catch((error) => {
                const errCode = error.code;
                const errMsg = error.message;
                console.log(errCode + errMsg);
            })

          }

      } // methods
  });
  const vm = app.mount('#app'); 