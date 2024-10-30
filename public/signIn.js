  // Import the functions you need from the SDKs you need
  import { getAuth,
           createUserWithEmailAndPassword, 
           signInWithEmailAndPassword,
           onAuthStateChanged,
           signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
  
  import { firebaseApp } from './stuff.js';

  import { add_info_users } from './functions.js';

  // Initialize Firebase
  const auth = getAuth(firebaseApp);

  const app = Vue.createApp({ 
      data() { 
          return { 
                email: '',
                pwd: '', 
                name: ''
          };
      },
      
      methods: {
           async signUp() {

              const email = this.email;
              const pwd = this.pwd;
              const name = this.name;

              try {
                const userCredentials = await createUserWithEmailAndPassword(auth, email, pwd);
                const user = userCredentials.user;
                const UID = user['uid'];

                await add_info_users(firebaseApp, UID, email, name);
                alert('Welcome ' + user['email']);
                window.location.href = 'homepage.html';
              }

              catch (error) {
                  const errCode = error.code;
                  const errMsg = error.message;
                  console.log(errCode + errMsg);
              }  
          },

          async signIn() {

            const email = this.email;
            const pwd = this.pwd;

            try {
                const userCredentials = await signInWithEmailAndPassword(auth, email, pwd)
                const user = userCredentials.user;
                console.log(user);
                alert('Welcome ' + user['email']);
                window.location.href = 'homepage.html';
            }

            catch(error) {
                const errCode = error.code;
                const errMsg = error.message;
                console.log(errCode + errMsg);
            };

          }

      } // methods
  });
  const vm = app.mount('#app'); 