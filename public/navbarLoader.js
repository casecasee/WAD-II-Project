// Check if the app is already mounted and unmount if it is
const existingApp = document.getElementById('navbar-app').__vue_app__;
if (existingApp) {
    existingApp.unmount();
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
                            <span class="action_btn"> My Profile</span>
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
                    navbarLinks: [
                        { name: 'Home', url: 'homepage.html' },
                        { name: 'Community Feed', url: 'social.html' },
                        { name: 'My Trips', url: 'mytrips.html' }
                    ]
                };
            },
            methods: {
                toggleMenu() {
                    this.isOpen = !this.isOpen; // Toggle the dropdown menu
                },
                handleResize() {
                    // Close the dropdown if the window is wider than 992px
                    if (window.innerWidth > 992) {
                        this.isOpen = false;
                    }
                }
            },
            mounted() {
                window.addEventListener('resize', this.handleResize);
            },
            beforeUnmount() {
                window.removeEventListener('resize', this.handleResize);
            }
        }
    }
}).mount('#navbar-app');
