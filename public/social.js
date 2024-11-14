import { UID, add_info_trips, update_trips_users, trips_for_community, add_attraction, add_hotel } from "./functions.js";
import { firebaseApp } from "./stuff.js";
import { 
    getFirestore, 
    doc, 
    collection, 
    getDocs,
    getDoc
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
            //REMIND ME TO CHANGE THIS BACK TO THE ORIGINAL
            // const url = `https://api.unsplash.com/photos/random?client_id=${config.UNSPLASH_API_KEY1}&query=${encodeURIComponent(query)}`;
            const url = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552';
        
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
                this.UID = await UID();
                const trips = await trips_for_community(this.UID);
                console.log("Community trips:", trips);

                this.photos = await Promise.all(trips.map(async trip => {
                    const photoURL = await this.fetchCountryImage(trip.destination);

                    // Get subcollections data
                    const tripRef = doc(db, "trips", trip.tripID);
                    
                    // Get hotels
                    const hotelsRef = collection(tripRef, "hotels");
                    const hotelsSnap = await getDocs(hotelsRef);
                    const hotels = hotelsSnap.docs.map(doc => {
                        const data = doc.data();
                        console.log("Hotel data:", data);
                        return {
                            id: doc.id,
                            ...data
                        };
                    });

                    // Get attractions
                    const attractionsRef = collection(tripRef, "attractions");
                    const attractionsSnap = await getDocs(attractionsRef);
                    const attractions = attractionsSnap.docs.map(doc => {
                        const data = doc.data();
                        console.log("Attraction data:", data);
                        return {
                            id: doc.id,
                            ...data
                        };
                    });

                    return {
                        id: trip.tripID,
                        src: photoURL,
                        alt: `Trip to ${trip.destination}`,
                        desc: `Trip to ${trip.destination}`,
                        destination: trip.destination,
                        startDate: trip.startdate,
                        endDate: trip.enddate,
                        budget: trip.budget || 0,
                        hotels: hotels,
                        attractions: attractions,
                        // Calculate duration
                        duration: this.calculateTripDuration(trip.startdate, trip.enddate)
                    };
                }));
                console.log("Final photos array:", this.photos.map(photo => ({
                        id: photo.id,
                        hotels: photo.hotels,
                        attractions: photo.attractions
                    })));

                console.log("Processed photos with details:", this.photos);
            } catch (error) {
                console.error('Error loading trips:', error);
            }
        },

        calculateTripDuration(startDate, endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays + 1; // Including both start and end days
        },

        async openModal(photo) {
            try {
                console.log("Opening modal for photo:", photo);

                const tripRef = doc(db, "trips", photo.id);
                const tripSnap = await getDoc(tripRef);
                const tripData = tripSnap.data();

                this.selectedPhoto = {
                    ...photo,
                    hotels: tripData.hotels || [],
                    attractions: tripData.attractions || [],
                    budget: tripData.budget || 0,
                    startDate: tripData.startdate,
                    endDate: tripData.enddate,
                    totalCost: this.calculateTotalCost(photo.budget, photo.hotels, photo.attractions)
                };

                console.log("Attractions in modal:", this.selectedPhoto.attractions);
                
                // // Get the specific trip's data
                // const tripRef = doc(db, "trips", photo.id);
                
                // // Get hotels for this trip
                // const hotelsRef = collection(tripRef, "hotels");
                // const hotelsSnap = await getDocs(hotelsRef);
                // const hotels = hotelsSnap.docs.map(doc => ({
                //     id: doc.id,
                //     ...doc.data()
                // }));
                // console.log("Hotels for trip:", hotels);

                // // Get attractions for this trip
                // const attractionsRef = collection(tripRef, "attractions");
                // const attractionsSnap = await getDocs(attractionsRef);
                // const attractions = attractionsSnap.docs.map(doc => ({
                //     id: doc.id,
                //     ...doc.data()
                // }));
                // console.log("Attractions for trip:", attractions);

                // // Set the selected photo with all its data
                // this.selectedPhoto = {
                //     ...photo,
                //     hotels: hotels,
                //     attractions: attractions,
                //     totalCost: this.calculateTotalCost(photo.budget, hotels, attractions)
                // };

                console.log("Complete modal data:", this.selectedPhoto);
            } catch (error) {
                console.error("Error opening modal:", error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to load trip details',
                    icon: 'error',
                    confirmButtonColor: '#764F37'
                });
            }
        },

        calculateTotalCost(budget, hotels, attractions) {
            let total = budget || 0;
            
            // Add hotel costs
            if (hotels && hotels.length) {
                total += hotels.reduce((sum, hotel) => sum + (parseFloat(hotel.cost) || 0), 0);
            }
            
            // Add attraction costs
            if (attractions && attractions.length) {
                total += attractions.reduce((sum, attraction) => sum + (parseFloat(attraction.cost) || 0), 0);
            }
            
            return total;
        },

        closeModal() {
            this.selectedPhoto = null;
        },

        getCurrentDate() {
            return new Date().toISOString().split('T')[0];
        },

        async addToMyTrips(photo) {
            try {
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

                // this.UID = await UID();
                
                // if (!this.UID) {
                //     Swal.fire({
                //         title: 'Error!',
                //         text: 'User not logged in',
                //         icon: 'error',
                //         confirmButtonColor: '#764F37'
                //     });
                //     return;
                // }

                // First add the trip info
                const tripID = await add_info_trips(
                    photo.destination, 
                    this.selectedPhoto.startDate,
                    this.selectedPhoto.endDate,
                    photo.budget || 0
                );

                // Add attractions
                if (photo.attractions && photo.attractions.length > 0) {
                    for (const attraction of photo.attractions) {
5
                        const date = attraction.date.toDate();

                        // Format the date as DD-MM
                        // const day = String(date.getDate()).padStart(2, '0');    // Get day with leading zero
                        // const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed

                        // const formattedDate = `${day}-${month}`;

                        // Format the time as HH:MM
                        const hours = String(date.getHours()).padStart(2, '0'); // Get hours with leading zero
                        const minutes = String(date.getMinutes()).padStart(2, '0');

                        const formattedTime = `${hours}:${minutes}`;

                        const addd = this.selectedPhoto.startDate.slice(5)
                        // const dateMMDD = "12-25"; // Example for December 25th

                        // Split the date string by the hyphen
                        const [monthh, dayy] = addd.split("-");

                        // Rearrange and format to DD-MM
                        const dateDDMM = `${dayy}-${monthh}`;


                        // console.log(this.selectedPhoto.startDate);



                        await add_attraction(
                            tripID,
                            attraction.a_name,
                            dateDDMM,
                            attraction.cost || 0, 
                            formattedTime
                        );
                    }
                }

                // Add hotels
                if (photo.hotels && photo.hotels.length > 0) {
                    for (const hotel of photo.hotels) {
                        await add_hotel(
                            tripID,
                            hotel.h_name,
                            this.selectedPhoto.startDate,
                            this.selectedPhoto.endDate,
                            hotel.cost || 0
                        );
                    }
                }

                // Update user's trips
                await update_trips_users(this.UID, tripID);
                
                localStorage.setItem('selectedCountry', photo.destination);
                localStorage.setItem('tripID', tripID);
                
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
        this.UID = await UID();
        await this.loadTrips();
        document.addEventListener('keydown', this.handleEscKey);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleEscKey);
    }
}).mount('#app');