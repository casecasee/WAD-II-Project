import { UID, add_info_trips, update_trips_users } from "./functions.js";

const app = Vue.createApp({
            data() {
                return {
                    photos: [
                        { 
                            id: 1, 
                            src: "https://images.unsplash.com/photo-1543783207-ec64e4d95325", 
                            alt: "Barcelona Adventure", 
                            desc: "Amazing 5-day trip through Barcelona!",
                            duration: 5,
                            destination: "Barcelona, Spain",
                            cost: 2500,
                            startDate: "2024-06-01",
                            endDate: "2024-06-05",
                            itinerary: [
                                ["Check-in to hotel", "Visit La Sagrada Familia", "Evening tapas tour"],
                                ["Park Güell tour", "Las Ramblas walking tour", "Flamenco show"],
                                ["Day trip to Montserrat", "Wine tasting", "Beach sunset"],
                                ["Gothic Quarter exploration", "Cooking class", "Dinner at local restaurant"],
                                ["Shopping at local markets", "Beach day", "Farewell dinner"]
                            ]
                        },
                        { 
                            id: 2, 
                            src: "https://www.planetware.com/wpimages/2020/02/france-in-pictures-beautiful-places-to-photograph-eiffel-tower.jpg", 
                            alt: "Paris Escapade", 
                            desc: "Romantic week in Paris",
                            duration: 4,
                            destination: "Paris, France",
                            cost: 3000,
                            startDate: "2024-06-06",
                            endDate: "2024-06-09",
                            itinerary: [
                                ["Arrive in Paris", "Eiffel Tower visit", "Seine River dinner cruise"],
                                ["Louvre Museum", "Notre-Dame Cathedral", "Champs-Élysées shopping"],
                                ["Palace of Versailles", "French pastry class", "Moulin Rouge show"],
                                ["Montmartre walk", "Sacré-Cœur", "Fine dining experience"]
                            ]
                        },
                        { 
                            id: 3, 
                            src: "https://media.istockphoto.com/id/1380534040/photo/beautiful-view-of-amalfi-on-the-mediterranean-coast-with-lemons-in-the-foreground-italy.jpg?s=612x612&w=0&k=20&c=4UQak9WJkyvN8aEgkLEwjnV5EW2RiGfC_GZNeQaVJeo=", 
                            alt: "Italian Dream", 
                            desc: "Perfect Italian getaway!",
                            duration: 6,
                            destination: "Amalfi Coast, Italy",
                            cost: 3500,
                            startDate: "2024-06-10",
                            endDate: "2024-06-15",
                            itinerary: [
                                ["Arrive in Naples", "Transfer to Positano", "Welcome dinner"],
                                ["Positano beach day", "Cooking class", "Sunset aperitivo"],
                                ["Capri day trip", "Blue Grotto tour", "Marina Grande dinner"],
                                ["Ravello visit", "Villa Rufolo", "Classical music concert"],
                                ["Amalfi town tour", "Limoncello tasting", "Seafood dinner"],
                                ["Path of the Gods hike", "Beach relaxation", "Farewell feast"]
                            ]
                        },
                        { 
                            id: 4, 
                            src: "https://t3.ftcdn.net/jpg/02/65/23/70/360_F_265237090_Muthvb72m2POYFjyx7F5UCQLh9JdBtKN.jpg", 
                            alt: "Tokyo Explorer", 
                            desc: "Unforgettable Japan experience!",
                            duration: 5,
                            destination: "Tokyo, Japan",
                            cost: 4000,
                            startDate: "2024-06-16",
                            endDate: "2024-06-20",
                            itinerary: [
                                ["Arrive in Tokyo", "Shibuya crossing", "Ramen experience"],
                                ["Tsukiji market", "Senso-ji Temple", "Robot Restaurant"],
                                ["TeamLab Borderless", "Harajuku shopping", "Izakaya dinner"],
                                ["Mt. Fuji day trip", "Hot spring experience", "Traditional ryokan stay"],
                                ["Akihabara tour", "Sushi making class", "Farewell karaoke"]
                            ]
                        },
                        { 
                            id: 5, 
                            src: "https://images.unsplash.com/photo-1578637387939-43c525550085", 
                            alt: "Seoul Adventure", 
                            desc: "K-culture and beyond!",
                            duration: 5,
                            destination: "Seoul, South Korea",
                            cost: 2800,
                            startDate: "2024-06-21",
                            endDate: "2024-06-25",
                            itinerary: [
                                ["Arrive in Seoul", "Myeongdong shopping", "Korean BBQ dinner"],
                                ["Gyeongbokgung Palace", "Hanbok experience", "K-pop concert"],
                                ["DMZ tour", "Hongdae street food", "Noraebang night"],
                                ["Namsan Tower", "Cooking class", "Han River cruise"],
                                ["Temple stay experience", "Gangnam exploration", "Farewell dinner"]
                            ]
                        },
                        { 
                            id: 6, 
                            src: "https://images.unsplash.com/photo-1549893072-4bc678117f45", 
                            alt: "Vietnam Discovery", 
                            desc: "Cultural journey through Vietnam",
                            duration: 7,
                            destination: "Vietnam",
                            cost: 2200,
                            startDate: "2024-06-26",
                            endDate: "2024-07-02",
                            itinerary: [
                                ["Arrive in Hanoi", "Old Quarter walk", "Water puppet show"],
                                ["Ha Long Bay cruise", "Cave exploration", "Sunset dinner"],
                                ["Cooking class", "Temple visits", "Night market"],
                                ["Fly to Hoi An", "Ancient town tour", "Lantern making"],
                                ["My Son Sanctuary", "Beach relaxation", "Food tour"],
                                ["Mekong Delta", "Floating market", "Local homestay"],
                                ["Cu Chi tunnels", "Saigon tour", "Farewell dinner"]
                            ]
                        }
                    ],
                    selectedPhoto: null,
                    currentPage: 1,
                    photosPerPage: 8,
                    showAddPhotoModal: false,
                    newPhoto: { src: '', alt: '', desc: '' },
                    UID: null,
                    previewUrl: null,
                }
            },
            methods: {
                toggleConnect(travelerId) {
                    const traveler = this.travelers.find(t => t.id === travelerId);
                    if (traveler) {
                        traveler.connected = !traveler.connected;
                    }
                },
                openModal(photo) {
                    this.selectedPhoto = photo;
                    document.body.classList.add('no-scroll');
                },
                closeModal() {
                    this.selectedPhoto = null;
                    document.body.classList.remove('no-scroll');
                },
                changePage(page) {
                    if (page >= 1 && page <= this.totalPages) {
                        this.currentPage = page;
                    }
                },
                // add itinerary, different from adding the trip info from latest posts
                addItinerary() {
                    this.newPhoto = {
                        src: '',
                        alt: '',
                        desc: '',
                        destination: '',
                        duration: 1,
                        cost: 0,
                        startDate: '',
                        endDate: '',
                        itinerary: [[]]
                    };
                    this.showAddPhotoModal = true;
                },
                closeAddPhotoModal() {
                    this.showAddPhotoModal = false;
                    this.newPhoto = { 
                        src: '', 
                        alt: '', 
                        desc: '',
                        destination: '',
                        duration: 1,
                        cost: 0,
                        startDate: '',
                        endDate: '',
                        itinerary: [[]]
                    };
                    this.previewUrl = null;
                    URL.revokeObjectURL(this.previewUrl);
                    document.body.classList.remove('no-scroll');
                },
                getDayActivities(dayIndex) {
                    if (!this.newPhoto.itinerary[dayIndex]) {
                        this.$set(this.newPhoto.itinerary, dayIndex, []);
                    }
                    return this.newPhoto.itinerary[dayIndex];
                },
                addActivity(dayIndex) {
                    if (!this.newPhoto.itinerary[dayIndex]) {
                        this.newPhoto.itinerary[dayIndex] = [];
                    }
                    this.newPhoto.itinerary[dayIndex].push('');
                },
                removeActivity(dayIndex, activityIndex) {
                    this.newPhoto.itinerary[dayIndex].splice(activityIndex, 1);
                },
                handleFileUpload(event) {
                    const file = event.target.files[0];
                    if (file) {
                        this.previewUrl = URL.createObjectURL(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.newPhoto.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                },
                submitNewItinerary() {
                    const newId = this.photos.length + 1;
                    const newItinerary = {
                        id: newId,
                        src: this.newPhoto.src,
                        alt: this.newPhoto.alt,
                        desc: this.newPhoto.desc,
                        destination: this.newPhoto.destination,
                        duration: this.newPhoto.duration,
                        cost: this.newPhoto.cost,
                        itinerary: this.newPhoto.itinerary
                    };
                    
                    this.photos.push(newItinerary);
                    this.closeAddPhotoModal();
                    this.changePage(this.totalPages);
                },
                // up until here is all uploaded by the user
                async mounted() {
                    this.UID = await UID();
                },
                async addToMyTrips(photo) {
                    try {
                        // Get current user's UID
                        this.UID = await UID();
                        
                        if (!this.UID) {
                            throw new Error('User not logged in');
                        }

                        // First add the trip to trips collection
                        const tripID = await add_info_trips(
                            photo.destination, 
                            photo.startDate, 
                            photo.endDate, 
                            photo.cost
                        );

                        // Then update the user's trips array
                        await update_trips_users(this.UID, tripID);

                        // Store trip info in localStorage for mytrips.html
                        localStorage.setItem('selectedCountry', photo.destination);
                        
                        // Show success message
                        alert('Trip added to your itineraries successfully!');
                        
                        // Close the modal
                        this.closeModal();

                        // Redirect to mytrips.html
                        // somehow gets added to past trips instead of current trips
                        //BUT ITS DONE!!!!!!
                        window.location.href = 'mytrips.html';

                    } catch (error) {
                        console.error('Error adding trip:', error);
                        alert('Failed to add trip to your itineraries');
                    }
                },
                handleEscKey(event) {
                    if (event.key === 'Escape') {
                        if (this.selectedPhoto) {
                            this.closeModal();
                        }
                        if (this.showAddPhotoModal) {
                            this.closeAddPhotoModal();
                        }
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
                }
            },
            mounted() {
                document.addEventListener('keydown', this.handleEscKey);
            },
            beforeUnmount() {
                document.removeEventListener('keydown', this.handleEscKey);
            }
        }).mount('#app')