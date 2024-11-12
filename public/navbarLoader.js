// Import Firebase Firestore and Auth modules
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { firebaseApp } from "./stuff.js"; // Assuming firebaseApp is initialized in stuff.js

// Initialize Firestore and Auth
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Check if the app is already mounted and unmount if it is
const existingApp = document.getElementById('navbar-app').__vue_app__;
if (existingApp) {
    existingApp.unmount();
}

// Helper function to get UID of logged-in user
async function getUID() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user.uid);
            } else {
                window.location.href = 'index.html'; // Redirect if no user
                reject("No user signed in");
            }
        });
    });
}

// Create and mount the Vue app
Vue.createApp({
    components: {
        'navbar-component': {
            template: `
                <header>
                    <div class="navbar">
                        <div class="logo"><a href="homepage.html">Roameo</a></div>
                        <ul class="links">
                            <li v-for="link in navbarLinks" :key="link.name">
                                <a :href="link.url">{{ link.name }}</a>
                            </li>
                        </ul>
                        <div class="profile-icon">
                            <a href="profile.html" aria-label="Profile">
                                <img src="dp.png" alt="Profile" class="profile-pic">                            
                                <span class="action_btn">{{ userName || 'My Profile' }}</span>
                            </a>
                        </div>
                        <div class="toggle_btn" @click="toggleMenu">
                            <i v-if="!isOpen" class="fa-solid fa-bars" id="menu-icon"></i> 
                            <i v-else class="fa-solid fa-times"></i>
                        </div>
                    </div>
                    <div class="dropdown_menu" :class="{ open: isOpen }">
                        <ul>
                            <li v-for="link in navbarLinks" :key="link.name">
                                <a :href="link.url">{{ link.name }}</a>
                            </li>
                        </ul>
                    </div>
                </header>
            `,
            data() {
                return {
                    isOpen: false,
                    userName: null,
                    navbarLinks: [
                        { name: 'Home', url: 'homepage.html' },
                        { name: 'Community Feed', url: 'social.html' },
                        { name: 'My Trips', url: 'mytrips.html' }
                    ]
                };
            },
            methods: {
                async fetchUserName() {
                    const UID = await getUID(); // Function to get UID
                    const docRef = doc(db, "users", UID);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        this.userName = docSnap.data().name; // Set userName to the name from Firestore
                    }
                },
                toggleMenu() {
                    this.isOpen = !this.isOpen;
                },
                handleResize() {
                    if (window.innerWidth > 992) {
                        this.isOpen = false;
                    }
                }
            },
            async mounted() {
                window.addEventListener('resize', this.handleResize);
                await this.fetchUserName(); // Fetch the username on mount
            },
            beforeUnmount() {
                window.removeEventListener('resize', this.handleResize);
            }
        }
    }
}).mount('#navbar-app');
