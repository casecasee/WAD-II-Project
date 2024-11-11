// <!------------------------------------------------------ USES API TO GET IMAGE ------------------------------------------------------------------->
import { UID, get_info, delete_trip } from './functions.js';

const app = Vue.createApp({
    data() {
        return {
            UID: null,
            all: '',
            currentTrips: [],
            oldTrips: [],
            scrollPosition: { current: 0, old: 0 },
            containerWidth: { current: 0, old: 0 },
            showCurrentButtons: false,
            showOldButtons: false,  
        };
    },

    async mounted() {
        // Fetch UID
        this.UID = await UID();
        
        // Fetch initial trip data
        await this.initializeTrips();
        this.updateContainerWidths();
        window.addEventListener('resize', this.updateContainerWidths);
        window.addEventListener('resize', this.updateCarouselButtonsVisibility);

    },

    beforeUnmount() {
        window.removeEventListener('resize', this.updateContainerWidths);
    },

    methods: {
        // Method to fetch country images
        // async fetchCountryImage(destination) {
        //     const query = `most visited places in ${destination}`;
        //     // const url = 'https://api.wikimedia.org/core/v1/wikipedia/en/search/page';
        //     const params = { q: query, limit: 1 };

        //     try {
        //         const response = await axios.get(url, { params });
        //         const page = response.data.pages[0];
        //         if (page && page.thumbnail) {
        //             return page.thumbnail.url.replace('/thumb', '').replace(/\/\d+px-.+$/, ''); // Get full-size image
        //         }
        //     } catch (error) {
        //         console.error(`Error fetching image for ${destination}:`, error);
        //     }
        //     return 'default-image.jpg';
        // },

        async fetchCountryImage(destination) {
            const query = `Famous and iconic locations ${destination}`;
            // const query = `famous place ${destination}`;

            const url = `https://api.unsplash.com/photos/random?client_id=JivBMMHuK8nWdlawocBWaYEZBRT35nzdtkNs8yJM-6g&query=${encodeURIComponent(query)}`;
        
            try {
                const response = await axios.get(url);
                const imageUrl = response.data.urls.regular;
                return imageUrl;
            } catch (error) {
                console.error(`Error fetching image for ${destination}:`, error);
            }
            return 'default-image.jpg';
        },
        
        

        async initializeTrips() {
            // Get all trips based on UID using get_info
            this.all = await get_info(this.UID);
            console.log("get_info response:", this.all);

            // Check if this.all exists
            if (!Array.isArray(this.all)) {
                console.error("Trips data is missing or not an array:", this.all);
                return; 
            }

            const today = new Date();

            for (let trip of this.all) { 
                const tripEndDate = new Date(trip.enddate);
                const image = await this.fetchCountryImage(trip.destination);
                
                const firstFlight = trip.flights[0] || { flightInfo: "N/A", date: trip.startdate }; 

                const tripData = {
                    id: trip.tripID,
                    destination: trip.destination,
                    image: image,
                    startdate: trip.startdate,
                    enddate: trip.enddate,
                };
                
                // if the trip is current or old
                if (tripEndDate >= today) {
                    this.currentTrips.push(tripData);
                } else {
                    this.oldTrips.push(tripData);
                }
            }
            this.updateCarouselButtonsVisibility();

        },

        // Scroll left and right methods for the carousels
        scrollLeft(type) {
            const scrollAmount = 320;
            if (this.scrollPosition[type] < 0) {
                this.scrollPosition[type] = Math.min(0, this.scrollPosition[type] + scrollAmount);
            }
        },
        scrollRight(type) {
            const scrollAmount = 320;
            const trips = type === 'current' ? this.currentTrips : this.oldTrips;
            const totalScrollWidth = trips.length * 320;
            const maxScroll = -(totalScrollWidth - this.containerWidth[type]);

            if (this.scrollPosition[type] > maxScroll) {
                this.scrollPosition[type] = Math.max(maxScroll, this.scrollPosition[type] - scrollAmount);
            }
        },

        // Update container widths on resize
        updateContainerWidths() {
            this.containerWidth.current = document.querySelector('.carousel-container').offsetWidth;
            this.containerWidth.old = document.querySelectorAll('.carousel-container')[1].offsetWidth;
        },

        // Display function that can be used for additional fetching or UI updates
        async disp() {
            this.all = await get_info(this.UID); 
        },
        viewDetails(tripID, destination) {
            // Clear any existing tripID from localStorage
            localStorage.clear('tripID');
            
            // Store the new tripID in localStorage
            localStorage.setItem('tripID', tripID);
        
            // Redirect to the page with the country in the URL
            window.location.href = `mytripinfo.html?country=${encodeURIComponent(destination)}`;
        },

        async deleteTrip(tripID) {
            // Show a confirmation dialog
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do you really want to delete this trip? This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });
        
            if (!result.isConfirmed) return;
        
            try {
                await delete_trip(tripID, this.UID);
                
                // Remove the trip from the lists
                this.currentTrips = this.currentTrips.filter(trip => trip.id !== tripID);
                this.oldTrips = this.oldTrips.filter(trip => trip.id !== tripID);
                
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your trip has been deleted successfully.',
                    icon: 'success',
                    confirmButtonColor: '#3085d6'
                });
            } catch (error) {
                console.error("Failed to delete trip:", error);
                Swal.fire({
                    title: 'Error!',
                    text: 'There was a problem deleting the trip. Please try again later.',
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        },

        updateCarouselButtonsVisibility() {
            const totalWidthCurrent = this.currentTrips.length * 320;  
            const totalWidthOld = this.oldTrips.length * 320;
            const screenWidth = window.innerWidth;

            this.showCurrentButtons = totalWidthCurrent + 200 > screenWidth;
            this.showOldButtons = totalWidthOld + 200 > screenWidth;
        }
        
        
        
    }
});

const vm = app.mount('#app');


// --------------------------------------------------------------------------------------------------------------------------------------------
    // Vue.createApp({
    //     data() {
    //         return {
    //             currentTrips: [],
    //             oldTrips: [],
    //             destinations: [
    //                 { destination: 'Paris', flightInfo: 'Flight AA123, Departure: 10:00 AM', type: 'current' },
    //                 { destination: 'Rome', flightInfo: 'Flight BA456, Departure: 8:00 AM', type: 'current' },
    //                 { destination: 'Tokyo', flightInfo: 'Flight JAL789, Departure: 3:00 PM', type: 'current' },
    //                 { destination: 'USA', flightInfo: 'Flight UA123, Departure: 9:00 AM', type: 'current' },
    //                 { destination: 'Sydney', flightInfo: 'Flight QF123, Departure: 7:00 PM', type: 'current' },
    //                 { destination: 'London', date: '2023-05-10', flightNumber: 'BA789', type: 'old' },
    //                 { destination: 'Barcelona', date: '2023-04-20', flightNumber: 'IB456', type: 'old' },
    //                 { destination: 'Dubai', date: '2023-03-15', flightNumber: 'EK123', type: 'old' },
    //                 { destination: 'Istanbul', date: '2023-02-10', flightNumber: 'TK789', type: 'old' },
    //                 { destination: 'Singapore', date: '2023-01-05', flightNumber: 'SQ456', type: 'old' }
    //             ],
    //             scrollPosition: { current: 0, old: 0 },
    //             containerWidth: { current: 0, old: 0 }
    //         };
    //     },
    //     methods: {
    //         async fetchCountryImage(destination) {
    //             const url = 'https://api.wikimedia.org/core/v1/wikipedia/en/search/page';
    //             const params = { q: destination, limit: 1 };
        
    //             try {
    //                 const response = await axios.get(url, { params });
    //                 const page = response.data.pages[0];
    //                 if (page && page.thumbnail) {
    //                     return page.thumbnail.url.replace('/thumb', '').replace(/\/\d+px-.+$/, ''); // Get full-size image
    //                 }
    //             } catch (error) {
    //                 console.error(`Error fetching image for ${destination}:`, error);
    //             }
    //             return 'default-image.jpg';
    //         },
    //         async initializeTrips() {
    //             for (let trip of this.destinations) {
    //                 const image = await this.fetchCountryImage(trip.destination);
    //                 const tripData = {
    //                     id: Date.now() + Math.random(),
    //                     destination: trip.destination,
    //                     image: image,
    //                     ...(trip.type === 'current' ? { flightInfo: trip.flightInfo } : { date: trip.date, flightNumber: trip.flightNumber })
    //                 };
    //                 if (trip.type === 'current') {
    //                     this.currentTrips.push(tripData);
    //                 } else {
    //                     this.oldTrips.push(tripData);
    //                 }
    //             }
    //         },
    //         scrollLeft(type) {
    //             const scrollAmount = 320;
    //             if (this.scrollPosition[type] < 0) {
    //                 this.scrollPosition[type] = Math.min(0, this.scrollPosition[type] + scrollAmount);
    //             }
    //         },
    //         scrollRight(type) {
    //             const scrollAmount = 320;
    //             const trips = type === 'current' ? this.currentTrips : this.oldTrips;
    //             const totalScrollWidth = trips.length * 320;
    //             const maxScroll = -(totalScrollWidth - this.containerWidth[type]);
                
    //             if (this.scrollPosition[type] > maxScroll) {
    //                 this.scrollPosition[type] = Math.max(maxScroll, this.scrollPosition[type] - scrollAmount);
    //             }
    //         },
    //         updateContainerWidths() {
    //             this.containerWidth.current = document.querySelector('.carousel-container').offsetWidth;
    //             this.containerWidth.old = document.querySelectorAll('.carousel-container')[1].offsetWidth;
    //         }
    //     },
    //     async mounted() {
    //         await this.initializeTrips();
    //         this.updateContainerWidths();
    //         window.addEventListener('resize', this.updateContainerWidths);
    //     },
    //     beforeUnmount() {
    //         window.removeEventListener('resize', this.updateContainerWidths);
    //     }
    // }).mount('#app');
    

// <!--------------------------------------------- IMAGE IS HARDCODED ---------------------------------------------------------------------->
// <!-- 
//     Vue.createApp({
//         data() {
//             return {
//                 currentTrips: [
//                     { id: 1, destination: 'Paris', image: 'countryPics/paris.jpg', flightInfo: 'Flight AA123, Departure: 10:00 AM' },
//                     { id: 2, destination: 'Rome', image: 'countryPics/Rome.jpg', flightInfo: 'Flight BA456, Departure: 8:00 AM' },
//                     { id: 3, destination: 'Tokyo', image: 'countryPics/tokyo.jpg', flightInfo: 'Flight JAL789, Departure: 3:00 PM' },
//                     { id: 4, destination: 'New York', image: 'countryPics/newyork.jpg', flightInfo: 'Flight UA123, Departure: 9:00 AM' },
//                     { id: 5, destination: 'Sydney', image: 'countryPics/sydney.jpg', flightInfo: 'Flight QF123, Departure: 7:00 PM' }
//                 ],
//                 oldTrips: [
//                     { id: 6, destination: 'London', image: 'countryPics/london.jpg', date: '2023-05-10', flightNumber: 'BA789' },
//                     { id: 7, destination: 'Barcelona', image: 'countryPics/barcelona.jpg', date: '2023-04-20', flightNumber: 'IB456' },
//                     { id: 8, destination: 'Dubai', image: 'countryPics/dubai.jpg', date: '2023-03-15', flightNumber: 'EK123' },
//                     { id: 9, destination: 'Istanbul', image: 'countryPics/istanbul.jpg', date: '2023-02-10', flightNumber: 'TK789' },
//                     { id: 10, destination: 'Singapore', image: 'countryPics/singapore.jpg', date: '2023-01-05', flightNumber: 'SQ456' }
//                 ],
//                 scrollPosition: { current: 0, old: 0 },
//                 containerWidth: { current: 0, old: 0 }
//             };
//         },
//         methods: {
//             scrollLeft(type) {
//                 const scrollAmount = 320;
//                 if (this.scrollPosition[type] < 0) {
//                     this.scrollPosition[type] = Math.min(0, this.scrollPosition[type] + scrollAmount);
//                 }
//             },
//             scrollRight(type) {
//                 const scrollAmount = 320;
//                 const trips = type === 'current' ? this.currentTrips : this.oldTrips;
//                 const totalScrollWidth = trips.length * scrollAmount;
//                 const maxScroll = -(totalScrollWidth - this.containerWidth[type] + 50);

//                 if (this.scrollPosition[type] > maxScroll) {
//                     this.scrollPosition[type] = Math.max(maxScroll, this.scrollPosition[type] - scrollAmount);
//                 }
//             },
//             updateContainerWidths() {
//                 this.containerWidth.current = document.querySelector('.carousel-container').offsetWidth;
//                 this.containerWidth.old = document.querySelectorAll('.carousel-container')[1].offsetWidth;
//             }
//         },
//         mounted() {
//             this.updateContainerWidths();
//             window.addEventListener('resize', this.updateContainerWidths);
//         },
//         beforeUnmount() {
//             window.removeEventListener('resize', this.updateContainerWidths);
//         }
//     }).mount('#app');
