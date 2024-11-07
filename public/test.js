import { UID, get_info, add_hotel, add_flight, add_attraction } from './functions';

const app = Vue.createApp({ 
    data() { 
        return { 
              UID : null,
              all : ''
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
            await add_hotel('1tC1LMfByBiTejsEowA8', 'MBS', '2024-11-10', '2024-09-04', 1000);
        }, 
        async add_f() {
            await add_flight('1tC1LMfByBiTejsEowA8', 'taiwan', 'russia', '2024-01-04', 'SQ123', '37C', 300);
        },
        async add_a() {
            await add_attraction('1tC1LMfByBiTejsEowA8', 'Singapore Zoo', '2024-03-12', 100)
        }

    } // methods
});
const vm = app.mount('#app'); 