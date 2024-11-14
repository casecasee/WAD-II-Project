import { getFirestore, 
         collection, 
         addDoc,
         setDoc,
         getDoc,
         getDocs,
         doc, 
         updateDoc, 
         deleteDoc, 
         Timestamp  } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { firebaseApp } from "./stuff.js";
const db = getFirestore(firebaseApp);

//------------------------------- get UID of logged in user, else direct to signin page -------------------------------------------
export const UID = function UID() {
    const auth = getAuth(firebaseApp);
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log(user.uid);
                resolve(user.uid); // Resolve the promise with the UID
            } else {
                window.location.href = 'index.html'; // Redirect if no user
                reject("No user signed in");
            }
        })
    })
}
//-------------------------------------------------------- END --------------------------------------------------------------------


function getFirebaseTimestamp(dateString, timeString) {
    // Split the date and time parts
    const [day, month] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);

    // Get the current year 
    const year = new Date().getFullYear();

    // Create a JavaScript Date object
    const date = new Date(year, month - 1, day, hours, minutes);

    // Convert to Firebase Timestamp
    return Timestamp.fromDate(date);
}



//-------------------------------------- add user to DB when they sign up -------------------------------------------------------
export const add_info_users = async function addUserToTable(UID, email, name) {
    const docref = doc(db, 'users', UID);
    
    const data = {
        'email' : email, 
        'name' : name,
        'trips': []
    };

    try {
        await setDoc(docref, data);
    }

    catch (error) {
        throw error;
    };
}
//------------------------------------------------------------ END ---------------------------------------------------------------


//------------------------- add trip to DB when new trip (ALWAYS CALLED WITH update_trips_user) ---------------------------------
export const add_info_trips = async function add_trip(destination, start, end, budget) {
    const table = collection(db, 'trips');

    const data = {
        'destination' : destination, 
        'startdate' : start,
        'enddate' : end, 
        'budget' : budget,
        'flights' : [], 
        'hotels' : [], 
        'attractions': []
    };
    
    try {
        const doc_ref = await addDoc(table, data);
        console.log('trip added');
        return doc_ref.id;
    }
    
    catch (error) {
        const errCode = error.code;
        const errMsg = error.message;
        console.log(errCode + errMsg);
    };
}
// -------------------------------------------------------- END ------------------------------------------------------------------

//----------------------------------------- add newly created trip to trips DB ---------------------------------------------------
export const update_trips_users = async function update_users(UID, tripID) {
    const docref = doc(db, "users", UID);

    var trips = await get_trips_users(docref);
    trips.push(tripID);
    const update = {'trips' : trips}
    
    await updateDoc(docref, update);
    console.log('updated in user');
}

async function get_trips_users(docref) {
    try {
        const doc_snap = await getDoc(docref);
        const trips = doc_snap.data().trips;
        return trips
    }
    
    catch(error) {
        console.log(error);
    }
}
// -------------------------------------------------------- END -------------------------------------------------------------------

//----------------------------------------------------- get trips info for specific user -----------------------------------------
export const get_info = async function get_info_trips(UID) {
    let rt = [];
    const docref = doc(db, "users", UID);
    const doc_snap = await getDoc(docref);
    const trips = doc_snap.data().trips;
    
    for (let trip of trips) {
        const info = await trip_info(trip);
        info.tripID = trip;
        rt.push(info);
    }
    return rt
}

async function trip_info(docID) {
    const doc_ref = doc(db, "trips", docID);
    const doc_snap = await getDoc(doc_ref);
    return doc_snap.data()
}
// -------------------------------------------------------- END ------------------------------------------------------------------

//------------------------------------------------------ add hotel to hotel arr ---------------------------------------------------
export const get_trip_info = async function get_trip_info(tripID) {
    return trip_info(tripID);
}
// -------------------------------------------------------- END ------------------------------------------------------------------

//------------------------------------------------------ add hotel to hotel arr ---------------------------------------------------
export const add_hotel = async function add_hotel(tripID, hotel_name, checkin, checkout, cost) {
    const doc_ref = doc(db, "trips", tripID);

    const new_data = {
        'h_name' : hotel_name, 
        'checkin' : checkin,
        'checkout' : checkout,
        'cost' : cost
    };
    const doc_snap =  await getDoc(doc_ref);
    const h_list = doc_snap.data().hotels;
    h_list.push(new_data);

    await updateDoc(doc_ref, {'hotels' : h_list});
}
// --------------------------------------------------------- END ------------------------------------------------------------------

//------------------------------------------------- add attraction to attraction arr ----------------------------------------------
export const add_attraction = async function add_attraction(tripID, a_name, date, cost, time) {
    // console.log(tripID);
    const doc_ref = doc(db, "trips", tripID);
    // console.log(date);
    // console.log(time);
    const ts = getFirebaseTimestamp(date, time);


    const new_data = {
        'a_name' : a_name, 
        'date' : ts, 
        'cost' : cost, 
    };
    const doc_snap =  await getDoc(doc_ref);
    const a_list = doc_snap.data().attractions;
    a_list.push(new_data);
    console.log(a_list);

    await updateDoc(doc_ref, {'attractions' : a_list});
}
// --------------------------------------------------------- END ------------------------------------------------------------------

//------------------------------------------------- add flight to flight arr --------------------------------------------------------
// export const add_flight = async function add_flight(tripID, fromCity, toCity, departureDate, departureTime, flightNumber, seatNumber, cost) {
//     const dept = convert_to_timestamp(departureDate);
//     const doc_ref = doc(db, "trips", tripID);
    
//     const new_data = {
//         'arrival_city' : toCity,
//         'departure_city' : fromCity,
//         'departure_date' : dept, 
//         'flight_no' : flightNumber,
//         'seat_no' : seatNumber || null,
//         'cost' : cost
//     };
//     const doc_snap = await getDoc(doc_ref);
//     const f_list = doc_snap.data().flights;
//     f_list.push(new_data);

//     await updateDoc(doc_ref, {'flights' : f_list});
// }

export const add_flights_to_trip = async function add_flights_to_trip(tripID, flights) {
    // console.log(flights);
    const docRef = doc(db, "trips", tripID);

    const newFlights = flights.map(flight => ({
        arrival_city: flight.arrival_city,
        departure_city: flight.departure_city,
        departure_date: flight.departure_date,
        departure_time: flight.departure_time, 
        flight_no: flight.flight_no,
        seat_no: flight.seat_no || null,
        flight_cost: flight.flight_cost || 0
    }));
    console.log(newFlights);

    // Save flights array to Firebase under the tripID
    await updateDoc(docRef, { 'flights' : newFlights });
};

export const delete_trip = async function delete_trip(tripID, UID) {
    const docRef_t = doc(db, "trips", tripID);
    const docRef_u = doc(db, "users", UID);

    try {
        await deleteDoc(docRef_t);
        const doc_snap = await getDoc(docRef_u);
        const trips = doc_snap.data().trips;
        console.log(trips);
        const index = trips.indexOf(tripID);
        console.log(index);
        trips.splice(index, 1);
        await updateDoc(docRef_u, {'trips' : trips});

        // alert('trip deleted successfully');
    }
    catch(error) {
        const errCode = error.code;
        const errMsg = error.message;
        console.log(errCode + errMsg);
    }

}

export const get_all_trips = async function get_all() {
    const collectionRef = collection(db, "trips");
    var rt = [];
    try {
        // const querySnapshot = await getDocs(collectionRef); // Retrieve all documents
        // querySnapshot.forEach(element => {
        //     rt.push(element.data());
        //     console.log(element.data());
        const querySnapshot = await getDocs(collectionRef);
        querySnapshot.forEach(doc => {
            // Include the document ID in the trip data
            rt.push({
                tripID: doc.id,  // Add the document ID
                ...doc.data()
            });
            console.log("Trip data:", {tripID: doc.id, ...doc.data()});
        });
        return rt;
    } catch (error) {
        console.error("Error getting documents:", error);
        return [];
    }
}

// getting trips for community page
export const trips_for_community = async function get_trips_for_community(UID) {
    console.log(UID);
    const docref_u = doc(db, "users", UID);
    const doc_snap_u = await getDoc(docref_u);
    const this_users_trips = doc_snap_u.data().trips;
    console.log(this_users_trips);

    const collectionRef = collection(db, "trips");
    var rt = [];
    try {
        const querySnapshot = await getDocs(collectionRef);
        querySnapshot.forEach(doc => {
            console.log(doc.data());
            if (this_users_trips.indexOf(doc.id) == -1) { // check if the trip is this users'
                // console.log('check');
                if (isDateInPast(doc.data().enddate)) {
                    // console.log('this check');

                    rt.push({
                        tripID: doc.id,  // Add the document ID
                        ...doc.data()
                    });
                    console.log("Trip data:", {tripID: doc.id, ...doc.data()});
                };

                }

            })

        return rt;
    } catch (error) {
        console.error("Error getting documents:", error);
        return [];
    }

}



function isDateInPast(dateString) {
    const inputDate = new Date(dateString);  // Convert the string to a Date object
    const today = new Date();                // Get today's date

    // Set the hours of today to 0:00:00 to ignore the time part
    today.setHours(0, 0, 0, 0);

    return inputDate < today;
};