const app = Vue.createApp({ 
    data() { 
        return { 
              all : [], // list of nearby attractions gotten using google place api
              display_it: false,
              selected_a: ''
        };
    }, // data
    computed: { 
        country() { // for use to display header and to pass in to google place api
            const selectedCountry = localStorage.getItem('selectedCountry');
            return selectedCountry;
        } 
    }, // computed

    methods: {
        popup(a_name) {
            console.log(a_name)
            this.display_it = true;
            this.selected_a = a_name;
            // change display_it to true and pass it to the component
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
            // [ ] check if wiki page consists of coords

    
            if (thumbimage) {
                const image = thumbimage.replace('/thumb', '').replace(/\/\d+px-.+$/, '');
                this.imgurl = image;
                this.desc = description         
            }
        }
    },
    
    template: `
        <div class='card' v-if=imgurl @click=$emit('popup')>
            <img :src=imgurl></img>
            <div class='caption'> 
                {{ a_name }} 
                <div class='description'> {{ desc }} </div>
            </div>
        </div>
    `
    });
    // component must be declared before app.mount(...)

    // [ ] to add trip to database idk if component is gud idea
    //
    app.component('pop-up', { 
        props: [ 'a_name', 'display_it' ],
        
        data() {
            return {
            }
        }, // data
        
        methods: {
            methodName() {
                
            }
        }, // methods
        
        template: `
            <div v-if="display_it" class='pop'>
                <div class='content'>
                    <p>{{ a_name }}</p>
                    <p @click=$emit('close')>&times;</p>
                </div>


            </div>
        
        `
    });
    // component must be declared before app.mount(...)
    
    const vm = app.mount('#app'); 

// when created we have to get all the attractions and all the info

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

// ------------------------------------- without description ----------------------------------------------------------------------
// async function getCoordinates(name) {
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(name)}&key=AIzaSyBqbv7BqX1_7CcpPT80locaYJ3fnsdC-Sg`;

//     const response = await fetch(url);
//     const data = await response.json();

//     const location = data.results[0].geometry.location;
//     return {
//         lat: location.lat,
//         long: location.lng
//     };
// }

// async function getImgs() {
//     const selectedCountry = localStorage.getItem('selectedCountry');
//     document.getElementById('countryName').innerText = `Attractions in ${selectedCountry}`;

//     const info = await getCoordinates(selectedCountry);
//     const lat = info.lat;
//     const long = info.long;

//     var loc = new google.maps.LatLng(lat, long);
//     const service = new google.maps.places.PlacesService(document.createElement('div'));

//     const request = {
//         location: loc,
//         radius: '100000',
//         type: ['tourist_attraction', 'museum', 'stadium', 'landmark', 'natural_feature'], 
//     };

//     service.nearbySearch(request, (results, status) => handleResponse(results, status, selectedCountry));
// }

// async function handleResponse(results, status, country) {
//     const destination = document.getElementById('imgs');
//     destination.innerHTML = '';
//     const displayedNames = new Set(); 

//     if (status === google.maps.places.PlacesServiceStatus.OK) {
//         results.forEach(attraction => {
//             const name = attraction.name;
//             console.log(name);

//             if (displayedNames.has(name)) {
//                 return; 
//             }
//             displayedNames.add(name); 

// // ---------------------------------------- using wikipedia api --------------------------------------------

//     const url = 'https://api.wikimedia.org/core/v1/wikipedia/en/search/page';

//     axios.get(url, { params: {q : name, limit: 1} })
//     .then(response => {

//         const result = response.data.pages;
//         if (result[0]) { // checks if the wiki page exists 
//             const thumbimage = result[0].thumbnail.url; // TODO case where url is null
//             image = thumbimage.replace('/thumb', '').replace(/\/\d+px-.+$/, ''); 

//             const card = document.createElement('div');
//             card.className = 'card'; 

//             const imgElement = document.createElement('img');
//             imgElement.setAttribute('src', image);

//             const caption = document.createElement('div');
//             caption.className = 'caption'; 
//             caption.innerText = name; 
            
//             card.appendChild(imgElement);
//             card.appendChild(caption);

//             destination.appendChild(card);
//         }

//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// })};
// }
// ---------------------------------------- end -----------------------------------------------------------------------

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

// ---------------------------------------- using gmaps api -----------------------------------------------------------
                
    //         const url = `https://www.googleapis.com/customsearch/v1?key=AIzaSyAnMQUrtx33-PNEd45HT4v5fiPI3I4qyVY&cx=e0d39b341ae854a03&q=${name}`;
    //         axios.get(url)
    //             .then(response => {
    //                 if (response.data.items && response.data.items.length > 0) {
    //                     const result = response.data.items[0];
    //                     const image = result.pagemap.cse_image[0].src;

    //                     const card = document.createElement('div');
    //                     card.className = 'card'; 

    //                     const imgElement = document.createElement('img');
    //                     imgElement.setAttribute('src', image);

    //                     const caption = document.createElement('div');
    //                     caption.className = 'caption'; 
    //                     caption.innerText = name; 
                        
    //                     card.appendChild(imgElement);
    //                     card.appendChild(caption);

    //                     destination.appendChild(card);
    //                 }
    //             })
    //             .catch(error => {
    //                 console.log(error.message);
    //             });
    //     });
    // } else {
    //     console.error('PlacesService search failed due to:', status);
    // }
// ---------------------------------------- end -----------------------------------------------------------------------