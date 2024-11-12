import { add_hotel } from './functions.js';

const app = Vue.createApp({
        data() {
            return {
                startDate: '',
                endDate: '',
                hotels: [],
                showPopup: false,
                RAPID_API_KEY: "7bb272beafmshf057635e1f360f4p10cef0jsn822b6e337760",
                RAPID_API_HOST: "booking-com.p.rapidapi.com",
                country: ''
            }
        },
        computed: {
            tripID() {
                const id = localStorage.getItem('tripID');
                return id;
            }
        },

        mounted() {
            // Retrieve the destination from localStorage when the component is mounted
            const storedCountry = localStorage.getItem('selectedCountry');
            if (storedCountry) {
                this.country = storedCountry; // Update the country property
            } else {
                console.error("No country found in localStorage.");
            }
        },

        methods: {
            async searchHotels() {
                if (!this.country || !this.startDate || !this.endDate) { 
                    alert('Please fill in all fields');
                    return;
                }

                try {
                    // Get location data
                    const locationResponse = await axios.request({
                        method: 'GET',
                        url: 'https://booking-com.p.rapidapi.com/v1/hotels/locations',
                        params: {
                            name: this.country,
                            locale: 'en-us'
                        },
                        headers: {
                            'X-RapidAPI-Key': this.RAPID_API_KEY,
                            'X-RapidAPI-Host': this.RAPID_API_HOST
                        }
                    });

                    if (locationResponse.data && locationResponse.data.length > 0) {
                        const location = locationResponse.data[0];
                        
                        // Search hotels
                        const searchResponse = await axios.request({
                            method: 'GET',
                            url: 'https://booking-com.p.rapidapi.com/v1/hotels/search-by-coordinates',
                            params: {
                                units: 'metric',
                                room_number: '1',
                                longitude: location.longitude,
                                latitude: location.latitude,
                                filter_by_currency: 'SGD',
                                locale: 'en-us',
                                checkout_date: this.endDate,
                                adults_number: '2',
                                checkin_date: this.startDate,
                                order_by: 'popularity',
                                page_number: '0'
                            },
                            headers: {
                                'X-RapidAPI-Key': this.RAPID_API_KEY,
                                'X-RapidAPI-Host': this.RAPID_API_HOST
                            }
                        });

                        this.hotels = searchResponse.data.result || [];
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error fetching hotel data');
                }
            },
            async addHotel(event) {
                try {
                    // Get the hotel directly from the clicked element's parent
                    const hotelCard = event.target.closest('.hotel-card');
                    if (!hotelCard) {
                        throw new Error('Could not find hotel card element');
                    }

                    // Get the index from the hotel card
                    const index = Array.from(hotelCard.parentElement.children).indexOf(hotelCard);
                    const hotel = this.hotels[index];

                    if (!hotel) {
                        throw new Error('Hotel not found');
                    }

                    // Get tripID from localStorage
                    const tripID = localStorage.getItem('tripID');
                    if (!tripID) {
                        alert('No trip ID found. Please select a trip first.');
                        return;
                    }

                    // Add hotel to the trip
                    await add_hotel(
                        tripID,
                        hotel.hotel_name,
                        this.startDate,
                        this.endDate,
                        hotel.min_total_price || 0
                    );

                    // Show success popup
                    this.showPopup = true;
                    
                    // Hide popup after 2 seconds
                    setTimeout(() => {
                        this.showPopup = false;
                    }, 2000);

                    // Optional: Show success message
                    alert('Hotel added successfully!');
                    window.location.href = `mytripinfo.html?country=${encodeURIComponent(this.country)}`

                } catch (error) {
                    console.error('Error adding hotel:', error);
                    alert('Failed to add hotel to trip: ' + error.message);
                }
            },
            closePopup() {
                this.showPopup = false;
            },
        }
    }).mount('#app')