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
                isFlipped: false,
                email: '',
                pwd: '', 
                name: ''
          };
      },
      
      methods: {
            flipCard() {
                this.isFlipped = !this.isFlipped;
            },
           async signUp() {

              const email = this.email;
              const pwd = this.pwd;
              const name = this.name;

              try {
                const userCredentials = await createUserWithEmailAndPassword(auth, email, pwd);
                const user = userCredentials.user;
                const UID = user['uid'];

                try{
                    await add_info_users(UID, email, name);   
                    window.location.href = 'homepage.html';
                }
                catch(error) { // this catches errors adding info (shouldnt have here)
                    const errCode = error.code;
                    const errMsg = error.message;
                    console.log(errCode + errMsg);
                }
              }

              catch (error) { // this catches errors for creating acc
                let disp = '';
                console.log(error.code);

                switch (error.code) {
                    case 'auth/missing-email':
                        disp = ("Email field should not be empty");
                        break;
                    case 'auth/missing-password':
                        disp = ("Password field should not be empty");
                        break;
                    case 'auth/invalid-email':
                        disp = ("Invalid email. Email should contain an @");
                        break;
                    case 'auth/email-already-in-use':
                        disp = "An account with this email already exists. Please log in or use a different email.";
                        break;
                    case 'auth/weak-password':
                        disp = "Weak Password. Password must be at least 6 characters long";
                        break;
                    default:
                        disp = ("An error occurred: " + error.message);
                        break;
                };

                Swal.fire({
                    title: 'Error signing up!',
                    text: disp,
                    icon: 'warning',
                    showConfirmButton: false,
                    showCancelButton: true,
                    // cancelButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    cancelButtonText: 'Try Again'})
              }  
          },

          async signIn() {

            const email = this.email;
            const pwd = this.pwd;

            try {
                const userCredentials = await signInWithEmailAndPassword(auth, email, pwd)
                const user = userCredentials.user;
                console.log(user);
                const disp = ('Welcome ' + user['email']);
                window.location.href = 'homepage.html';
            }

            catch(error) {
                let disp = '';
                console.log(error.code);


                switch (error.code) {
                    case 'auth/invalid-credential':
                        disp = "Invalid credentials, do ensure that your email and/or password has been entered correctly";
                        break;
                    default:
                        disp = ("An error occurred: " + error.message);
                        break;
                };

                Swal.fire({
                    title: 'Error logging in!',
                    text: disp,
                    icon: 'warning',
                    showConfirmButton: false,
                    showCancelButton: true,
                    // cancelButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    cancelButtonText: 'Try Again'})
              }  

          }

      } // methods
  });


  const vm = app.mount('#app'); 