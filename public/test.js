import { UID, get_info, add_flights_to_trip, add_attraction, delete_trip, get_all_trips, add_hotel } from './functions';

const app = Vue.createApp({ 
    data() { 
        return { 
              UID : null,
              all : '', 
              everything : ''
        };
    }, // data
    async mounted() { 
        this.UID = await UID();
    },
    methods: {
        async disp() {
            this.all = await get_info(this.UID);   
        },
        async add_h() { 
            await add_hotel('z5NIL74rFcYBtY4eSqR8', 'MBS', '2024-11-10', '2024-09-04', 1000);
        }, 
        async add_f() {
            await add_flights_to_trip('z5NIL74rFcYBtY4eSqR8', [{
                fromCity: 'singapore',
                toCity: 'japan',
                departureDate: '2024-11-11',
                departureTime: '14:20',
                flightNumber: 'sq123',
                seatNumber: '12a',
                flightCost: 300
            }]);
        },
        async add_a() {
            await add_attraction('z5NIL74rFcYBtY4eSqR8', 'Singapore Zoo', '2024-03-12', 100)
        }, 
        async del() {
            await delete_trip("gsASdlvsa3GKGla7NWzZ", 'H3TnHlYTMVMAraHOOqkXkfrusFd2')
            // change the 2 values to test (go firebase console find)
        }, 
        async get() {
            this.everything = await get_all_trips();
        }

    } // methods
});
const vm = app.mount('#app'); 