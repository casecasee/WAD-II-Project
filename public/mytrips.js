// <!------------------------------------------------------ USES API TO GET IMAGE ------------------------------------------------------------------->

    Vue.createApp({
        data() {
            return {
                currentTrips: [],
                oldTrips: [],
                destinations: [
                    { destination: 'Paris', flightInfo: 'Flight AA123, Departure: 10:00 AM', type: 'current' },
                    { destination: 'Rome', flightInfo: 'Flight BA456, Departure: 8:00 AM', type: 'current' },
                    { destination: 'Tokyo', flightInfo: 'Flight JAL789, Departure: 3:00 PM', type: 'current' },
                    { destination: 'USA', flightInfo: 'Flight UA123, Departure: 9:00 AM', type: 'current' },
                    { destination: 'Sydney', flightInfo: 'Flight QF123, Departure: 7:00 PM', type: 'current' },
                    { destination: 'London', date: '2023-05-10', flightNumber: 'BA789', type: 'old' },
                    { destination: 'Barcelona', date: '2023-04-20', flightNumber: 'IB456', type: 'old' },
                    { destination: 'Dubai', date: '2023-03-15', flightNumber: 'EK123', type: 'old' },
                    { destination: 'Istanbul', date: '2023-02-10', flightNumber: 'TK789', type: 'old' },
                    { destination: 'Singapore', date: '2023-01-05', flightNumber: 'SQ456', type: 'old' }
                ],
                scrollPosition: { current: 0, old: 0 },
                containerWidth: { current: 0, old: 0 }
            };
        },
        methods: {
            async fetchCountryImage(destination) {
                const url = 'https://api.wikimedia.org/core/v1/wikipedia/en/search/page';
                const params = { q: destination, limit: 1 };
        
                try {
                    const response = await axios.get(url, { params });
                    const page = response.data.pages[0];
                    if (page && page.thumbnail) {
                        return page.thumbnail.url.replace('/thumb', '').replace(/\/\d+px-.+$/, ''); // Get full-size image
                    }
                } catch (error) {
                    console.error(`Error fetching image for ${destination}:`, error);
                }
                return 'default-image.jpg';
            },
            async initializeTrips() {
                for (let trip of this.destinations) {
                    const image = await this.fetchCountryImage(trip.destination);
                    const tripData = {
                        id: Date.now() + Math.random(),
                        destination: trip.destination,
                        image: image,
                        ...(trip.type === 'current' ? { flightInfo: trip.flightInfo } : { date: trip.date, flightNumber: trip.flightNumber })
                    };
                    if (trip.type === 'current') {
                        this.currentTrips.push(tripData);
                    } else {
                        this.oldTrips.push(tripData);
                    }
                }
            },
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
            updateContainerWidths() {
                this.containerWidth.current = document.querySelector('.carousel-container').offsetWidth;
                this.containerWidth.old = document.querySelectorAll('.carousel-container')[1].offsetWidth;
            }
        },
        async mounted() {
            await this.initializeTrips();
            this.updateContainerWidths();
            window.addEventListener('resize', this.updateContainerWidths);
        },
        beforeUnmount() {
            window.removeEventListener('resize', this.updateContainerWidths);
        }
    }).mount('#app');
    

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
