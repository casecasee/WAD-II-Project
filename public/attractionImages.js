import { add_attraction } from "./functions.js";

const app = Vue.createApp({ 
    data() { 
        return { 
              all : [], // list of nearby attractions gotten using google place api
              display_it: false,
              selected_a: '', 
              imgurl: '', 
        };
    }, // data
    computed: { 
        country() { // for us to display header and to pass in to google place api
            const selectedCountry = localStorage.getItem('selectedCountry');
            return selectedCountry;
        } ,

        tripID() {
            // const id = localStorage.getItem('tripID');
            // return id;
            return 'ZI1IlYYOwUncoQZ2OztJ'
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
        async addattract(a_name, date, cost) {
            console.log(date);
            console.log(cost);
            await add_attraction(this.tripID, a_name, date, cost);
            this.close();
            alert('attraction successfully added');
        }
    }, 

    async mounted() {  // in mounted because we need to use it after we have selected country

        const info = await getCoordinates(this.country);
        const lat = info.lat;
        const long = info.long;

        var loc = new google.maps.LatLng(lat, long);
        const service = new google.maps.places.PlacesService(document.createElement('div'));

        const request = {
            location: loc,
            radius: '5000',
            type: ['tourist_attraction'], 
        };

        service.nearbySearch(request, (results, status) => this.all = results); // set list of attractions
    }
});

//loop through attractions and for each attraction render this component
app.component('country-images', { 
    props: [ 'a_name' ],

    data() {
        return {
            imgurl : '',
            desc : ''
        }
    }, // data

    async mounted() {
        const url = 'https://api.wikimedia.org/core/v1/wikipedia/en/search/page';
        const params = { q: this.a_name, limit: 1 };
        const response = await axios.get(url, { params: params } );
        const result = response.data.pages;

        // this.imgurl = 'countryPics/paris.jpg';
        // this.desc = 'placeholder description';

        if (result[0]) { // checks if the wiki page exists
            const thumbimage = result[0].thumbnail?.url; // Optional chaining for handling missing thumbnails
            const description = result[0].description || "No description available";
            // TODO check if wiki page consists of coords DOESNT WORK ISTG!!!!!!
    
            if (thumbimage) {
                const image = thumbimage.replace('/thumb', '').replace(/\/\d+px-.+$/, ''); // get big image
                this.imgurl = image;
                this.desc = description         
            }
        }
    },
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

    // TODO make the form better bruh
    // TODO limit date selection to trip dates
    app.component('pop-up', { 
        props: [ 'a_name', 'display_it', 'bg_img' ],

        data() {
            return {
                date: '',
                cost: null
            };
        },

        methods: {
            addAttraction() {
                // Emit the form data to the parent
                this.$emit('add', this.a_name, this.date, this.cost);
            }
        },
        
        template: `
            <div v-if="display_it" id='pop'>

                <div id='content'>

                    <img :src=bg_img id='bg_img'>

                    <h1 id='attraction_title'>{{ a_name }}</h1>
                    
                    <div id="cancel" @click="$emit('close')">&times;</div>

                    <div id='a_form'>

                        <div class='form-container'>
                            <form id="attractionForm">

                                <div class="form-group">
                                    <label for="dateSelect">Date:</label>
                                    <div class="row">
                                        <div class="col">
                                            <input v-model="date" type="date" id="startDate" name="startDate" class="form-control" required>
                                        </div>
                                    </div>
                                </div>
                        
                                <div class="form-group">
                                    <label for="cost">Cost:</label>
                                    <div class="row">
                                        <div class="col-md">
                                            <input v-model="cost" type="number" id="cost" name="cost" class="form-control" placeholder="Cost" required>
                                        </div>
                                    </div>
                                </div>

                            </form>
                            
                        </div>
                        
                    </div>
                    <button class='btn btn-primary' id='add_attraction_btn' @click="addAttraction()">Add Attraction!</button>

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