import { getFirestore, doc, getDoc, getDocs, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { firebaseApp } from "./stuff.js";

const db = getFirestore(firebaseApp);

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
                country: '',
                hotelStartDate: '',
                hotelEndDate: '',
                tripID: ''
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
            this.getTripIDFromURL();
            if (this.tripID) {
                this.fetchTripData(this.tripID);
            }
            const storedCountry = localStorage.getItem('selectedCountry');
            if (storedCountry) {
                this.country = storedCountry; // Update the country property
            } else {
                console.error("No country found in localStorage.");
            }
        },

        methods: {
            getTripIDFromURL() {
                const urlParams = new URLSearchParams(window.location.search);
                // this.tripID = urlParams.get('tripID');
                this.tripID = localStorage.getItem('tripID')
                this.country = urlParams.get('country')
                console.log("Current tripID from URL:", this.tripID); // Log for debugging
            },
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

            async fetchTripData(tripID) {
                const tripRef = doc(db, "trips", tripID);
                const tripSnap = await getDoc(tripRef);
            
                if (tripSnap.exists()) {
                    const tripData = tripSnap.data();
            
                    this.hotelStartDate = tripData.startdate; // Trip start date
                    this.hotelEndDate = tripData.enddate;     // Trip end date
            
                    // Set date limits for check-in and check-out inputs
                    const checkinMin = new Date(this.hotelStartDate).toISOString().split('T')[0];
                    const checkoutMax = new Date(this.hotelEndDate).toISOString().split('T')[0];
            
                    // Bind limits to input elements dynamically
                    this.$refs.checkinDate.setAttribute('min', checkinMin);
                    this.$refs.checkinDate.setAttribute('max', checkoutMax);
                    this.$refs.checkoutDate.setAttribute('min', checkinMin);
                    this.$refs.checkoutDate.setAttribute('max', checkoutMax);
                } else {
                    console.error("No such trip found.");
                }
            }
            
        }
    }).mount('#app')