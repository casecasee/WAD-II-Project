import { add_attraction, get_trip_info } from "./functions.js";
import { touristAttractionsByRegion } from "./allAttractions.js"

const app = Vue.createApp({ 
    data() { 
        return { 
              all : [], // list of nearby attractions gotten using google place api
              display_it: false,
              selected_a: '', 
              imgurl: '', 
              dates: {}
        };
    }, // data
    computed: { 
        country() { // for us to display header and to pass in to google place api
            const urlParams = new URLSearchParams(window.location.search);
            const selectedCountry = urlParams.get('country');
            return selectedCountry;
        },

        tripID() {
            const id = localStorage.getItem('tripID');
            console.log(id);
            return id;
            // return 'ZI1IlYYOwUncoQZ2OztJ'
        },
         
        attract_date() {
            const date  = localStorage.getItem('attract_date') || '';
            return date
        }

    }, // computed

    methods: {
        popup(imgurl, a_name) {
            this.display_it = true;
            this.selected_a = a_name;
            this.imgurl = imgurl;
        }, 
        close() {
            this.display_it = false;
        }, 
        async addattract(a_name, date, cost, time) {
            await add_attraction(this.tripID, a_name, date, cost, time);
            // this.close();
            // alert('attraction successfully added');
            let response = await Swal.fire({
                                title: 'Attraction successfully added!',
                                // text: ,
                                icon: 'success',
                                showConfirmButton: true,
                                // confirmButtonColor: '#d33',
                                // showCancelButton: true,
                                // cancelButtonColor: '#d33',
                                // cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Return to dashboard'});
            if (response.isConfirmed) {
                window.location.href = `mytripinfo.html?country=${encodeURIComponent(this.country)}`}
        },

        async handle(results) {
            // var all = [];
            console.log(results);
            const url = 'https://api.wikimedia.org/core/v1/wikipedia/en/search/page';

            for (const res of results) {
                // console.log(res.name);
                const params = { q: res, limit: 1 };
                const response = await axios.get(url, { params: params } );
                const ouh = response.data.pages;
                
                if (ouh[0]) { // checks if the wiki page exists
                    // console.log(result)
                    const thumbimage = ouh[0].thumbnail?.url; // Optional chaining for handling missing thumbnails
                    const description = ouh[0].description || "No description available";
                    // TODO check if wiki page consists of coords DOESNT WORK ISTG!!!!!!
                    
                    if (thumbimage) {
                        var to_add = {};
                        const image = thumbimage.replace('/thumb', '').replace(/\/\d+px-.+$/, ''); // get big image
                        to_add.name = res;
                        to_add.imgurl = image;
                        to_add.desc = description;
                        this.all.push(to_add);
                    }
                }
            }
        }, 

        getDateRange(startDate, endDate) {
            this.dates = {}; // Initialize or clear `this.dates`
            let currentDate = new Date(startDate);
    
            while (currentDate <= new Date(endDate)) {
                // Format key as "DD-MM"
                const key = currentDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit'
                }).replace(/\//g, '-');
    
                // Format value as "DD Month" (e.g., "29 November")
                const value = currentDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long'
                });
    
                // Assign key-value pair directly to `this.dates`
                this.dates[key] = value;
    
                // Move to the next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }, 

    async mounted() {  // in mounted because we need to use it after we have selected country

        const tripInfo = await get_trip_info(this.tripID);
        console.log(tripInfo);
        const startdate = tripInfo.startdate;
        const enddate = tripInfo.enddate; 
        this.getDateRange(startdate, enddate); 

        this.handle(touristAttractionsByRegion[this.country]);




        // const info = await getCoordinates(this.country);
        // const lat = info.lat;
        // const long = info.long;

        // var loc = new google.maps.LatLng(lat, long);
        // const service = new google.maps.places.PlacesService(document.createElement('div'));

        // const request = {
        //     location: loc,
        //     radius: '5000',
        //     type: ['tourist_attraction'], 
        // };

        // service.nearbySearch(request, this.handle); // set list of attractions
    }
});

//loop through attractions and for each attraction render this component
app.component('country-images', { 
    props: [ 'a_name', 'imgurl', 'desc' ],

    template: `
        <div class='card' v-if=imgurl @click="$emit('popup', this.imgurl)">
            <img :src=imgurl></img>
            <div class='caption'> 
                {{ a_name }} 
                <div class='description'> {{ desc }} </div>
            </div>
        </div>
    `
    });

    app.component('pop-up', { 
        props: [ 'a_name', 'display_it', 'bg_img', 'adates', 'attract_date' ],

        data() {
            return {
                date: '',
                cost: null,
                time: ''
            };
        },

        mounted() {
            if (this.attract_date) {
                const date = new Date(this.attract_date);
                this.date = date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit'
                }).replace(/\//g, '-');
            }

        },

        methods: {
            addAttraction() {
                // Emit the form data to the parent
                this.$emit('add', this.a_name, this.date, this.cost, this.time);
            }
        },

        computed: {
            // Format date for display as "DD Month"
            formattedDate() {
                return this.adates[this.date] || ''; // Display formatted date or an empty string if not selected
            }, 
            
        },
        
        template: `
            <div v-if="display_it" id='pop'>
                <div id='content'>

                    <img :src=bg_img id='bg_img'>

                    <h1 id='attraction_title'>{{ a_name }}</h1>
                    
                    <div id="cancel" @click="$emit('close')">&times;</div>

                    <div class='container-fluid '>
                        <div class='row pt-3'>
                            <div class='col'>

                                <div class="form-group">
                                    <label for="dateSelect">Date:</label>
                                    <div class="row">
                                        <div class="col">

                                            <input type="text" v-model="formattedDate" id="selectedDate" class="form-control bg-white" readonly>
                                            <select v-model="date" id="dateSelect" size='5' name="dateSelect" class="form-control" required>
                                                <option v-for="(formattedDate, dateKey) in adates" :key="dateKey" :value="dateKey">
                                                    {{formattedDate}}
                                                </option>
                                            </select>

                                            
                                        </div>
                                    </div>
                                </div>

                                
                            </div> <!-- col -->
                
                        </div> <!-- row -->

                        <div class='row'>
                            <div class='col'>


                                <div class="form-group">
                                    <div class="row">
                                        <div class="col">
                                            <label for="dateSelect">Time:</label>
                                            <input v-model='time' type="time" id="time" name="time" class='form-control'>
                                            
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div class='row'>

                            <div class='col'>


                                <div class="form-group">
                                    <label for="cost">Cost:</label>
                                    <div class="row">
                                        <div class="col-md">
                                            <input v-model="cost" type="number" id="cost" name="cost" class="form-control" placeholder="Cost" required>
                                        </div>
                                    </div>
                                </div>
                                
                            </div> 
                            
                        </div>

                        <div class='row'>
                            <div class='col text-center'>
                                <button class='btn btn-primary' id='add_attraction_btn' @click="addAttraction()">Add Attraction!</button>
                            </div>
                        </div>


                    </div> <!-- container -->
                            
                        </div>
                        
                    </div>
        `
    });
    // component must be declared before app.mount(...)
    
    const vm = app.mount('#app'); 

async function getCoordinates(name) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(name)}&key=AIzaSyBqbv7BqX1_7CcpPT80locaYJ3fnsdC-Sg`;

    const response = await fetch(url);
    const data = await response.json();
    const location = data.results[0].geometry.location;
    
    return {
        lat: location.lat,
        long: location.lng
    };
}