import { cities } from './allcities.js';
import { firebaseApp } from './stuff.js';
import { UID, add_info_trips, update_trips_users } from './functions.js';

const app = Vue.createApp({ 
    data() {
        return {
            countries: [],
            filteredCountries: [],
            selectedCountry: '',
            entry: '',
            start: '',
            end: '',
            budget: '',
            minDate: this.getMinDate() // Adding minDate for future dates
        };
    },
    async mounted() { 
        this.fetchCountries();
        this.UID = await UID();

        gsap.to("#form-container", {
            duration: 1,
            opacity: 1,
            y: 0,
            ease: "power3.out",
            delay: 0.5
        });
    },
    methods: {
        async fetchCountries() {
            try {
                const response = await axios.get('https://restcountries.com/v3.1/all');
                this.countries = response.data.map(country => country.name.common);
                cities.forEach(city => {
                    if (this.countries.indexOf(city) == -1) { this.countries.push(city); }
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
        getMinDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding leading zero if necessary
            const day = String(today.getDate()).padStart(2, '0'); // Adding leading zero if necessary
            return `${year}-${month}-${day}`; // Return the date in YYYY-MM-DD format
        },
        async submit() {
            // Check if all fields are filled
            if (!this.selectedCountry) {
                // alert("Please select a country.");
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Please select a country.',
                    confirmButtonColor: '#DCB287'
                });
                return;
            }

            if (!this.start || !this.end || !this.budget) {
                alert("Please fill all the fields.");
                return;
            }
    
            // Check if the start and end dates are in the future
            const currentDate = new Date();
            const startDate = new Date(this.start);
            const endDate = new Date(this.end);
    
            if (startDate <= currentDate || endDate <= currentDate) {
                alert("Please select future dates.");
                return;
            }
    
            // Check if the end date is after the start date
            if (endDate <= startDate) {
                alert("End date must be later than start date.");
                return;
            }
    
            const tripID = await add_info_trips(this.selectedCountry, this.start, this.end, this.budget);
            await update_trips_users(this.UID, tripID);

            window.location.href = `mytripinfo.html?country=${tripID}`;
            localStorage.setItem('selectedCountry', this.selectedCountry);
        },
        change() {
            this.entry = this.selectedCountry;
        }, 
        scrollToForm() {
            gsap.to(window, {
                duration: 1,
                scrollTo: "#form-container"
            });
        }
    }
});
const vm = app.mount('#app1');
