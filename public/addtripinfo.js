import { cities } from './allcities.js';
import { firebaseApp } from './stuff.js';
import { add_info_trips, update_trips_users } from './functions.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


const app = Vue.createApp({ 
    data() { 
        return { 
            countries: [],
            filteredCountries: [],
            selectedCountry: '',
            entry: '', 
            start: '', 
            end: '', 
            budget: ''
        };
    }, 
    mounted() { 
        this.fetchCountries();
        const auth = getAuth(firebaseApp);
        onAuthStateChanged(auth, user => {
                if (user) {
                    this.UID = user.uid;
                }
            })
    },
    methods: {
        async fetchCountries() {
            try {
                const response = await axios.get('https://restcountries.com/v3.1/all');
                this.countries = response.data.map(country => country.name.common);
                cities.forEach(city => {
                    if (this.countries.indexOf(city) == -1) {this.countries.push(city)}
                });
                this.filteredCountries = this.countries;
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        },
        filterCountries() {
            if (!this.entry) {
                this.filteredCountries = this.countries;
            } else {
                this.filteredCountries = this.countries.filter(country =>
                    country.toLowerCase().startsWith(this.entry.toLowerCase())
                );
            }
        },
        async submit() {
            // TODO some sort of check that the selected country/city is valid
            const tripID = await add_info_trips(firebaseApp, this.selectedCountry, this.start, this.end, this.budget); 
            await update_trips_users(firebaseApp, this.UID, tripID);

            window.location.href = 'options.html?country=' + this.entry; 
            localStorage.setItem('selectedCountry', this.selectedCountry);
        },
        change() {
            this.entry = this.selectedCountry;
        }, 
    }
});
const vm = app.mount('#app');