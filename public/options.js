const app = Vue.createApp({
    data() {
        return {
            selectedCountry: ''
        };
    },
    mounted() {
        this.selectedCountry = localStorage.getItem('selectedCountry');
    },
    methods: {
        goToAttractions() {
            localStorage.setItem('selectedCountry', this.selectedCountry);
            window.location.href = 'attractionImages.html';
        },
        async fetchCountries() {
            try {
                const response = await axios.get('https://api.example.com/countries'); // Replace with your actual API endpoint
                this.countries = response.data; // Assuming response.data contains the country list
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        }
    }
});

app.mount('#app');