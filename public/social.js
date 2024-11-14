import { UID, add_info_trips, update_trips_users, get_all_trips } from "./functions.js";
import { firebaseApp } from "./stuff.js";
import { 
    getFirestore, 
    doc, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { config } from './config.js';


// Initialize Firestore
const db = getFirestore(firebaseApp);

const app = Vue.createApp({
    data() {
        return {
            photos: [],
            selectedPhoto: null,
            currentPage: 1,
            photosPerPage: 8,
            UID: null,
        }
    },
    methods: {
        async fetchCountryImage(destination) {
            const query = `Famous and iconic locations ${destination}`;
            const url = `https://api.unsplash.com/photos/random?client_id=${config.UNSPLASH_API_KEY1}&query=${encodeURIComponent(query)}`;
        
            try {
                const response = await axios.get(url);
                return response.data.urls.regular;
            } catch (error) {
                console.error(`Error fetching image for ${destination}:`, error);
                return 'https://images.unsplash.com/photo-1500835556837-99ac94a94552';
            }
        },

        async loadTrips() {
            try {
                const trips = await get_all_trips();
                console.log("Raw trips data:", trips);

                this.photos = await Promise.all(trips.map(async trip => {
                    const photoURL = await this.fetchCountryImage(trip.destination);

                    // Map attractions data properly
                    const attractions = trip.attractions.map(attraction => ({
                        id: attraction.id || Math.random().toString(),
                        name: attraction.a_name, // Note the property is 'a_name' not 'name'
                        date: attraction.date,
                        cost: attraction.cost
                    }));

                    console.log("Mapped attractions:", attractions); // Debug log

                    return {
                        id: trip.tripID,
                        src: photoURL,
                        alt: `Trip to ${trip.destination}`,
                        desc: `Trip to ${trip.destination}`,
                        destination: trip.destination,
                        startDate: trip.startdate,
                        endDate: trip.enddate,
                        budget: trip.budget || 0,
                        flights: trip.flights || [],
                        hotels: trip.hotels || [],
                        attractions: attractions // Use the mapped attractions
                    };
                }));

                console.log("Processed photos:", this.photos);
            } catch (error) {
                console.error('Error loading trips:', error);
            }
        },

        openModal(photo) {
            console.log("Opening modal for:", photo);
            this.selectedPhoto = { ...photo };
        },

        closeModal() {
            this.selectedPhoto = null;
        },

        getCurrentDate() {
            return new Date().toISOString().split('T')[0];
        },

        async addToMyTrips(photo) {
            try {
                if (!this.validateDates()) {
                    return;
                }

                this.UID = await UID();
                
                if (!this.UID) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'User not logged in',
                        icon: 'error',
                        confirmButtonColor: '#764F37'
                    });
                    return;
                }

                // First add the trip info
                const tripID = await add_info_trips(
                    photo.destination, 
                    photo.startDate,
                    photo.endDate,
                    photo.cost
                );

                console.log("Created trip with ID:", tripID); // Debug log

                // Then update the user's trips
                await update_trips_users(this.UID, tripID);
                console.log("Updated user's trips"); // Debug log

                // Add attractions if they exist
                if (photo.attractions && photo.attractions.length > 0) {
                    for (const attraction of photo.attractions) {
                        await add_attraction(
                            tripID,
                            attraction.name,
                            attraction.date,
                            attraction.cost || 0
                        );
                    }
                }

                // Add hotels if they exist
                if (photo.hotels && photo.hotels.length > 0) {
                    for (const hotel of photo.hotels) {
                        await add_hotel(
                            tripID,
                            hotel.name,
                            hotel.startDate,
                            hotel.endDate,
                            hotel.cost || 0
                        );
                    }
                }

                localStorage.setItem('selectedCountry', photo.destination);
                localStorage.setItem('tripID', tripID); // Add this line
                
                Swal.fire({
                    title: 'Success!',
                    text: 'Trip added to your itineraries successfully!',
                    icon: 'success',
                    confirmButtonColor: '#764F37',
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    this.closeModal();
                    window.location.href = 'mytrips.html';
                });

            } catch (error) {
                console.error('Error adding trip:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to add trip to your itineraries: ' + error.message,
                    icon: 'error',
                    confirmButtonColor: '#764F37'
                });
            }
        },

        handleEscKey(event) {
            if (event.key === 'Escape' && this.selectedPhoto) {
                this.closeModal();
            }
        },

        validateDates() {
            if (!this.selectedPhoto.startDate || !this.selectedPhoto.endDate) {
                Swal.fire({
                    title: 'Warning!',
                    text: 'Please select both start and end dates',
                    icon: 'warning',
                    confirmButtonColor: '#764F37'
                });
                return false;
            }

            const start = new Date(this.selectedPhoto.startDate);
            const end = new Date(this.selectedPhoto.endDate);

            if (end < start) {
                Swal.fire({
                    title: 'Warning!',
                    text: 'End date cannot be before start date',
                    icon: 'warning',
                    confirmButtonColor: '#764F37'
                });
                return false;
            }

            return true;
        },

        changePage(page) {
            // Add validation to prevent invalid page numbers
            if (page < 1 || page > this.totalPages) {
                return;
            }
            this.currentPage = page;
            console.log('Changed to page:', page); // Debug log
        },

        previousPage() {
            if (this.currentPage > 1) {
                this.changePage(this.currentPage - 1);
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.changePage(this.currentPage + 1);
            }
        }
    },
    computed: {
        displayedPhotos() {
            const start = (this.currentPage - 1) * this.photosPerPage;
            const end = start + this.photosPerPage;
            return this.photos.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.photos.length / this.photosPerPage);
        },
        calculateDuration() {
            if (!this.selectedPhoto?.startDate || !this.selectedPhoto?.endDate) {
                return 0;
            }
            const start = new Date(this.selectedPhoto.startDate);
            const end = new Date(this.selectedPhoto.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays + 1;
        },
        canGoPrevious() {
            return this.currentPage > 1;
        },
        canGoNext() {
            return this.currentPage < this.totalPages;
        }
    },
    async mounted() {
        await this.loadTrips();
        document.addEventListener('keydown', this.handleEscKey);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleEscKey);
    }
}).mount('#app');