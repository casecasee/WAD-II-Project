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


//   app.component('no', { 
//     //   props: [ 'prop1', 'prop2' ],
      
//       data() {
//           return {
//               // key: value
//           }
//       }, // data
      
//       methods: {
//           methodName() {
              
//           }
//       }, // methods
      
//       template: `
//       <div class='container-fluid p-3' id="outer">
//             <div class='row'>
//                 <div class='col'>

//         <div class='container-fluid bg-white side'>
//             <div class='row'>
//                 <div class='col-6'>
//                     <h1 id="title">Roameo</h1>
//                 </div> <!-- col -->
//                 <div class='col-4'>
//                     <h2 id="header">Sign Up</h2>
//                 </div> <!-- col -->
//                 <div class='col pt-3'>
//                     <div id="stamp"></div>  
//                 </div> <!-- col -->
//             </div> <!-- row -->

//             <div class="row">
//                 <div class="col-6">

//                 </div>

//                 <div class="col-6">

//                     <div class="form-container">
//                         <div class="form-group">
//                             <label for="name">Name:</label>
//                             <div class="row">
//                                 <div class="col">
//                                     <input v-model="name" type="disp" id="name" name="name" autocomplete="off" class="form-control" required>
//                                 </div>
//                             </div>
//                         </div>

//                         <div class="form-group">
//                             <label for="email">Email:</label>
//                             <div class="row">
//                                 <div class="col">
//                                     <input v-model="email" type="email" name="email" autocomplete="off" class="form-control" required>
//                                 </div>
//                             </div>
//                         </div>

//                         <div class="form-group">
//                             <label for="pwd">Password:</label>
//                             <div class="row">
//                                 <div class="col">
//                                     <input v-model="pwd" type="password" name="pwd" autocomplete="off" class="form-control" required>
//                                 </div>
//                             </div>
//                         </div>
//                         <div id="signUp"><button class="btn btn-primary mt-3" @click='$emit("signupp")'>Sign Up!</button></div>
                        
//                     </div>
            
//                 </div>

//             </div>

//             <div class='row'>
//                 <div class='col-6'>
//                     <button class="btn btn-success flip-button mb-3" @click='$emit("flipp")'>Already have an account? Sign In</button>
//                 </div>
//             </div

//         </div> <!-- container -->

//         </div>
//         </div>
//         </div>
//       `
//   });


//   app.component('yes', { 
//     //   props: [ 'prop1', 'prop2' ],

      
//       data() {
//           return {
//               // key: value
//           }
//       }, // data
      
//       methods: {
//           methodName() {
              
//           }
//       }, // methods
      
//       template: `

//       <div class='container-fluid p-3' id="outer">
//             <div class='row'>
//                 <div class='col'>


//       <div class='container-fluid bg-white side'>
//                         <div class='row'>
//                             <div class='col-6'>
//                                 <h1 id="title">Roameo</h1>
//                             </div> <!-- col -->
//                             <div class='col-4'>
//                                 <h2 id="header">Sign In</h2>
//                             </div> <!-- col -->
//                             <div class='col pt-3'>
//                                 <div id="stamp"></div>  
//                             </div> <!-- col -->
//                         </div> <!-- row -->

//                         <div class="row">
//                             <div class="col-6">

//                             </div>

//                             <div class="col-6">

//                                 <div class="form-container">
                                    
//                                     <div class="form-group">
//                                         <label for="email">Email:</label>
//                                         <div class="row">
//                                             <div class="col">
//                                                 <input v-model="email" type="email" name="email" autocomplete="off" class="form-control" required>
//                                             </div>
//                                         </div>
//                                     </div>
        
//                                     <div class="form-group">
//                                         <label for="pwd">Password:</label>
//                                         <div class="row">
//                                             <div class="col">
//                                                 <input v-model="pwd" type="password" name="pwd" autocomplete="off" class="form-control" required>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <div id="signUp"><button class="btn btn-primary mt-3" @click="$emit('signinn')">Sign In!</button></div>
                                    
//                                 </div>
                        
//                             </div>

//                         </div>

//                         <div class='row'>
//                             <div class='col-6'>
//                                 <button class="btn btn-success flip-button" @click="$emit('flipp')">Need an account? Sign Up</button>
//                             </div>
//                         </div

//                     </div> <!-- container -->

//                     </div>
//                     </div>
//                     </div>


      
//       `
//   });
//   // component must be declared before app.mount(...)

  const vm = app.mount('#app'); 