const app = Vue.createApp({ 
    data() { 
        return { 
              all : [], // list of nearby attractions gotten using google place api
              display_it: false,
              selected_a: '', 
              imgurl: ''
        };
    }, // data
    computed: { 
        country() { // for us to display header and to pass in to google place api
            const selectedCountry = localStorage.getItem('selectedCountry');
            return selectedCountry;
        } 
    }, // computed

    methods: {
        popup(imgurl, a_name) {
            console.log(a_name)
            this.display_it = true;
            this.selected_a = a_name;
            console.log(imgurl);
            this.imgurl = imgurl;
        }, 
        close() {
            this.display_it = false;
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
        response = await axios.get(url, { params: params } );
        const result = response.data.pages;

        if (result[0]) { // checks if the wiki page exists
            const thumbimage = result[0].thumbnail?.url; // Optional chaining for handling missing thumbnails
            const description = result[0].description || "No description available";
            // TODO check if wiki page consists of coords

    
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
    app.component('pop-up', { 
        props: [ 'a_name', 'display_it', 'bg_img' ],
        
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
                                            <input type="date" id="startDate" name="startDate" class="form-control" required>
                                        </div>
                                    </div>
                                </div>
                        
                                <div class="form-group">
                                    <label for="cost">Cost:</label>
                                    <div class="row">
                                        <div class="col-md">
                                            <input type="number" id="cost" name="cost" class="form-control" placeholder="Cost" required>
                                        </div>
                                    </div>
                                </div>

                            </form>
                            
                        </div>
                        
                    </div>

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

// ---------------------------------------- using unsplash api --------------------------------------------

            // const url = `https://api.unsplash.com/search/photos?query=${country}%20${name}&client_id=v8ob4JtC_zfA0-jXKJUC2UEjpBQEgb4tAFDSbIaQa9s`;
            // axios.get(url)
            //     .then(response => {
            //         // console.log(response.data);
            //         data = response.data;
            //         if (data.results.length > 0) {
            //             // num = getRandomInt(0, 10);
            //             const firstImageUrl = data.results[0].urls.full;
            //             console.log('First image URL:', firstImageUrl);
            //             // console.log()
            //             const card = document.createElement('div');
            //             card.className = 'card'; 

            //             const imgElement = document.createElement('img');
            //             imgElement.setAttribute('src', firstImageUrl);

            //             const caption = document.createElement('div');
            //             caption.className = 'caption'; 
            //             caption.innerText = name; 

            //             card.appendChild(imgElement);
            //             card.appendChild(caption);

            //             destination.appendChild(card);
            //         }
            //         else {
            //             console.log('No images found for this query.');
            //         }
            //     })
            //     .catch( error => {
            //         console.log(error.message);
            //     });

            // })};
                
// ---------------------------------------- end -----------------------------------------------------------------------