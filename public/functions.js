import { getFirestore, 
         collection, 
         addDoc,
         setDoc,
         getDoc,
         doc, 
         updateDoc, 
         Timestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

//-------------------------------------- convert YYYY-MM-DD to firestore timestamp -----------------------------------------------
// function convert_to_timestamp(date, time) {

//     const datee = new Date(`${dateInput}T${timeInput}:00`); // Adds midnight UTC time
//     const timestamp = Timestamp.fromDate(datee);
//     return timestamp
// }

function convert_to_timestamp(date) {
    const datee = new Date(date + "T00:00:00Z"); // Adds midnight UTC time
    const timestamp = Timestamp.fromDate(datee);
    return timestamp
}
//-------------------------------------------------------- END --------------------------------------------------------------------

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
        const errCode = error.code;
        const errMsg = error.message;
        alert(errCode + errMsg);
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
        info['tripID'] = trip;
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
    // checkin and checkout are in the form of YYYY-MM-DD 
    const checkin_t = convert_to_timestamp(checkin);
    const checkout_t = convert_to_timestamp(checkout);
    const doc_ref = doc(db, "trips", tripID);

    const new_data = {
        'h_name' : hotel_name, 
        'checkin' : checkin_t,
        'checkout' : checkout_t,
        'cost' : cost
    };
    const doc_snap =  await getDoc(doc_ref);
    const h_list = doc_snap.data().hotels;
    h_list.push(new_data);

    await updateDoc(doc_ref, {'hotels' : h_list});
}
// --------------------------------------------------------- END ------------------------------------------------------------------

//------------------------------------------------- add attraction to attraction arr ----------------------------------------------
export const add_attraction = async function add_attraction(tripID, a_name, date, cost) {
    const datee = convert_to_timestamp(date);
    const doc_ref = doc(db, "trips", tripID);

    const new_data = {
        'a_name' : a_name, 
        'date' : datee, 
        'cost' : cost
    };
    const doc_snap =  await getDoc(doc_ref);
    const a_list = doc_snap.data().attractions;
    a_list.push(new_data);

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
    const docRef = doc(db, "trips", tripID);

    const newFlights = flights.map(flight => ({
        arrival_city: flight.toCity,
        departure_city: flight.fromCity,
        departure_date: convert_to_timestamp(flight.departureDate, flight.departureTime),
        flight_no: flight.flightNumber,
        seat_no: flight.seatNumber || null,
        flight_cost: flight.flightCost || 0
    }));
    console.log(newFlights);

    // Save flights array to Firebase under the tripID
    await updateDoc(docRef, { 'flights' : newFlights });
};