        import { cities } from './allcities.js';

        const app = Vue.createApp({ 
            data() { 
                return { 
                    countries: [],
                    filteredCountries: [],
                    selectedCountry: '',
                    entry: ''
                };
            }, 
            mounted() { 
                this.fetchCountries();
            },
            methods: {
                async fetchCountries() {
                    
                    try {
                        const response = await axios.get('https://restcountries.com/v3.1/all');
                        this.countries = response.data.map(country => country.name.common);
                        this.countries = this.countries.concat(cities);
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
                submit() {
                    window.location.href = 'options.html?country=' + this.entry; 
                    localStorage.setItem('selectedCountry', this.selectedCountry);
                },
                change() {
                    this.entry = this.selectedCountry;
                }
            }
        });
        const vm = app.mount('#app');